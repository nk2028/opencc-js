import fs from 'fs';
import { conversionConfigs, generatedReverseDicts, variants2standard, standard2variants, presets } from './src/data-config.js';
import { fileURLToPath } from 'url';

function getAbsPath(relativePath) {
  return fileURLToPath(new URL(relativePath, import.meta.url));
}

const fileContentCache = {};
const parsedFileCache = {};
const sourceDictDir = getAbsPath('./node_modules/opencc-data/data');

function flattenDictNames(dictGroups) {
  return dictGroups.flatMap(group => Array.isArray(group) ? group : [group]);
}

function getDictPath(fileName) {
  return `${sourceDictDir}/${fileName}.txt`;
}

function parseSourceFile(fileName) {
  if (!parsedFileCache[fileName]) {
    parsedFileCache[fileName] = fs
      .readFileSync(getDictPath(fileName), {
        encoding: 'utf-8'
      })
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map((line) => {
        const [k, vs] = line.split('\t');
        return [k, vs.split(' ')];
      });
  }
  return parsedFileCache[fileName];
}

function reverseEntries(entries) {
  const reversed = new Map();
  entries.forEach(([key, values]) => {
    values.forEach(value => {
      if (!reversed.has(value)) {
        reversed.set(value, []);
      }
      reversed.get(value).push(key);
    });
  });
  return Array.from(reversed.entries())
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, values]) => [key, values]);
}

function getEntries(fileName) {
  if (generatedReverseDicts[fileName]) {
    return reverseEntries(parseSourceFile(generatedReverseDicts[fileName]));
  }
  return parseSourceFile(fileName);
}

function loadFile(fileName) {
  if (!fileContentCache[fileName]) {
    fileContentCache[fileName] = getEntries(fileName)
      .map(([k, values]) => [k, values[0]]) // only select the first candidate, the subsequent candidates are ignored
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

function getDictGroupsCodeWithPrefix(dictGroups, prefix) {
  return `[${dictGroups.map(group => `[${group.map(dictName => `${prefix}${dictName}`).join(', ')}]`).join(', ')}]`;
}

fs.rmSync(getAbsPath('./dist'), { recursive: true, force: true });

function getPresetCode(cfg) {
  const code = { import: [], dictImport: [], from: [], to: [], configs: [] };
  ['from', 'to'].forEach(type => {
    cfg[type].forEach(loc => {
      code.import.push(`import ${type}_${loc} from "../${type}/${loc}.js";`);
      code[type].push(`${loc}: ${type}_${loc}`);
    });
  });

  function presetIncludesConfig(config) {
    if (cfg.filename === 'full') {
      return true;
    }
    if (cfg.filename === 'cn2t') {
      return config.from === 'cn' && (config.to === 't' || cfg.to.includes(config.to));
    }
    if (cfg.filename === 't2cn') {
      return config.to === 'cn' && (config.from === 't' || cfg.from.includes(config.from));
    }
    return cfg.from.includes(config.from) && cfg.to.includes(config.to);
  }

  const presetConfigs = Object.entries(conversionConfigs)
    .filter(([, config]) => presetIncludesConfig(config));
  const configDictNames = new Set();
  presetConfigs.forEach(([, config]) => {
    configDictNames.add(config.segmentation);
    config.chain.flat().forEach(dictName => configDictNames.add(dictName));
  });
  Array.from(configDictNames).sort().forEach(dictName => {
    code.dictImport.push(`import dict_${dictName} from "../dict/${dictName}.js";`);
    loadFile(dictName);
  });
  presetConfigs.forEach(([name, config]) => {
    code.configs.push(`${name}: { segmentation: dict_${config.segmentation}, conversionChain: ${getDictGroupsCodeWithPrefix(config.chain, 'dict_')} }`);
  });

  return `${code.import.join('\n')}
${code.dictImport.join('\n')}

const fromDicts = {
    ${code.from.join(',\n    ')}
};

const toDicts = {
    ${code.to.join(',\n    ')}
};

const configs = {
    ${code.configs.join(',\n    ')}
};

export {fromDicts as from, toDicts as to, configs};`;
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
