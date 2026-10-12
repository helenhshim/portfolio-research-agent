import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSecUserAgent } from '../scripts/sec-preflight.mjs';
test('rejects absent or malformed identity before retrieval', () => {
  for (const value of [undefined, '', 'AnonymousBot', 'person@example.com', 'App\r\nX-Test: person@example.com']) {
    assert.throws(() => validateSecUserAgent(value));
  }
});
test('accepts configured app identity and operator contact', () => {
  assert.equal(validateSecUserAgent(' ResearchPrototype contact@example.com '), 'ResearchPrototype contact@example.com');
});
