import test from 'node:test';
import assert from 'node:assert/strict';
import { getProviderDefinition, listProviderDefinitions } from '../src/services/providerRegistry.js';

test('provider registry exposes stable provider definitions', () => {
	const providers = listProviderDefinitions();

	assert.equal(providers.length, 7);
	assert.deepEqual(
		providers.map((provider) => provider.id),
		['google_drive', 'onedrive', 'dropbox', 'yandex', 'mega', 'pcloud', 's3'],
	);

	for (const provider of providers) {
		assert.equal(provider.supports.multipleAccounts, true);
		assert.ok(provider.name);
		assert.ok(provider.connection);
		assert.equal(provider.adapter, undefined);
	}
});

test('unknown providers are rejected without touching account data', () => {
	assert.equal(getProviderDefinition('does_not_exist'), null);
});
