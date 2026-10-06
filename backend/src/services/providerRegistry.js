import { GoogleDriveAdapter } from '../adapters/GoogleDriveAdapter.js';
import { OneDriveAdapter } from '../adapters/OneDriveAdapter.js';
import { DropboxAdapter } from '../adapters/DropboxAdapter.js';
import { MegaAdapter } from '../adapters/MegaAdapter.js';
import { S3Adapter } from '../adapters/S3Adapter.js';
import { PCloudAdapter } from '../adapters/PCloudAdapter.js';
import { YandexAdapter } from '../adapters/YandexAdapter.js';

const providers = new Map([
	['google_drive', {
		id: 'google_drive',
		name: 'Google Drive',
		connection: 'oauth',
		adapter: GoogleDriveAdapter,
		supports: { multipleAccounts: true, shared: true, starring: true },
	}],
	['onedrive', {
		id: 'onedrive',
		name: 'OneDrive',
		connection: 'oauth',
		adapter: OneDriveAdapter,
		supports: { multipleAccounts: true, shared: true, starring: false },
	}],
	['dropbox', {
		id: 'dropbox',
		name: 'Dropbox',
		connection: 'oauth',
		adapter: DropboxAdapter,
		supports: { multipleAccounts: true, shared: true, starring: false },
	}],
	['yandex', {
		id: 'yandex',
		name: 'Yandex Disk',
		connection: 'oauth',
		adapter: YandexAdapter,
		supports: { multipleAccounts: true, shared: false, starring: false },
	}],
	['mega', {
		id: 'mega',
		name: 'MEGA',
		connection: 'credentials',
		adapter: MegaAdapter,
		supports: { multipleAccounts: true, shared: false, starring: false },
	}],
	['pcloud', {
		id: 'pcloud',
		name: 'pCloud',
		connection: 'credentials',
		adapter: PCloudAdapter,
		supports: { multipleAccounts: true, shared: false, starring: false },
	}],
	['s3', {
		id: 's3',
		name: 'S3-compatible',
		connection: 'credentials',
		adapter: S3Adapter,
		supports: { multipleAccounts: true, shared: false, starring: false },
	}],
]);

export function getProviderDefinition(providerId) {
	return providers.get(providerId) || null;
}

export function listProviderDefinitions() {
	return [...providers.values()].map(({ adapter, ...definition }) => ({ ...definition }));
}

export function createProviderAdapter(account) {
	const definition = getProviderDefinition(account.provider);
	if (!definition) {
		throw new Error(`Unsupported provider: ${account.provider}`);
	}
	return new definition.adapter(account);
}
