const fs = require('fs');
const OpenCC = require('../src/main.js');

const text = fs.readFileSync('test/神雕侠侣.txt', { encoding: 'utf8' }) + fs.readFileSync('test/天龙八部.txt', { encoding: 'utf8' });
const len = [...text].length;
const loopTimes = 20;

const startTime = Date.now();

OpenCC.Converter('cn', 'hk')
  .then((convert) => {
    for (let i = 0; i < loopTimes; i += 1) {
      convert(text);
    }
    const endTime = Date.now();
    console.log(`檔案共 ${len} 字，測試轉換 ${loopTimes} 次，共用時 ${endTime - startTime} 毫秒`);
  });
