import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'omnicloud-oauth-'));
process.env.DATABASE_PATH = path.join(tempDir, 'test.db');

const { createOAuthState, consumeOAuthState } = await import('../src/services/oauthStateService.js');

test('OAuth state survives service imports and is consumed once', () => {
	const state = createOAuthState({ provider: 'google_drive', userId: 'local-default-user' });
	assert.equal(typeof state, 'string');
	assert.equal(consumeOAuthState({ provider: 'google_drive', state }).userId, 'local-default-user');
	assert.equal(consumeOAuthState({ provider: 'google_drive', state }), null);
});

test('OAuth state cannot be consumed by another provider', () => {
	const state = createOAuthState({ provider: 'dropbox', userId: 'local-default-user' });
	assert.equal(consumeOAuthState({ provider: 'google_drive', state }), null);
	assert.equal(consumeOAuthState({ provider: 'dropbox', state }).userId, 'local-default-user');
});

test('OAuth state rejects missing input', () => {
	assert.equal(consumeOAuthState({ provider: 'google_drive', state: '' }), null);
});
