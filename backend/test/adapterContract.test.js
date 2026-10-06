import test from 'node:test';
import assert from 'node:assert/strict';
import { BaseCloudAdapter } from '../src/adapters/BaseCloudAdapter.js';
import { DropboxAdapter } from '../src/adapters/DropboxAdapter.js';
import { GoogleDriveAdapter } from '../src/adapters/GoogleDriveAdapter.js';
import { MegaAdapter } from '../src/adapters/MegaAdapter.js';
import { OneDriveAdapter } from '../src/adapters/OneDriveAdapter.js';
import { PCloudAdapter } from '../src/adapters/PCloudAdapter.js';
import { S3Adapter } from '../src/adapters/S3Adapter.js';
import { YandexAdapter } from '../src/adapters/YandexAdapter.js';

const adapters = [
	['google_drive', GoogleDriveAdapter],
	['onedrive', OneDriveAdapter],
	['dropbox', DropboxAdapter],
	['mega', MegaAdapter],
	['pcloud', PCloudAdapter],
	['s3', S3Adapter],
	['yandex', YandexAdapter],
];

test('all supported adapters expose the common contract', () => {
	for (const [provider, Adapter] of adapters) {
		const adapter = new Adapter({ id: 'test-account', provider, email: 'test@example.com', encrypted_credentials: '' });
		for (const method of ['fetchStructure', 'getStorageSummary', 'uploadStream', 'createFolder', 'getDownloadStream', 'renameFile', 'deleteFile', 'getFileDetails', 'listSharedWithMe', 'listSharedFolderChildren', 'setFileStarred']) {
			assert.equal(typeof adapter[method], 'function', provider + ' must implement/inherit ' + method);
		}
		assert.equal(typeof adapter.getCapabilities, 'function', provider + ' must expose capabilities');
		const capabilities = adapter.getCapabilities();
		assert.equal(typeof capabilities.starred, 'boolean');
	}
});

test('base adapter is safe as a provider-neutral fallback', () => {
	const adapter = new BaseCloudAdapter({ provider: 'test' });
	assert.equal(adapter.getCapabilities().starred, false);
});
