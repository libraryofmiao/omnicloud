import { Router } from 'express';
import { env } from '../config/env.js';
import {
	changeHostedPassword,
	clearUserSessions,
	createSession,
	destroySession,
	ensureSingleHostedUser,
	getAuthSummary,
	loginHostedUser,
} from '../services/authService.js';
import { parseCookies, requireAppUser } from '../middleware/authMiddleware.js';

const router = Router();

function setAuthCookie(res, token) {
	const options = res.locals.authCookieOptions || {};
	res.cookie(env.authCookieName, token, options);
}

function clearAuthCookie(res) {
	const options = res.locals.authCookieOptions || {};
	res.clearCookie(env.authCookieName, { ...options, maxAge: 0 });
}

ensureSingleHostedUser();

router.get('/auth/me', (req, res) => {
	res.json({ data: getAuthSummary(req.user) });
});

router.post('/auth/login', (req, res, next) => {
	try {
		const user = loginHostedUser(req.body || {});
		const session = createSession(user.id);
		setAuthCookie(res, session.token);
		res.json({ data: getAuthSummary(user) });
	} catch (error) {
		next(error);
	}
});

router.post('/auth/change-password', requireAppUser, (req, res, next) => {
	try {
		const user = changeHostedPassword(req.user, req.body || {});
		const session = createSession(user.id);
		setAuthCookie(res, session.token);
		res.json({ data: getAuthSummary(user) });
	} catch (error) {
		next(error);
	}
});

router.post('/auth/logout', (req, res) => {
	const cookies = parseCookies(req.headers.cookie || '');
	const token = cookies[env.authCookieName] || '';
	if (token) destroySession(token);
	clearAuthCookie(res);
	res.json({ data: getAuthSummary(env.appMode === 'local' ? req.user : null) });
});

export default router;
