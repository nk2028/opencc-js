const chai = require('chai');
const OpenCC = require('opencc-js');

chai.should();

(function test1() {
  const trie = new OpenCC.Trie();
  trie.addWord('abc', '123');
  trie.addWord('abcd', '4');
  trie.convert('ab').should.equal('ab');
  trie.convert('abc').should.equal('123');
  trie.convert('abcd').should.equal('4');
  trie.convert('abcde').should.equal('4e');
  trie.convert('dabc').should.equal('d123');
  trie.convert('dabcd').should.equal('d4');
}());

(function test2() {
  const trie = new OpenCC.Trie();
  trie.addWord('𦫖𩇩', 'aaa');
  trie.addWord('的𫟃', 'bbb');
  trie.convert('𦫖𩇩𭞂的𫟃').should.equal('aaa𭞂bbb');
  trie.convert('𦫖𭞂𩇩的𫟃').should.equal('𦫖𭞂𩇩bbb');
}());

(function test3() {
  const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
  converter('政府初步傾向試驗為綠色專線小巴設充電裝置').should.equal('政府初步倾向试验为绿色专线小巴设充电装置');
}());

(function test4() {
  const converter = OpenCC.Converter({ from: 't', to: 'cn' });
  converter('漢語').should.equal('汉语');
}());

(function test5() {
  const converter = OpenCC.Converter({ from: 'cn', to: 'twp' });
  converter('方便面').should.equal('泡麵');
}());

(function test6() {
  const converter = OpenCC.CustomConverter([
    ['香蕉', '🍌️'],
    ['蘋果', '🍎️'],
    ['梨', '🍐️'],
  ]);
  converter('香蕉蘋果梨').should.equal('🍌️🍎️🍐️');
})();

(function test7() {
  const documentedConverter = OpenCC.ConverterFactory(OpenCC.Locale.from.cn, OpenCC.Locale.to.hk);
  documentedConverter('SKU').should.equal('SKU');
  documentedConverter('纽西兰 Southern Stations 和牛').should.equal('紐西蘭 Southern Stations 和牛');

  const expandedConverter = OpenCC.ConverterFactory(...OpenCC.Locale.from.cn, ...OpenCC.Locale.to.hk);
  expandedConverter('SKU').should.equal('SKU');
  expandedConverter('纽西兰 Southern Stations 和牛').should.equal('紐西蘭 Southern Stations 和牛');
})();

(function test8() {
  const customDict = [['“', '「'], ['”', '」']];
  const converter = OpenCC.ConverterFactory(OpenCC.Locale.from.cn, OpenCC.Locale.to.tw.concat([customDict]));
  converter('悟空道：“师父又来了。”').should.equal('悟空道：「師父又來了。」');
})();

(function test9() {
  OpenCC.ConverterFactory([[['a', 'b']]])('a').should.equal('b');
  OpenCC.ConverterFactory(['a b|c d'])('ac').should.equal('bd');
  (() => OpenCC.ConverterFactory([['a', 'b']])('a')).should.throw(TypeError, /dictionary entry/);
  (() => OpenCC.ConverterFactory('a b')('a')).should.throw(TypeError, /ConverterFactory argument/);
  (() => OpenCC.ConverterFactory(['a'])('a')).should.throw(TypeError, /source replacement/);
})();

(function test10() {
  (() => OpenCC.Converter({ from: 'unknown', to: 'hk' })).should.throw(Error, /Unknown `from` locale/);
  (() => OpenCC.Converter({ from: 'cn', to: 'unknown' })).should.throw(Error, /Unknown `to` locale/);
  (() => OpenCC.Converter({ from: 'cn' })).should.throw(Error, /`to` option/);
})();

(function test11() {
  const legacyOptions = [
    { from: 'cn', to: 't' },
    { from: 'cn', to: 'hk' },
    { from: 'cn', to: 'tw' },
    { from: 'cn', to: 'twp' },
    { from: 'cn', to: 'jp' },
    { from: 't', to: 'cn' },
    { from: 't', to: 'hk' },
    { from: 't', to: 'tw' },
    { from: 't', to: 'jp' },
    { from: 'hk', to: 'cn' },
    { from: 'hk', to: 't' },
    { from: 'tw', to: 'cn' },
    { from: 'tw', to: 't' },
    { from: 'twp', to: 'cn' },
    { from: 'jp', to: 't' },
    { from: 'jp', to: 'cn' },
  ];

  for (const options of legacyOptions) {
    OpenCC.Converter(options)('汉語').should.be.a('string');
  }
})();
