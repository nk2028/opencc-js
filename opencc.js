'use strict';

if (typeof window === 'undefined')
	var fetch = require('node-fetch');

const OpenCC = {
	/* Trie */

	/* We represent a trie with a list of one or two elements.
	  The first element is a dictionary, which contains the characters
	  after this character.
	  The second element is the value of the current character. If
	  there is no value for the current character, the list will only
	  contain one element, and this element does not exists.
	*/
	_makeEmptyTrie: () => {
		return [{} /* child nodes */ /* , v */];
	},

	/* Add a word to a trie
	  t: tree
	  s: string
	  v: value
	*/
	_addWord: (t, s, v) => {
		for (const c of s) {
			const nodes = t[0];
			if (!(c in nodes)) {
				nodes[c] = OpenCC._makeEmptyTrie();
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
			if (OpenCC._hasValue(t)) {
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
		const DICT_ROOT = 'https://cdn.jsdelivr.net/npm/opencc-data@1.0.1/data/';

		const DICT_FROM = { "cn": ["STCharacters", "STPhrases"]
			, "hk": ["HKVariantsRev", "HKVariantsRevPhrases"]
			, "tw": ["TWVariantsRev", "TWVariantsRevPhrases"]
			, "twp": ["TWVariantsRev", "TWVariantsRevPhrases", "TWPhrasesRev"]
			, "jp": ["JPVariantsRev", "JPShinjitaiCharacters", "JPShinjitaiPhrases"]
			},
			DICT_TO = { "cn": ["TSCharacters", "TSPhrases"]
			, "hk": ["HKVariants"]
			, "tw": ["TWVariants"]
			, "twp": ["TWVariants", "TWPhrasesIT", "TWPhrasesName", "TWPhrasesOther"]
			, "jp": ["JPVariants"]
			};

		async function getDictText(url) {
			const response = await fetch(DICT_ROOT + url + '.txt');
			const text = await response.text();
			return text;
		}

		let DICTS;
		if (type == 'from')
			DICTS = DICT_FROM[s];
		else if (type == 'to')
			DICTS = DICT_TO[s];
		const t = OpenCC._makeEmptyTrie();
		for (const DICT of DICTS) {
			const txt = await getDictText(DICT);
			const lines = txt.split('\n');
			for (const line of lines) {
				if (line && !line.startsWith('#')) {
					const [l, r] = line.split('\t');
					OpenCC._addWord(t, l, r.split(' ')[0]);  // 若有多個候選，只選擇第一個
				}
			}
		}
		return t;
	},

	_convert: (t, s) => {
		const res = [];
		while (s.length) {
			const prefix = OpenCC._longestPrefix(t, s);
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

	/* Converters */

	Converter: async function Converter(fromVariant, toVariant) {
		let dictFrom, dictTo;
		if (fromVariant != 't')
			dictFrom = await OpenCC._load_dict(fromVariant, 'from');
		if (toVariant != 't')
			dictTo = await OpenCC._load_dict(toVariant, 'to');
		return s => {
				if (fromVariant != 't')
					s = OpenCC._convert(dictFrom, s);
				if (toVariant != 't')
					s = OpenCC._convert(dictTo, s);
				return s;
			};
	},

	CustomConverter: function CustomConverter(dict) {
		const t = OpenCC._makeEmptyTrie();
		for (const [k, v] of Object.entries(dict))
			OpenCC._addWord(t, k, v);
		return s => OpenCC._convert(t, s);
	},

	HTMLConverter: function HTMLConverter(convertFunc, startNode, fromLangTag, toLangTag) {
		function convert() {
			function _inner(currentNode, langMatched) {
				if (currentNode.lang == fromLangTag) {
					langMatched = true;
					currentNode.shouldChangeLang = true;  // 記住 lang 屬性被修改了，以便恢復
					currentNode.lang = toLangTag;
				} else if (currentNode.lang && currentNode.lang.length) {
					langMatched = false;
				}

				if (langMatched) {
					/* Do not convert these elements */
					if (currentNode.tagName == 'SCRIPT')
						return;
					else if (currentNode.tagName == 'STYLE')
						return;

					/* 處理特殊屬性 */
					else if (currentNode.tagName == 'META' && currentNode.name == 'description') {
						if (currentNode.originalContent === undefined)
							currentNode.originalContent = currentNode.content;
						currentNode.content = convertFunc(currentNode.originalContent);
					} else if (currentNode.tagName == 'META' && currentNode.name == 'keywords') {
						if (currentNode.originalContent === undefined)
							currentNode.originalContent = currentNode.content;
						currentNode.content = convertFunc(currentNode.originalContent);
					} else if (currentNode.tagName == 'IMG') {
						if (currentNode.originalAlt === undefined)
							currentNode.originalAlt = currentNode.alt;
						currentNode.alt = convertFunc(currentNode.originalAlt);
					} else if (currentNode.tagName == 'INPUT' && currentNode.type == 'button'){
						if (currentNode.originalValue === undefined)
							currentNode.originalValue = currentNode.value;
						currentNode.value = convertFunc(currentNode.originalValue);
					}
				}

				for (const node of currentNode.childNodes)
					if (node.nodeType == Node.TEXT_NODE && langMatched) {
						if (node.originalString === undefined)
							node.originalString = node.nodeValue;  // 存儲原始字符串，以便恢復
						node.nodeValue = convertFunc(node.originalString);
					} else
						_inner(node, langMatched);
			}
			_inner(startNode, false);
		}

		function restore() {
			function _inner(currentNode) {
				if (currentNode.shouldChangeLang)
					currentNode.lang = fromLangTag;

				if (currentNode.originalString !== undefined)
					currentNode.nodeValue = currentNode.originalString;

				/* 處理特殊屬性 */
				if (currentNode.tagName == 'META' && currentNode.name == 'description') {
					if (currentNode.originalContent !== undefined)
						currentNode.content = currentNode.originalContent;
				} else if (currentNode.tagName == 'META' && currentNode.name == 'keywords') {
					if (currentNode.originalContent !== undefined)
						currentNode.content = currentNode.originalContent;
				} else if (currentNode.tagName == 'IMG') {
					if (currentNode.originalAlt !== undefined)
						currentNode.alt = currentNode.originalAlt;
				} else if (currentNode.tagName == 'INPUT' && currentNode.type == 'button'){
					if (currentNode.originalValue !== undefined)
						currentNode.value = currentNode.originalValue;
				}

				for (const node of currentNode.childNodes)
					_inner(node);
			}
			_inner(startNode);
		}

		return { convert: convert, restore: restore };
	}
}

try { module.exports = exports = OpenCC; } catch (e) {}
