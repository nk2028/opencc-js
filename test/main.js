'use strict';

const OpenCC = require('../opencc');

function assert(v) {
	if (v !== true)
		throw v;
}

/* Test Unicode support */

function test1() {
	const t = OpenCC._makeEmptyTrie();
	OpenCC._addWord(t, '𦫖', 'aaa');
	OpenCC._addWord(t, '的𫟃', 'bbb');
	assert(OpenCC._convert(t, '𦫖1的𫟃𩇩c') == 'aaa1bbb𩇩c');
}

/* Test character conversion */

async function test2() {
	const convert = await OpenCC.Converter('hk', 'cn');
	const converted = convert('政府初步傾向試驗為綠色專線小巴設充電裝置');
	assert(converted == '政府初步倾向试验为绿色专线小巴设充电装置');
}

/* Test word conversion */

async function test3() {
	const convert = await OpenCC.Converter('cn', 'twp');
	const converted = convert('方便面');
	assert(converted == '泡麵');
}

(async () => {
	try {
		test1();
		await test2();
		await test3();
	} catch (e) {
		console.error(e.stack);
	}
})();
