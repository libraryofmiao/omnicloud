import crypto from 'crypto';
import { db } from '../config/database.js';
import { env } from '../config/env.js';
import { getUserByEmail, getUserById, getOrCreateLocalUser, serializeUser } from './userService.js';

const SESSION_BYTES = 32;
const PASSWORD_MIN_LENGTH = 8;
const SINGLE_USER_ID = 'local-default-user';
const SINGLE_USER_EMAIL = 'libraryofmiao@gmail.com';
const DEFAULT_PASSWORD_HASH = '1af5320bd41b6e3d65cae82b9329e97f:a83fd167be23692fe5e407e054adf2440cf1502beceee01d98353b52bf99b991b3ba7385e61ea9de0770b2667a6aa05c6b100a9745874e4e2af70c84f1c98ca9';

function sha256(value) {
	return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeEmail(email) {
	return String(email || '').trim().toLowerCase();
}

export function hashPassword(password) {
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = crypto.scryptSync(password, salt, 64).toString('hex');
	return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
	if (!storedHash || !storedHash.includes(':')) return false;
	const [salt, expectedHash] = storedHash.split(':');
	const actualHash = crypto.scryptSync(password, salt, 64).toString('hex');
	const expected = Buffer.from(expectedHash, 'hex');
	const actual = Buffer.from(actualHash, 'hex');
	return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
}

function sessionExpiryDate() {
	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + Math.max(1, env.authSessionTtlHours));
	return expiresAt;
}

export function createSession(userId) {
	const token = crypto.randomBytes(SESSION_BYTES).toString('hex');
	const tokenHash = sha256(`${env.authSecret}:${token}`);
	const sessionId = crypto.randomUUID();
	const expiresAt = sessionExpiryDate();

	db.prepare(`
		INSERT INTO auth_sessions (id, user_id, token_hash, expires_at)
		VALUES (?, ?, ?, ?)
	`).run(sessionId, userId, tokenHash, expiresAt.toISOString());

	return { id: sessionId, token, expiresAt: expiresAt.toISOString() };
}

export function resolveSession(token) {
	if (!token) return null;
	const tokenHash = sha256(`${env.authSecret}:${token}`);
	const row = db.prepare(`
		SELECT s.id as session_id, s.user_id, s.expires_at, u.*
		FROM auth_sessions s
		INNER JOIN users u ON u.id = s.user_id
		WHERE s.token_hash = ?
	`).get(tokenHash);

	if (!row) return null;
	if (new Date(row.expires_at).getTime() <= Date.now()) {
		db.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').run(tokenHash);
		return null;
	}
	db.prepare('UPDATE auth_sessions SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?').run(row.session_id);
	return getUserById(row.user_id);
}

export function destroySession(token) {
	if (!token) return;
	const tokenHash = sha256(`${env.authSecret}:${token}`);
	db.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').run(tokenHash);
}

export function clearUserSessions(userId) {
	db.prepare('DELETE FROM auth_sessions WHERE user_id = ?').run(userId);
}

export function ensureSingleHostedUser() {
	if (env.appMode !== 'hosted') return;
	const localUser = getOrCreateLocalUser();
	if (localUser.is_local || !localUser.password_hash) {
		db.prepare(`
			UPDATE users
			SET email = ?, password_hash = ?, is_local = 0, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`).run(SINGLE_USER_EMAIL, DEFAULT_PASSWORD_HASH, SINGLE_USER_ID);
		clearUserSessions(SINGLE_USER_ID);
	}
}

export function loginHostedUser({ email, password }) {
	if (env.appMode !== 'hosted') throw new Error('Login is only available in hosted mode');
	const normalizedEmail = normalizeEmail(email);
	if (normalizedEmail !== SINGLE_USER_EMAIL) throw new Error('Invalid email or password');

	const user = getUserById(SINGLE_USER_ID);
	if (!user || user.email !== env.adminEmail || !verifyPassword(password, user.password_hash)) {
		throw new Error('Invalid email or password');
	}
	return user;
}

export function changeHostedPassword(user, { currentPassword, newPassword }) {
	if (env.appMode !== 'hosted') throw new Error('Password changes are only available in hosted mode');
	if (!user || user.id !== SINGLE_USER_ID || user.email !== SINGLE_USER_EMAIL) throw new Error('Authentication required');
	if (String(newPassword || '').length < PASSWORD_MIN_LENGTH) throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
	if (!verifyPassword(currentPassword, user.password_hash)) throw new Error('Current password is incorrect');
	if (currentPassword === newPassword) throw new Error('New password must be different from the current password');

	db.prepare(`
		UPDATE users
		SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`).run(hashPassword(newPassword), user.id);

	clearUserSessions(user.id);
	return getUserById(user.id);
}

export function getFallbackLocalUser() {
	return getOrCreateLocalUser();
}

export function getCookieOptions() {
	return {
		httpOnly: true,
		sameSite: 'lax',
		secure: env.frontendUrl.startsWith('https://'),
		path: '/',
	};
}

export function getAuthSummary(user) {
	return {
		mode: env.appMode,
		requiresAuth: env.appMode === 'hosted',
		authenticated: Boolean(user && user.id === SINGLE_USER_ID && user.email === SINGLE_USER_EMAIL),
		user: user && user.id === SINGLE_USER_ID && user.email === SINGLE_USER_EMAIL ? serializeUser(user) : null,
	};
}
