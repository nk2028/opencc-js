'use strict';

const OpenCC = require('./opencc');

function assert(v) {
	if (v !== true)
		throw v;
}

/* Test basic function */

function test1() {
	const compareResult = (a, b) => a[0] === b[0] && a[1] === b[1];

	const t = OpenCC._makeEmptyTrie();
	OpenCC._addWord(t, '作', 'zuo4');
	OpenCC._addWord(t, '作坊', 'zuofang');
	OpenCC._addWord(t, '作死', 'zuo1si3');
	OpenCC._addWord(t, '作死死', 'zuosi3xx');
	assert(compareResult(OpenCC._longestPrefix(t, '作死死活'), ['作死死', 'zuosi3xx']));
	assert(compareResult(OpenCC._longestPrefix(t, '作死'), ['作死', 'zuo1si3']));
	assert(compareResult(OpenCC._longestPrefix(t, '作動'), ['作', 'zuo4']));
	assert(compareResult(OpenCC._longestPrefix(t, '作'), ['作', 'zuo4']));
}

/* Test Unicode support */

function test2() {
	const t = OpenCC._makeEmptyTrie();
	OpenCC._addWord(t, '𦫖', 'aaa');
	OpenCC._addWord(t, '的𫟃', 'bbb');
	assert(OpenCC._convert(t, '𦫖1的𫟃𩇩c') == 'aaa1bbb𩇩c');
}

/* Test character conversion */

async function test3() {
	const cc = await OpenCC.PresetConverter({ fromVariant: 'hk', toVariant: 'cn' });
	const converted = cc.convert('政府初步傾向試驗為綠色專線小巴設充電裝置');
	assert(converted == '政府初步倾向试验为绿色专线小巴设充电装置');
}

/* Test word conversion */

async function test4() {
	const cc = await OpenCC.PresetConverter({ fromVariant: 'cn', toVariant: 'twp' });
	const converted = cc.convert('方便面');
	assert(converted == '泡麵');
}

(async () => {
	try {
		test1();
		test2();
		await test3();
		await test4();
	} catch (e) {
		console.error(e.stack);
	}
})();
