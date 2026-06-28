import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as OpenCC from 'opencc-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const goldenDir = path.join(__dirname, '..', 'golden');
const inputName = 'us_constitution_zhs.txt';
const inputPath = path.join(goldenDir, 'input', inputName);

const cases = [
  ['s2hk', { from: 'cn', to: 'hk' }],
  ['s2t', { from: 'cn', to: 't' }],
  ['s2tw', { from: 'cn', to: 'tw' }],
  ['s2twp', { from: 'cn', to: 'twp' }],
];

function firstDiffLine(expected, actual) {
  const expectedLines = expected.split('\n');
  const actualLines = actual.split('\n');
  const lineCount = Math.max(expectedLines.length, actualLines.length);
  for (let i = 0; i < lineCount; i += 1) {
    if (expectedLines[i] !== actualLines[i]) {
      return i;
    }
  }
  return -1;
}

function formatDiffSnippet(expected, actual) {
  const expectedLines = expected.split('\n');
  const actualLines = actual.split('\n');
  const diffLine = firstDiffLine(expected, actual);
  if (diffLine < 0) {
    return '';
  }

  const start = Math.max(0, diffLine - 2);
  const end = Math.min(Math.max(expectedLines.length, actualLines.length), diffLine + 3);
  const parts = [];
  for (let i = start; i < end; i += 1) {
    if (expectedLines[i] === actualLines[i]) {
      parts.push(` ${i + 1}: ${expectedLines[i] ?? ''}`);
    } else {
      parts.push(`-${i + 1}: ${expectedLines[i] ?? ''}`);
      parts.push(`+${i + 1}: ${actualLines[i] ?? ''}`);
    }
  }
  return parts.join('\n');
}

const input = fs.readFileSync(inputPath, 'utf8');

for (const [config, options] of cases) {
  const converter = OpenCC.Converter(options);
  const actual = converter(input);
  const outputName = `${path.basename(inputName, '.txt')}.${config}.txt`;
  const expectedPath = path.join(goldenDir, 'output', outputName);
  const expected = fs.readFileSync(expectedPath, 'utf8');
  assert.equal(
    actual,
    expected,
    `${config} golden output changed\n${formatDiffSnippet(expected, actual)}`
  );
}

console.log(`OpenCC golden cases: ${cases.length}/${cases.length} passed`);
