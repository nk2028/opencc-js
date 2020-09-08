'use strict';

const chai = require('chai');
const should = chai.should();
const OpenCC = require('../src/main.js');

(function test1() {
	const t = new Map();
	OpenCC._addWord(t, '𦫖𩇩', 'aaa');
	OpenCC._addWord(t, '的𫟃', 'bbb');
	OpenCC._convert(t, '𦫖𩇩𭞂的𫟃').should.equal('aaa𭞂bbb');
	OpenCC._convert(t, '𦫖𭞂𩇩的𫟃').should.equal('𦫖𭞂𩇩bbb');
})();

(function test2() {
	OpenCC.Converter('hk', 'cn')
	.then(convert => convert('政府初步傾向試驗為綠色專線小巴設充電裝置'))
	.then(converted => converted.should.equal('政府初步倾向试验为绿色专线小巴设充电装置'));
})();

(function test3() {
	OpenCC.Converter('cn', 'twp')
	.then(convert => convert('方便面'))
	.then(converted => converted.should.equal('泡麵'));
})();
