import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');

test('Firestore security rules enforce Dirty Dozen protections', () => {
  const rules = fs.readFileSync(rulesPath, 'utf-8');

  // 1. Global default deny catch-all
  assert.ok(rules.includes('match /{document=**}'));
  assert.ok(rules.includes('allow read, write: if false;'));

  // 2. Email verification requirement for admin & writes
  assert.ok(rules.includes('request.auth.token.email_verified == true'));

  // 3. Bootstrapped admin email check + admins collection lookup
  assert.ok(rules.includes("request.auth.token.email == 'pedrinho.pedro248@gmail.com'"));
  assert.ok(rules.includes('exists(/databases/$(database)/documents/admins/$(request.auth.uid))'));

  // 4. Strict validation helpers and affectedKeys().hasOnly() on updates
  assert.ok(rules.includes('isValidUserProfile(incoming())'));
  assert.ok(rules.includes('isValidProgress(incoming())'));
  assert.ok(rules.includes('affectedKeys().hasOnly('));

  // 5. Relational existence check for video moduleId
  assert.ok(
    rules.includes('exists(/databases/$(database)/documents/modules/$(incoming().moduleId))')
  );

  // 6. Temporal integrity checks against request.time
  assert.ok(rules.includes('incoming().createdAt == request.time'));
  assert.ok(rules.includes('incoming().updatedAt == request.time'));
});
