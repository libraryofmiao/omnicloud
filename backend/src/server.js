import http from 'http';
import { WebSocketServer } from 'ws';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { LOCAL_USER_ID } from './config/database.js';
import { registerUploadSocket, unregisterUploadSocket } from './services/websocketHub.js';
import { getUploadSession } from './services/uploadSessionService.js';
import { parseCookies } from './middleware/authMiddleware.js';
import { resolveSession } from './services/authService.js';
import { runDeltaSync, scheduleSync } from './services/syncService.js';

function isNonFatalBackgroundError(error) {
	const message = error?.message || String(error || '');
	return /invalid or expired.*(token|session|authorization)|\b(401|403|409|429)\b|ESID|EAI_AGAIN|ECONNRESET|ETIMEDOUT|ENOTFOUND|rate limit|temporar(?:y|ily)|busy|congestion|server malfunction|utype/i.test(message);
}

process.on('unhandledRejection', (reason) => {
	if (isNonFatalBackgroundError(reason)) {
		console.error('Ignored non-fatal background provider error:', reason);
		return;
	}

	console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
	if (isNonFatalBackgroundError(error)) {
		console.error('Ignored non-fatal background provider error:', error);
		return;
	}

	console.error('Uncaught exception:', error);
});

const app = createApp();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/uploads' });

wss.on('connection', (socket, request) => {
	const url = new URL(request.url, `http://${request.headers.host}`);
	const uploadId = url.searchParams.get('uploadId');
	const sessionToken = url.searchParams.get('token');
	const session = uploadId ? getUploadSession(uploadId) : null;
	const cookies = parseCookies(request.headers.cookie || '');
	const authToken = cookies[env.authCookieName] || '';
	const user = env.appMode === 'local'
		? { id: LOCAL_USER_ID }
		: resolveSession(authToken);

	if (!uploadId || !sessionToken || !session || session.token !== sessionToken || !user || session.user_id !== user.id) {
		socket.close(1008, 'valid upload session is required');
		return;
	}

	registerUploadSocket(uploadId, socket);

	socket.send(
		JSON.stringify({
			type: 'socket:ready',
			uploadId,
			status: 'connected',
		}),
	);

	socket.on('close', () => {
		unregisterUploadSocket(uploadId, socket);
	});
});

scheduleSync();
if (env.appMode === 'local') {
	runDeltaSync(LOCAL_USER_ID).catch((error) => {
		console.error('Initial sync failed:', error);
	});
}

server.listen(env.port, () => {
	console.log(`OmniCloud API listening on http://localhost:${env.port}`);
});
