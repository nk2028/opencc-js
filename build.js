import fs from 'fs';
import { variants2standard, standard2variants, presets } from './src/data-config.js';
import { fileURLToPath } from 'url';

function getAbsPath(relativePath) {
  return fileURLToPath(new URL(relativePath, import.meta.url));
}

const fileContentCache = {};
const sourceDictDir = getAbsPath('./data/dictionary');

function flattenDictNames(dictGroups) {
  return dictGroups.flatMap(group => Array.isArray(group) ? group : [group]);
}

function getDictPath(fileName) {
  return `${sourceDictDir}/${fileName}.txt`;
}

function ensureReverseFile(fileName) {
  if (!fileName.endsWith('Rev')) {
    return;
  }

  const outputFile = getDictPath(fileName);
  if (fs.existsSync(outputFile)) {
    return;
  }

  const inputFile = getDictPath(fileName.slice(0, -3));
  const reversed = new Map();
  fs.readFileSync(inputFile, { encoding: 'utf-8' })
    .split('\n')
    .forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return;
      }

      const [key, values] = line.replace(/\r$/, '').split('\t');
      values.split(' ').forEach(value => {
        if (!reversed.has(value)) {
          reversed.set(value, []);
        }
        reversed.get(value).push(key);
      });
    });

  const output = Array.from(reversed.keys())
    .sort()
    .map(key => `${key}\t${reversed.get(key).join(' ')}`)
    .join('\n');
  fs.writeFileSync(outputFile, `${output}\n`);
}

function loadFile(fileName) {
  if (!fileContentCache[fileName]) {
    ensureReverseFile(fileName);
    fileContentCache[fileName] = fs
      .readFileSync(getDictPath(fileName), {
        encoding: 'utf-8'
      })
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map((line) => {
        const [k, vs] = line.split('\t');
        const v = vs.split(' ')[0]; // only select the first candidate, the subsequent candidates are ignored
        return [k, v];
      })
      .filter(([k, v]) => k !== v || k.length > 1) // remove “char => the same char” convertions to reduce file size
      .map(([k, v]) => k + ' ' + v)
      .join('|');
    const outputFile = getAbsPath(`./dist/esm-lib/dict/${fileName}.js`);
    const outputCode = `export default ${JSON.stringify(fileContentCache[fileName])};\n`;
    fs.writeFileSync(outputFile, outputCode);
  }
  return fileContentCache[fileName];
}

function getDictGroupsCode(dictGroups) {
  return `[${dictGroups.map(group => `[${group.join(', ')}]`).join(', ')}]`;
}

fs.rmSync(getAbsPath('./dist'), { recursive: true, force: true });

function getPresetCode(cfg) {
  const code = { import: [], from: [], to: [] };
  ['from', 'to'].forEach(type => {
    cfg[type].forEach(loc => {
      code.import.push(`import ${type}_${loc} from "../${type}/${loc}.js";`);
      code[type].push(`${loc}: ${type}_${loc}`);
    });
  });
  return `${code.import.join('\n')}

const fromDicts = {
    ${code.from.join(',\n    ')}
};

const toDicts = {
    ${code.to.join(',\n    ')}
};

export {fromDicts as from, toDicts as to};`;
}

// create directories if not exists.
['from', 'to', 'dict', 'preset'].forEach(d => {
  const dirpath = getAbsPath(`./dist/esm-lib/${d}`);
  if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath, { recursive: true });
  }
});

// update dict/*, from/*, to/*
['from', 'to'].forEach(type => {
  const localeCollection = type === 'from' ? variants2standard : standard2variants;
  for (const locale in localeCollection) {
    const outputFile = getAbsPath(`./dist/esm-lib/${type}/${locale}.js`);
    const outputCode = [];
    flattenDictNames(localeCollection[locale]).forEach(dictName => {
      outputCode.push(`import ${dictName} from '../dict/${dictName}.js';`);
      loadFile(dictName);
    });
    outputCode.push(`\nexport default ${getDictGroupsCode(localeCollection[locale])};`);
    fs.writeFileSync(outputFile, outputCode.join('\n'));
  }
});

// update from/index.js to/index.js
['from', 'to'].forEach(type => {
  const localeCollection = type === 'from' ? variants2standard : standard2variants;
  const locales = Object.keys(localeCollection);
  const code = locales.map(loc => `import ${loc} from "./${loc}.js";`);
  code.push('');
  code.push(`export { ${locales.join(', ')} }`);
  fs.writeFileSync(getAbsPath(`./dist/esm-lib/${type}/index.js`), code.join('\n'));
});

// update presets
presets.forEach(o => {
  fs.writeFileSync(
    getAbsPath(`./dist/esm-lib/preset/${o.filename}.js`),
    getPresetCode(o)
  );
});

// copy src/core.js to dist/core.js
fs.copyFileSync('src/main.js', 'dist/esm-lib/core.js');
