import fs from 'fs';
import { variants2standard, standard2variants, presets } from './src/data-config.js';
import { fileURLToPath } from 'url';

function getAbsPath(relativePath) {
  return fileURLToPath(new URL(relativePath, import.meta.url));
}

const fileContentCache = {};

function loadFile(fileName) {
  if (!fileContentCache[fileName]) {
    fileContentCache[fileName] = fs
      .readFileSync(`node_modules/opencc-data/data/${fileName}.txt`, {
        encoding: 'utf-8'
      })
      .trimEnd()
      .split('\n')
      .map((line) => {
        const [k, vs] = line.split('\t');
        const v = vs.split(' ')[0]; // only select the first candidate, the subsequent candidates are ignored
        return [k, v];
      })
      .filter(([k, v]) => k !== v || k.length > 1) // remove “char => the same char” convertions to reduce file size
      .map(([k, v]) => k + ' ' + v)
      .join('|');
    const outputFile = getAbsPath(`./dist/esm-lib/dict/${fileName}.js`);
    const outputCode = `export default "${fileContentCache[fileName]}";\n`;
    fs.writeFileSync(outputFile, outputCode);
  }
  return fileContentCache[fileName];
}

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
    localeCollection[locale].forEach(dictName => {
      outputCode.push(`import ${dictName} from '../dict/${dictName}.js';`);
      loadFile(dictName);
    });
    outputCode.push(`\nexport default [${localeCollection[locale].join(', ')}];`);
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
