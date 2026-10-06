import test from 'node:test';
import assert from 'node:assert/strict';
import { countSnapshotChanges } from '../src/services/syncService.js';

test('sync delta counts added, updated, and deleted remote metadata', () => {
	const previous = [
		{ remote_file_id: 'same', virtual_path: '/', file_name: 'same.txt', is_folder: 0, size: 10, mime_type: 'text/plain', remote_parent_id: null, remote_created_time: '2026-01-01', remote_modified_time: '2026-01-01' },
		{ remote_file_id: 'changed', virtual_path: '/', file_name: 'old.txt', is_folder: 0, size: 10, mime_type: 'text/plain', remote_parent_id: null, remote_created_time: '2026-01-01', remote_modified_time: '2026-01-01' },
		{ remote_file_id: 'deleted', virtual_path: '/', file_name: 'deleted.txt', is_folder: 0, size: 10, mime_type: 'text/plain', remote_parent_id: null, remote_created_time: '2026-01-01', remote_modified_time: '2026-01-01' },
	];
	const current = [
		{ remote_file_id: 'same', virtual_path: '/', file_name: 'same.txt', is_folder: 0, size: 10, mime_type: 'text/plain', remote_parent_id: null, remote_created_time: '2026-01-01', remote_modified_time: '2026-01-01' },
		{ remote_file_id: 'changed', virtual_path: '/', file_name: 'new.txt', is_folder: 0, size: 12, mime_type: 'text/plain', remote_parent_id: null, remote_created_time: '2026-01-01', remote_modified_time: '2026-02-01' },
		{ remote_file_id: 'added', virtual_path: '/folder/', file_name: 'added.txt', is_folder: 0, size: 5, mime_type: 'text/plain', remote_parent_id: 'folder', remote_created_time: '2026-02-01', remote_modified_time: '2026-02-01' },
	];
	assert.deepEqual(countSnapshotChanges(previous, current), { added: 1, updated: 1, deleted: 1, total: 3 });
});
