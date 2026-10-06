import { createProviderAdapter } from './providerRegistry.js';

export function createAdapter(account) {
	return createProviderAdapter(account);
}
