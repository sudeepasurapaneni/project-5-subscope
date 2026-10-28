import assert from 'node:assert/strict';
import test from 'node:test';
import { filterFindings, parseImport, validateDomain } from './analyzer.ts';

test('validates and normalizes a hostname domain, rejecting URLs and IPs', () => {
  assert.equal(validateDomain('  Example.ORG.  '), 'example.org');
  assert.throws(() => validateDomain('https://example.org'), /hostname domain only/i);
  assert.throws(() => validateDomain('192.168.1.1'), /IP addresses/i);
});

test('matches only apex or a dot-delimited exact domain boundary', () => {
  const found = filterFindings(
    ['EXAMPLE.org.', 'api.example.org', 'badexample.org', 'example.org.attacker.test', 'other.test'],
    'example.org',
  );
  assert.deepEqual(found.map((item) => item.hostname), ['api.example.org', 'example.org']);
});

test('deduplicates case-insensitively and normalizes trailing dots', () => {
  const found = filterFindings(['API.Example.org', 'api.example.org.', 'api.example.org'], 'example.org');
  assert.equal(found.length, 1);
  assert.equal(found[0].hostname, 'api.example.org');
});

test('rejects malformed JSON imports with a useful error', () => {
  assert.throws(() => parseImport('[{"name_value":'), /Could not read JSON/i);
  assert.throws(() => parseImport('{"records":[]}'), /must contain/i);
});

test('applies the larger file limit separately from the pasted-text limit', () => {
  const largeText = 'a'.repeat(1_000_001);
  assert.equal(parseImport(largeText, 2 * 1024 * 1024).length, 1);
  assert.throws(() => parseImport(largeText, 1_000_000), /Pasted text is over/i);
});
