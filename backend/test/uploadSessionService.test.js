import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createUploadSession,
  getUploadSessionForUserWithToken,
  getUploadSessionForUser,
  removeUploadSession,
} from '../src/services/uploadSessionService.js';

test('upload session token is required and scoped to the owning user', () => {
  const session = createUploadSession({ user_id: 'user-a', file_name: 'example.txt', size: 7 });
  assert.ok(session.token);

  assert.equal(
    getUploadSessionForUserWithToken('user-a', session.id, session.token)?.id,
    session.id,
  );
  assert.equal(getUploadSessionForUserWithToken('user-a', session.id, 'wrong-token'), null);
  assert.equal(getUploadSessionForUserWithToken('user-b', session.id, session.token), null);

  removeUploadSession(session.id);
  assert.equal(getUploadSessionForUser('user-a', session.id), null);
});
