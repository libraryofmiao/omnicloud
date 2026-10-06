import cron from 'node-cron';
import { env } from '../config/env.js';
import { LOCAL_USER_ID } from '../config/database.js';
import { listUserIds } from './userService.js';
import { getActiveAccounts, markAccountStatus, updateAccountStorage } from './accountService.js';
import { createAdapter } from './adapterRegistry.js';
import { clearFilesForAccount, replaceFilesForAccount, listAllFiles, normalizeVirtualPath } from './fileService.js';
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

export function countSnapshotChanges(previousRows, remoteRows) {
	const previous = new Map(previousRows.map((row) => [String(row.remote_file_id), row]));
	const current = new Map(remoteRows.map((row) => [String(row.remote_file_id), row]));
	let added = 0;
	let updated = 0;
	let deleted = 0;

	for (const [remoteId, row] of current) {
		const before = previous.get(remoteId);
		if (!before) {
			added += 1;
			continue;
		}
		const changed = normalizeVirtualPath(row.virtual_path) !== normalizeVirtualPath(before.virtual_path)
			|| String(row.file_name || '') !== String(before.file_name || '')
			|| Boolean(row.is_folder) !== Boolean(before.is_folder)
			|| Number(row.size || 0) !== Number(before.size || 0)
			|| String(row.mime_type || '') !== String(before.mime_type || '')
			|| String(row.remote_parent_id || '') !== String(before.remote_parent_id || '')
			|| String(row.remote_created_time || '') !== String(before.remote_created_time || '')
			|| String(row.remote_modified_time || '') !== String(before.remote_modified_time || '');
		if (changed) updated += 1;
	}
	for (const remoteId of previous.keys()) {
		if (!current.has(remoteId)) deleted += 1;
	}
	return { added, updated, deleted, total: added + updated + deleted };
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
				const previousRows = listAllFiles(userId).filter((row) => row.cloud_account_id === account.id);
				const delta = countSnapshotChanges(previousRows, remoteFiles);

				replaceFilesForAccount(userId, account.id, remoteFiles);
				updateAccountStorage(userId, account.id, storage.totalSpace, storage.usedSpace);
				changesDetected += delta.total;
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

		const previousRows = listAllFiles(userId).filter((row) => row.cloud_account_id === account.id);
		const delta = countSnapshotChanges(previousRows, remoteFiles);
		replaceFilesForAccount(userId, account.id, remoteFiles);
		updateAccountStorage(userId, account.id, storage.totalSpace, storage.usedSpace);

		return {
			accountId: account.id,
			filesSynced: remoteFiles.length,
			changesDetected: delta.total,
			added: delta.added,
			updated: delta.updated,
			deleted: delta.deleted,
			totalSpace: storage.totalSpace,
			usedSpace: storage.usedSpace,
		};
	} catch (error) {
		handleSyncFailure(account, error);
		throw error;
	}
}
