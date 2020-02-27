'use strict';

const OpenCC2 = {
	/* Trie */

	_makeEmptyTrie: () => {
		return [{} /* child nodes */ /* , v */];
	},

	_addWord: (t, s, v) => {
		for (const c of s) {
			const nodes = t[0];
			if (!(c in nodes)) {
				nodes[c] = OpenCC2._makeEmptyTrie();
			}
			t = nodes[c];
		}
		t.push(v);
	},

	_hasValue: t => {
		return t.length == 2;
	},

	_longestPrefix: (t, s) => {
		const res = [];
		let cur = [], target;
		for (const c of s) {
			cur.push(c);
			const nodes = t[0];
			if (!(c in nodes))
				break;
			t = nodes[c];
			if (OpenCC2._hasValue(t)) {
				target = t[1];
				res.push(...cur);
				cur = [];
			}
		}
		if (res.length)
			return [res.join(''), target];  // k, v
	},

	/* Load dict */

	_load_dict: async (s, type) => {
		const DICT_ROOT = 'https://sgalal.github.io/opencc2-dict/data/';

		const DICT_FROM = { 'cn': ['STCharacters', 'STPhrases']
			, 'hk': ['HKVariantsRev', 'HKVariantsRevPhrases']
			, 'tw': ['TWVariantsRev', 'TWVariantsRevPhrases']
			, 'twp': ['TWVariantsRev', 'TWVariantsRevPhrases', 'TWPhrasesRev']
			, 'jp': ['JPVariantsRev']
			},
			DICT_TO = { 'cn': ['TSCharacters', 'TSPhrases']
			, 'hk': ['HKVariants', 'HKVariantsPhrases']
			, 'tw': ['TWVariants']
			, 'twp': ['TWVariants', 'TWPhrasesIT', 'TWPhrasesName', 'TWPhrasesOther']
			, 'jp': ['JPVariants']
			};

		async function getDictText(url) {
			const response = await fetch(DICT_ROOT + url + '.txt');
			const mytext = await response.text();
			return mytext;
		}

		let DICTS;
		if (type == 'from')
			DICTS = DICT_FROM[s];
		else if (type == 'to')
			DICTS = DICT_TO[s];
		const t = OpenCC2._makeEmptyTrie();
		for (const DICT of DICTS) {
			const txt = await getDictText(DICT);
			const lines = txt.split('\n');
			for (const line of lines) {
				if (line && !line.startsWith('#')) {
					const [l, r] = line.split('\t');
					OpenCC2._addWord(t, l, r.split(' ')[0]);  // 若有多個候選，只選擇第一個
				}
			}
		}
		return t;
	},

	_convert: (t, s) => {
		const res = [];
		while (s.length) {
			const prefix = OpenCC2._longestPrefix(t, s);
			if (prefix) {
				const [k, v] = prefix;
				res.push(v);
				s = s.slice(k.length);
			} else {
				const k = s[Symbol.iterator]().next().value;  // Unicode-aware version of s[0]
				res.push(k);
				s = s.slice(k.length);
			}
		}
		return res.join('');
	},

	/* Converter */

	Converter: {
		create: async config => {
			const dict_from = config.from_variant == 't' ? null : await OpenCC2._load_dict(config.from_variant, 'from'),
				dict_to = config.to_variant == 't' ? null : await OpenCC2._load_dict(config.to_variant, 'to');
			return {
				convert: s => {
					if (config.from_variant != 't')
						s = OpenCC2._convert(dict_from, s);
					if (config.to_variant != 't')
						s = OpenCC2._convert(dict_to, s);
					return s;
				}
			}
		}
	}
}

/* function _test() {
	const t = OpenCC2._makeEmptyTrie();
	OpenCC2._addWord(t, 'c', 'aaa');
	OpenCC2._addWord(t, 'd', 'bbb');
	OpenCC2._addWord(t, 'da', 'ccc');
	console.log(OpenCC2._longestPrefix(t, 'c'), ['c', 'aaa']);
	console.log(OpenCC2._longestPrefix(t, 'cc'), ['c', 'aaa']);
	console.log(OpenCC2._longestPrefix(t, 'dccc'), ['d', 'bbb']);
	console.log(OpenCC2._longestPrefix(t, 'dacc'), ['da', 'ccc']);
}

_test();

function _test2() {
	const t = OpenCC2._makeEmptyTrie();
	OpenCC2._addWord(t, '𦫖', 'aaa');
	OpenCC2._addWord(t, '的𫟃', 'bbb');
	console.assert(OpenCC2._convert(t, '𦫖1的𫟃𩇩c') == 'aaa1bbb𩇩c');
}

_test2(); */
