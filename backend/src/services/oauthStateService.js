import { randomUUID } from 'crypto';
import { db } from '../config/database.js';

const DEFAULT_TTL_MS = 10 * 60 * 1000;

function purgeExpiredStates() {
	db.prepare("DELETE FROM oauth_states WHERE expires_at <= datetime('now')").run();
}

export function createOAuthState({ provider, userId, ttlMs = DEFAULT_TTL_MS }) {
	purgeExpiredStates();
	const state = randomUUID();
	const expiresAt = new Date(Date.now() + ttlMs).toISOString();

	db.prepare(`
		INSERT INTO oauth_states (state, provider, user_id, expires_at)
		VALUES (?, ?, ?, ?)
	`).run(state, provider, userId, expiresAt);

	return state;
}

export function consumeOAuthState({ provider, state }) {
	if (!provider || !state) return null;
	purgeExpiredStates();

	const row = db.prepare(`
		SELECT state, provider, user_id, expires_at
		FROM oauth_states
		WHERE state = ? AND provider = ?
	`).get(state, provider);

	if (!row) return null;

	db.prepare('DELETE FROM oauth_states WHERE state = ?').run(state);

	if (new Date(row.expires_at).getTime() <= Date.now()) return null;

	return {
		userId: row.user_id,
		provider: row.provider,
		expiresAt: row.expires_at,
	};
}

export function clearOAuthStatesForUser(userId) {
	db.prepare('DELETE FROM oauth_states WHERE user_id = ?').run(userId);
}
