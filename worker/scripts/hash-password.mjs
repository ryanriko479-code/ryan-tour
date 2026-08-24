#!/usr/bin/env node
// ==========================================================
// hash-password.mjs — generates the SHA-256 hash to put in
// ADMIN_CREDENTIALS for a given password. Runs entirely locally,
// no network calls — safe to use with real passwords.
//
// Usage:
//   node scripts/hash-password.mjs "yourStrongPassword"
// ==========================================================

import { createHash } from 'node:crypto';

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "<password>"');
  process.exit(1);
}

if (password.length < 10) {
  console.warn('⚠️  That password is under 10 characters — consider something longer for an admin account.');
}

const hash = createHash('sha256').update(password, 'utf8').digest('hex');

console.log('\nAdd this entry to your ADMIN_CREDENTIALS secret JSON:\n');
console.log(JSON.stringify({ email: 'admin@ryantours.com', name: 'Admin User', passwordHash: hash }, null, 2));
console.log('\n(Replace the email/name — the hash is what matters.)');
