import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const initializationConfigs = Object.keys(configToOptions);
const conversionConfigs = ['s2t', 's2twp', 't2s'];

const generatedIterations = [
  100,
  1000,
  10000,
  100000,
];

const longTextPath = path.join(__dirname, 'data', 'zuozhuan.txt');

function formatMs(value) {
  if (value < 1) {
    return value.toFixed(3);
  }
  if (value < 10) {
    return value.toFixed(2);
  }
  if (value < 100) {
    return value.toFixed(1);
  }
  return value.toFixed(0);
}

function formatNumber(value) {
  return value.toLocaleString('en-US');
}

function byteLength(text) {
  return Buffer.byteLength(text, 'utf8');
}

function makeGeneratedInput(iterations) {
  let text = '';
  for (let i = 0; i < iterations; i += 1) {
    text += `Open Chinese Convert 開放中文轉換${i}\n`;
  }
  return text;
}

function readLongText() {
  if (!fs.existsSync(longTextPath)) {
    throw new Error(`OpenCC benchmark text not found: ${longTextPath}`);
  }
  return fs.readFileSync(longTextPath, 'utf8');
}

function measure(fn) {
  const start = performance.now();
  const result = fn();
  return { elapsedMs: performance.now() - start, result };
}

function averageOf(runs, fn) {
  let total = 0;
  let result;
  for (let i = 0; i < runs; i += 1) {
    const measured = measure(fn);
    total += measured.elapsedMs;
    result = measured.result;
  }
  return { elapsedMs: total / runs, result };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[middle];
  }
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function measureConversion(runs, converter, text) {
  const times = [];
  let outputBytes = 0;
  for (let i = 0; i < runs; i += 1) {
    const measured = measure(() => converter(text));
    times.push(measured.elapsedMs);
    outputBytes += byteLength(measured.result);
  }
  const totalMs = times.reduce((sum, value) => sum + value, 0);
  return {
    averageMs: totalMs / runs,
    medianMs: median(times),
    outputBytes,
  };
}

function conversionRunsFor(bytes) {
  if (bytes < 10_000) {
    return 100;
  }
  if (bytes < 100_000) {
    return 30;
  }
  if (bytes < 1_000_000) {
    return 10;
  }
  return 3;
}

function printTable(title, columns, rows) {
  const widths = columns.map((column, index) => {
    return Math.max(column.length, ...rows.map(row => String(row[index]).length));
  });
  const line = widths.map(width => '-'.repeat(width)).join('  ');
  console.log(`\n[${title}]`);
  console.log(columns.map((column, index) => column.padEnd(widths[index])).join('  '));
  console.log(line);
  for (const row of rows) {
    console.log(row.map((value, index) => String(value).padEnd(widths[index])).join('  '));
  }
}

const importStart = performance.now();
const OpenCC = await import('opencc-js');
const importMs = performance.now() - importStart;

console.log(`opencc-js benchmark`);
console.log(`node: ${process.version}`);
console.log(`module import: ${formatMs(importMs)} ms`);

const loadRows = [];
for (const config of initializationConfigs) {
  const options = configToOptions[config];
  const measured = averageOf(5, () => OpenCC.Converter(options));
  loadRows.push([
    config,
    `${formatMs(measured.elapsedMs)} ms`,
  ]);
}

printTable('Converter Initialization', ['Config', 'LoadMs'], loadRows);

const generatedInputs = generatedIterations.map(iterations => {
  const text = makeGeneratedInput(iterations);
  return { name: `generated/${iterations}`, text, bytes: byteLength(text) };
});
const longText = readLongText();
const inputs = [
  ...generatedInputs,
  { name: 'zuozhuan', text: longText, bytes: byteLength(longText) },
];

console.log(`long text: ${path.relative(path.resolve(__dirname, '..'), longTextPath)}`);

const convertRows = [];
for (const config of conversionConfigs) {
  const options = configToOptions[config];
  const converter = OpenCC.Converter(options);
  for (const input of inputs) {
    converter(input.text);
    const runs = conversionRunsFor(input.bytes);
    const measured = measureConversion(runs, converter, input.text);
    const throughput = (input.bytes / 1_000_000) / (measured.averageMs / 1000);
    convertRows.push([
      config,
      input.name,
      formatNumber(input.bytes),
      formatNumber(Math.round(measured.outputBytes / runs)),
      runs,
      `${formatMs(measured.averageMs)} ms`,
      `${formatMs(measured.medianMs)} ms`,
      `${throughput.toFixed(2)} MB/s`,
    ]);
  }
}

printTable(
  'Conversion',
  ['Config', 'Input', 'InputBytes', 'OutputBytes', 'Runs', 'AvgConvertMs', 'MedianMs', 'Throughput'],
  convertRows,
);
