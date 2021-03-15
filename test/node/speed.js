const fs = require('fs');
const path = require('path');
const OpenCC = require('../../bundle');

const text = fs.readFileSync(path.join(__dirname, '..', '神雕侠侣.txt'), { encoding: 'utf8' })
  + fs.readFileSync(path.join(__dirname, '..', '天龙八部.txt'), { encoding: 'utf8' });
const len = [...text].length;
const loopTimes = 20;

const startTime = Date.now();

const converter = OpenCC.Converter({ from: 'cn', to: 'hk' });
for (let i = 0; i < loopTimes; i += 1) {
  converter(text);
}

const endTime = Date.now();
console.log(`檔案共 ${len} 字，測試轉換 ${loopTimes} 次，共用時 ${endTime - startTime} 毫秒`);
