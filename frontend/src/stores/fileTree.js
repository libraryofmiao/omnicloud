import { defineStore } from 'pinia';
import { api } from '../services/api';

function buildBreadcrumbs(currentPath) {
	const normalized = currentPath === '/' ? '/' : currentPath.replace(/^\/+|\/+$/g, '');
	if (normalized === '/') return [{ label: 'Root', path: '/' }];

	const segments = normalized.split('/').filter(Boolean);
	const breadcrumbs = [{ label: 'Root', path: '/' }];
	let pathAccumulator = '';

	segments.forEach((segment) => {
		pathAccumulator += `/${segment}`;
		breadcrumbs.push({
			label: segment,
			path: `${pathAccumulator}/`,
		});
	});

	return breadcrumbs;
}

export const useFileTreeStore = defineStore('fileTree', {
	state: () => ({
		currentPath: '/',
		pendingPath: null,
		pendingHighlightId: null,
		files: [],
		filteredFiles: [],
		breadcrumbs: [{ label: 'Root', path: '/' }],
		searchTerm: '',
		isLoading: false,
		error: null,
		searchRequestId: 0,
	}),
	actions: {
		async loadFiles(path = this.currentPath) {
			this.isLoading = true;
			this.error = null;
			try {
				const { data } = await api.listFiles(path);
				this.currentPath = path;
				this.files = data;
				this.breadcrumbs = buildBreadcrumbs(path);
				this.applySearch(this.searchTerm);
			} catch (error) {
				this.error = error.message;
			} finally {
				this.isLoading = false;
			}
		},
		async search(term) {
			this.searchTerm = term;
			const lowered = String(term || '').trim();
			const requestId = ++this.searchRequestId;
			if (!lowered) {
				return this.loadFiles(this.currentPath);
			}
			this.isLoading = true;
			this.error = null;
			try {
				const { data } = await api.searchFiles(lowered, 100);
				if (requestId !== this.searchRequestId) return;
				this.files = data;
				this.filteredFiles = data;
				this.breadcrumbs = [{ label: 'Search', path: this.currentPath }];
			} catch (error) {
				if (requestId === this.searchRequestId) this.error = error.message;
			} finally {
				if (requestId === this.searchRequestId) this.isLoading = false;
			}
		},
		applySearch(term) {
			this.searchTerm = term;
			const lowered = term.trim().toLowerCase();
			this.filteredFiles = !lowered
				? this.files
				: this.files.filter((file) =>
					(file.display_name || file.file_name).toLowerCase().includes(lowered),
				);
		},
		navigate(path) {
			return this.loadFiles(path);
		},
	},
});
