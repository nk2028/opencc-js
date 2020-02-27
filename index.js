/* Trie */

function makeEmptyTrie() {
	return [{} /* child nodes */ /* , v */];
}

function addWord(t, s, v) {
	for (const c of s) {
		const nodes = t[0];
		if (!(c in nodes)) {
			nodes[c] = makeEmptyTrie();
		}
		t = nodes[c];
	}
	t.push(v);
}

function hasValue(t) {
	return t.length == 2;
}

function longestPrefix(t, s) {
	const res = [];
	let cur = [], target;
	for (const c of s) {
		cur.push(c);
		const nodes = t[0];
		if (!(c in nodes))
			break;
		t = nodes[c];
		if (hasValue(t)) {
			target = t[1];
			res.push(...cur);
			cur = [];
		}
	}
	if (res.length)
		return [res.join(''), target];  // k, v
}

function _test() {
	const t = makeEmptyTrie();
	addWord(t, 'c', 'aaa');
	addWord(t, 'd', 'bbb');
	addWord(t, 'da', 'ccc');
	console.log(longestPrefix(t, 'c'), ['c', 'aaa']);
	console.log(longestPrefix(t, 'cc'), ['c', 'aaa']);
	console.log(longestPrefix(t, 'dccc'), ['d', 'bbb']);
	console.log(longestPrefix(t, 'dacc'), ['da', 'ccc']);
}

// _test();

/* Load dict */

async function load_dict(s, type) {
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
	const t = makeEmptyTrie();
	for (const DICT of DICTS) {
		const txt = await getDictText(DICT);
		const lines = txt.split('\n');
		for (const line of lines) {
			if (line && !line.startsWith('#')) {
				const [l, r] = line.split('\t');
				addWord(t, l, r.split(' ')[0]);  // 若有多個候選，只選擇第一個
			}
		}
	}
	return t;
}

/* Converter */

function length(s) {
	return [...s].length;
}

function convert(t, s) {
	const res = [];
	while (s.length) {
		const prefix = longestPrefix(t, s);
		if (prefix) {
			const [k, v] = prefix;
			res.push(v);
			s = s.slice(k.length);
		} else {
			const k = [...s][0];
			res.push(k);
			s = s.slice(k.length);
		}
	}
	return res.join('');
}

function _test2() {
	const t = makeEmptyTrie();
	addWord(t, '𦫖', 'aaa');
	addWord(t, '的𫟃', 'bbb');
	console.assert(convert(t, '𦫖1的𫟃𩇩c') == 'aaa1bbb𩇩c');
}

// _test2();

const Converter = {
	create: async config => {
		const o = {};
		o.dict_from = config.from_variant == 't' ? null : await load_dict(config.from_variant, 'from');
		o.dict_to = config.to_variant == 't' ? null : await load_dict(config.to_variant, 'to');
		o.convert = s => {
			if (config.from_variant != 't')
				s = convert(o.dict_from, s);
			if (config.to_variant != 't')
				s = convert(o.dict_to, s);
			return s;
		};
		return o;
	}
}
