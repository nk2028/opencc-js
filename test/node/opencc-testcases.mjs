import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as OpenCC from 'opencc-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testcasesPath = path.join(__dirname, '..', 'opencc', 'testcases.json');
const testcases = JSON.parse(fs.readFileSync(testcasesPath, 'utf8'));

const configToOptions = {
  hk2s: { from: 'hk', to: 'cn' },
  hk2t: { from: 'hk', to: 't' },
  jp2t: { from: 'jp', to: 't' },
  s2hk: { from: 'cn', to: 'hk' },
  s2t: { from: 'cn', to: 't' },
  s2tw: { from: 'cn', to: 'tw' },
  s2twp: { from: 'cn', to: 'twp' },
  t2hk: { from: 't', to: 'hk' },
  t2jp: { from: 't', to: 'jp' },
  t2s: { from: 't', to: 'cn' },
  t2tw: { from: 't', to: 'tw' },
  tw2s: { from: 'tw', to: 'cn' },
  tw2sp: { from: 'twp', to: 'cn' },
  tw2t: { from: 'tw', to: 't' },
};

const converters = new Map();

function getConverter(config) {
  if (!converters.has(config)) {
    converters.set(config, OpenCC.Converter(configToOptions[config]));
  }
  return converters.get(config);
}

const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
};
const byConfig = new Map();
const failures = [];
const skippedConfigs = new Set();

for (const testCase of testcases.cases) {
  for (const [config, expected] of Object.entries(testCase.expected)) {
    if (!configToOptions[config]) {
      stats.skipped += 1;
      skippedConfigs.add(config);
      continue;
    }

    stats.total += 1;
    if (!byConfig.has(config)) {
      byConfig.set(config, { total: 0, passed: 0, failed: 0 });
    }
    const configStats = byConfig.get(config);
    configStats.total += 1;

    const actual = getConverter(config)(testCase.input);
    if (actual === expected) {
      stats.passed += 1;
      configStats.passed += 1;
    } else {
      stats.failed += 1;
      configStats.failed += 1;
      failures.push({
        id: testCase.id,
        config,
        input: testCase.input,
        expected,
        actual,
      });
    }
  }
}

console.log(`OpenCC upstream cases: ${stats.passed}/${stats.total} passed, ${stats.failed} failed, ${stats.skipped} skipped`);
if (skippedConfigs.size > 0) {
  console.log(`Skipped configs: ${Array.from(skippedConfigs).sort().join(', ')}`);
}

console.log('');
console.log('By config:');
for (const [config, configStats] of Array.from(byConfig.entries()).sort(([a], [b]) => a.localeCompare(b))) {
  console.log(`  ${config}: ${configStats.passed}/${configStats.total} passed, ${configStats.failed} failed`);
}

for (const failure of failures.slice(0, 20)) {
  console.log('');
  console.log(`${failure.id} ${failure.config}`);
  console.log(`input:    ${failure.input}`);
  console.log(`expected: ${failure.expected}`);
  console.log(`actual:   ${failure.actual}`);
}

if (failures.length > 20) {
  console.log('');
  console.log(`... ${failures.length - 20} more failures`);
}

if (stats.failed > 0) {
  process.exitCode = 1;
}
