'use strict';

if (typeof window === 'undefined') {
	var fs = require('fs');
	var util = require('util');
	var readFilePromise = util.promisify(fs.readFile);
}

const OpenCC = {
	/* Trie */

	/*
	  Trie 的每個節點為一個 Map 物件
	  如果 key 是 codePoint，則 value 為子節點（也是一個 Map）
	  如果 key 是 ''，則 value 為替換的字詞
	*/
	_makeEmptyTrie: () => {
		return new Map();
	},

	/**
	 * 將一組資料加入字典樹
	 * 
	 * @param {Map Object} t 字典樹
	 * @param {String} s 來源字串
	 * @param {String} v 目的字串
	 */
	_addWord: (t, s, v) => {
		let n=s.length,
			i=0;
		for(i=0;i<n;) {
			let c=s.codePointAt(i);
			i+=c>0xffff?2:1;
			let m=t.get(c);
			if(m===undefined) {
				m=new Map();
				t.set(c, m);
			}
			t=m;
		}
		t.set('', v);
	},

	_hasValue: t => {
		return t.get('') !== undefined;
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

		async function getDictTextNode(url) {
		    const pathName = require.resolve('opencc-data/data/' + url + '.txt');
		    const response = await readFilePromise(pathName);
		    return response.toString();
		}

		async function getDictText(url) {
			const response = await fetch(DICT_ROOT + url + '.txt');
			const text = await response.text();
			return text;
		}

		const getDict = (typeof window === 'undefined') ? getDictTextNode : getDictText;

		let DICTS;
		if (type == 'from')
			DICTS = DICT_FROM[s];
		else if (type == 'to')
			DICTS = DICT_TO[s];
		const t = OpenCC._makeEmptyTrie();
		for (const DICT of DICTS) {
			const txt = await getDict(DICT);
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

	/**
	 * 使用字典樹轉換一段文字
	 * 
	 * @param {Map Object} t 字典樹
	 * @param {String} s 要被轉換的文字
	 * @returns {String} 轉換後的字串
	 */
	_convert: (t, s) => {
		let n=s.length,
			arr=[],orig_i=null;
		for(let i=0;i<n;) {
			let m=t, k=0, v=null, x=0;
			for(let j=i;j<n;) {
				x=s.codePointAt(j);
				j+=x>0xffff?2:1;
				let tmp=m.get(x);
				if(tmp===undefined) {
					break;
				}
				m=tmp;
				tmp=m.get('');
				if(tmp!==undefined) {
					k=j;
					v=tmp;
				}
			}
			if(k>0) { //有替代
				if(orig_i!==null) {
					arr.push(s.slice(orig_i, i));
					orig_i=null;
				}
				arr.push(v);
				i=k;
			} else { //無替代
				if(orig_i===null) {
					orig_i=i;
				}
				i+=s.codePointAt(i)>0xffff?2:1;
			}
		}
		if(orig_i!==null) {
			arr.push(s.slice(orig_i, n));
		}
		return arr.join('');
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
