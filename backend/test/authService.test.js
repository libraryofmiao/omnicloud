import test from 'node:test';
import assert from 'node:assert/strict';

test('auth service exports the hosted authentication primitives', async () => {
	const auth = await import('../src/services/authService.js');
	assert.equal(typeof auth.hashPassword, 'function');
	assert.equal(typeof auth.verifyPassword, 'function');
	assert.equal(typeof auth.createSession, 'function');
	assert.equal(typeof auth.resolveSession, 'function');
	assert.equal(typeof auth.destroySession, 'function');
	assert.equal(typeof auth.registerHostedUser, 'function');
	assert.equal(typeof auth.loginHostedUser, 'function');
});

test('password hashing verifies the original password and rejects another password', async () => {
	const { hashPassword, verifyPassword } = await import('../src/services/authService.js');
	const stored = hashPassword('OmniCloud-test-password');
	assert.equal(verifyPassword('OmniCloud-test-password', stored), true);
	assert.equal(verifyPassword('wrong-password', stored), false);
});