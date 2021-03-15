const fs = require('fs');

function loadFile(fileName) {
  return fs
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
}

// Build data.js

const arr = [];

const fileList = [
  'HKVariants',
  'HKVariantsRev',
  'HKVariantsRevPhrases',
  'JPShinjitaiCharacters',
  'JPShinjitaiPhrases',
  'JPVariants',
  'JPVariantsRev',
  'TWPhrasesIT',
  'TWPhrasesName',
  'TWPhrasesOther',
  'TWPhrasesRev',
  'TWVariants',
  'TWVariantsRev',
  'TWVariantsRevPhrases',
];

arr.push('const OpenCCJSData = {};\n');

for (const fileName of fileList) {
  arr.push(`OpenCCJSData.${fileName} = "${loadFile(fileName)}";\n`);
}

fs.writeFileSync('data.js', arr.join('\n'));

// Build data.cn2t.js

const arr2 = [];

for (const fileName of ['STCharacters', 'STPhrases']) {
  arr2.push(`OpenCCJSData.${fileName} = "${loadFile(fileName)}";\n`);
}

fs.writeFileSync('data.cn2t.js', arr2.join('\n'));

// Build data.t2cn.js

const arr3 = [];

for (const fileName of ['TSCharacters', 'TSPhrases']) {
  arr3.push(`OpenCCJSData.${fileName} = "${loadFile(fileName)}";\n`);
}

fs.writeFileSync('data.t2cn.js', arr3.join('\n'));
