import cron from 'node-cron';
import { env } from '../config/env.js';
import { LOCAL_USER_ID } from '../config/database.js';
import { listUserIds } from './userService.js';
import { getActiveAccounts, markAccountStatus, updateAccountStorage } from './accountService.js';
import { createAdapter } from './adapterRegistry.js';
import { clearFilesForAccount, replaceFilesForAccount } from './fileService.js';
import { isAuthError, withRetry } from '../utils/providerErrors.js';

async function fetchAccountSnapshot(account) {
	return withRetry(
		async () => {
			const adapter = createAdapter(account);
			const remoteFiles = await adapter.fetchStructure();
			const storage = await adapter.getStorageSummary();
			return { remoteFiles, storage };
		},
		{
			retries: 3,
			onRetry: (error, attempt) => {
				console.warn(
					`Transient sync error for ${account.email} (attempt ${attempt}), retrying:`,
					error?.message || error,
				);
			},
		},
	);
}

function handleSyncFailure(account, error) {
	if (isAuthError(error)) {
		clearFilesForAccount(account.user_id, account.id);
		markAccountStatus(account.user_id, account.id, 'invalid_token');
		console.error(`Auth error for account ${account.email}, marked invalid_token:`, error.message);
		return;
	}

	console.error(
		`Transient sync failure for account ${account.email} (kept connected):`,
		error.message,
	);
}

const syncReports = new Map();
const activeSyncPromises = new Map();

export async function runDeltaSync(userId) {
	if (activeSyncPromises.has(userId)) {
		return activeSyncPromises.get(userId);
	}

	const syncPromise = (async () => {
		const accounts = getActiveAccounts(userId);
		let changesDetected = 0;

		for (const account of accounts) {
			try {
				const { remoteFiles, storage } = await fetchAccountSnapshot(account);

				replaceFilesForAccount(userId, account.id, remoteFiles);
				updateAccountStorage(userId, account.id, storage.totalSpace, storage.usedSpace);
				changesDetected += remoteFiles.length;
			} catch (error) {
				handleSyncFailure(account, error);
			}
		}

		const report = {
			lastRunAt: new Date().toISOString(),
			userId,
			scannedAccounts: accounts.length,
			changesDetected,
		};
		syncReports.set(userId, report);

		return report;
	})();

	try {
		return await syncPromise;
	} finally {
		activeSyncPromises.delete(userId);
	}
}

export function scheduleSync() {
	const interval = Math.max(1, env.syncIntervalMinutes);
	cron.schedule(`*/${interval} * * * *`, () => {
		const userIds = env.appMode === 'local' ? [LOCAL_USER_ID] : listUserIds();
		for (const userId of userIds) {
			runDeltaSync(userId).catch((error) => {
			console.error(`Delta sync failed for user ${userId}:`, error);
		});
		}
	});
}

export function getLastSyncReport(userId = null) {
	if (userId) {
		return {
			...(syncReports.get(userId) || {
				lastRunAt: null,
				userId,
				scannedAccounts: 0,
				changesDetected: 0,
			}),
			isRunning: activeSyncPromises.has(userId),
		};
	}

	return {
		lastRunAt: null,
		userId: null,
		scannedAccounts: 0,
		changesDetected: 0,
		isRunning: activeSyncPromises.size > 0,
	};
}

export async function syncAccount(userId, account) {
	try {
		const { remoteFiles, storage } = await fetchAccountSnapshot(account);

		replaceFilesForAccount(userId, account.id, remoteFiles);
		updateAccountStorage(userId, account.id, storage.totalSpace, storage.usedSpace);

		return {
			accountId: account.id,
			filesSynced: remoteFiles.length,
			totalSpace: storage.totalSpace,
			usedSpace: storage.usedSpace,
		};
	} catch (error) {
		handleSyncFailure(account, error);
		throw error;
	}
}
