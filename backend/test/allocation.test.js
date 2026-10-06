import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/config/database.js';
import { createUser } from '../src/services/userService.js';
import { upsertCloudAccount } from '../src/services/accountService.js';
import { setAllocationConfig, getAllocationConfig } from '../src/services/allocationService.js';
import { selectBestAccount } from '../src/services/spaceAllocator.js';

test('allocation rejects unknown or duplicate account order entries', async () => {
	const { randomUUID } = await import('node:crypto');
	const userId = randomUUID();
	createUser({ id: userId, email: `${userId}@test.invalid`, passwordHash: 'test' });
	const account = upsertCloudAccount({
		userId, id: randomUUID(), email: 'one@test.invalid', provider: 's3',
		accountKey: `${userId}:one`, credentials: { secret: 'test' },
		total_space: 1000, used_space: 0, status: 'active',
	});
	assert.throws(() => setAllocationConfig(userId, { order: [account.id, account.id] }), /duplicate/i);
	assert.throws(() => setAllocationConfig(userId, { order: ['missing-account'] }), /unavailable/i);
	db.prepare('DELETE FROM users WHERE id = ?').run(userId);
});

test('allocator never selects an account that cannot fit the requested upload', async () => {
	const { randomUUID } = await import('node:crypto');
	const userId = randomUUID();
	createUser({ id: userId, email: `${userId}@test.invalid`, passwordHash: 'test' });
	upsertCloudAccount({
		userId, id: randomUUID(), email: 'small@test.invalid', provider: 's3',
		accountKey: `${userId}:small`, credentials: { secret: 'test' },
		total_space: 100, used_space: 100, status: 'active',
	});
	assert.throws(() => selectBestAccount(userId, 1), /enough free space/i);
	db.prepare('DELETE FROM users WHERE id = ?').run(userId);
});