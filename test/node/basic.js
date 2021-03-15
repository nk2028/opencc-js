const chai = require('chai');
const OpenCC = require('../../bundle-node');

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
  const converter = OpenCC.Converter({ from: 'cn', to: 'twp' });
  converter('方便面').should.equal('泡麵');
}());

(function test5() {
  const converter = OpenCC.CustomConverter([
    ['香蕉', '🍌️'],
    ['蘋果', '🍎️'],
    ['梨', '🍐️'],
  ]);
  converter('香蕉蘋果梨').should.equal('🍌️🍎️🍐️');
})();
