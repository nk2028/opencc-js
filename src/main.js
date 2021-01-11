import Trie from './trie';

export { default as Trie } from './trie';

const ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';

/* eslint-disable */

if (ENVIRONMENT_IS_NODE) {
  var fs = require('fs');
  var util = require('util');
  var readFilePromise = util.promisify(fs.readFile);
}

/* eslint-enable */

/* eslint-disable block-scoped-var */

const DICT_FROM = {
  cn: ['STCharacters', 'STPhrases'],
  hk: ['HKVariantsRev', 'HKVariantsRevPhrases'],
  tw: ['TWVariantsRev', 'TWVariantsRevPhrases'],
  twp: ['TWVariantsRev', 'TWVariantsRevPhrases', 'TWPhrasesRev'],
  jp: ['JPVariantsRev', 'JPShinjitaiCharacters', 'JPShinjitaiPhrases'],
};

const DICT_TO = {
  cn: ['TSCharacters', 'TSPhrases'],
  hk: ['HKVariants'],
  tw: ['TWVariants'],
  twp: ['TWVariants', 'TWPhrasesIT', 'TWPhrasesName', 'TWPhrasesOther'],
  jp: ['JPVariants'],
};

async function getDictTextNode(url) {
  const pathName = require.resolve(`opencc-data/data/${url}.txt`);
  const response = await readFilePromise(pathName);
  return response.toString();
}

async function getDictText(url) {
  const response = await fetch(`https://cdn.jsdelivr.net/npm/opencc-data@1.0.5/data/${url}.txt`);
  const text = await response.text();
  return text;
}

const getDict = ENVIRONMENT_IS_NODE ? getDictTextNode : getDictText;

async function loadDict(s, type) {
  let dicts;
  if (type === 'from') {
    dicts = DICT_FROM[s];
  } else if (type === 'to') {
    dicts = DICT_TO[s];
  }
  const dictTexts = await Promise.all(dicts.map(getDict));
  const t = new Trie();
  for (const dictText of dictTexts) {
    const lines = dictText.split('\n');
    for (const line of lines) {
      if (line && !line.startsWith('#')) {
        const [l, r] = line.split('\t');
        t.addWord(l, r.split(' ')[0]); // 若有多個候選，只選擇第一個
      }
    }
  }
  return t;
}

/**
 * 取得預設轉換器。
 *
 * 兩個引數的可能取值如下：
 *
 * - OpenCC 繁體：`t`
 * - 台灣繁體：`tw`
 * - 台灣繁體，台灣用詞：`twp`
 * - 香港繁體：`hk`
 * - 大陸簡體：`cn`
 * - 日本新字體：`jp`
 * @param {string} fromVariant 源中文變體類型
 * @param {string} toVariant 目標中文變體類型
 */
export async function Converter(fromVariant, toVariant) {
  const dictFrom = fromVariant === 't' ? null : await loadDict(fromVariant, 'from');
  const dictTo = toVariant === 't' ? null : await loadDict(toVariant, 'to');
  return (s) => {
    let res = s;
    if (fromVariant !== 't') res = dictFrom.convert(res);
    if (toVariant !== 't') res = dictTo.convert(res);
    return res;
  };
}

/**
 * 取得自訂轉換器。
 * @param {Object} dict 自訂轉換詞典
 */
export function CustomConverter(dict) {
  const t = new Trie();
  Object.entries(dict).forEach(([k, v]) => {
    t.addWord(k, v);
  });
  /**
   * 執行轉換的函式。
   * @param {string} s 要轉換的字串
   */
  function convert(s) {
    return t.convert(s);
  }
  return convert;
}

export function HTMLConverter(convertFunc, startNode, fromLangTag, toLangTag) {
  /* eslint-disable no-param-reassign */
  function convert() {
    function inner(currentNode, langMatched) {
      /* class list 包含 ignore-opencc 的元素會跳過後續的轉換 */
      if (currentNode.nodeType === Node.ELEMENT_NODE && currentNode.classList.contains('ignore-opencc')) return;

      if (currentNode.lang === fromLangTag) {
        langMatched = true;
        currentNode.shouldChangeLang = true; // 記住 lang 屬性被修改了，以便恢復
        currentNode.lang = toLangTag;
      } else if (currentNode.lang && currentNode.lang.length) {
        langMatched = false;
      }

      if (langMatched) {
        /* Do not convert these elements */
        if (currentNode.tagName === 'SCRIPT') return;
        if (currentNode.tagName === 'STYLE') return;

        /* 處理特殊屬性 */
        if (currentNode.tagName === 'META' && currentNode.name === 'description') {
          if (currentNode.originalContent == null) {
            currentNode.originalContent = currentNode.content;
          }
          currentNode.content = convertFunc(currentNode.originalContent);
        } else if (currentNode.tagName === 'META' && currentNode.name === 'keywords') {
          if (currentNode.originalContent == null) {
            currentNode.originalContent = currentNode.content;
          }
          currentNode.content = convertFunc(currentNode.originalContent);
        } else if (currentNode.tagName === 'IMG') {
          if (currentNode.originalAlt == null) {
            currentNode.originalAlt = currentNode.alt;
          }
          currentNode.alt = convertFunc(currentNode.originalAlt);
        } else if (currentNode.tagName === 'INPUT' && currentNode.type === 'button') {
          if (currentNode.originalValue == null) {
            currentNode.originalValue = currentNode.value;
          }
          currentNode.value = convertFunc(currentNode.originalValue);
        }
      }

      for (const node of currentNode.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && langMatched) {
          if (node.originalString == null) {
            node.originalString = node.nodeValue; // 存儲原始字串，以便恢復
          }
          node.nodeValue = convertFunc(node.originalString);
        } else {
          inner(node, langMatched);
        }
      }
    }
    inner(startNode, false);
  }

  function restore() {
    function inner(currentNode) {
      /* class list 包含 ignore-opencc 的元素會跳過後續的轉換 */
      if (currentNode.nodeType === Node.ELEMENT_NODE && currentNode.classList.contains('ignore-opencc')) return;

      if (currentNode.shouldChangeLang) {
        currentNode.lang = fromLangTag;
      }

      if (currentNode.originalString !== undefined) {
        currentNode.nodeValue = currentNode.originalString;
      }

      /* 處理特殊屬性 */
      if (currentNode.tagName === 'META' && currentNode.name === 'description') {
        if (currentNode.originalContent !== undefined) {
          currentNode.content = currentNode.originalContent;
        }
      } else if (currentNode.tagName === 'META' && currentNode.name === 'keywords') {
        if (currentNode.originalContent !== undefined) {
          currentNode.content = currentNode.originalContent;
        }
      } else if (currentNode.tagName === 'IMG') {
        if (currentNode.originalAlt !== undefined) {
          currentNode.alt = currentNode.originalAlt;
        }
      } else if (currentNode.tagName === 'INPUT' && currentNode.type === 'button') {
        if (currentNode.originalValue !== undefined) {
          currentNode.value = currentNode.originalValue;
        }
      }

      for (const node of currentNode.childNodes) {
        inner(node);
      }
    }
    inner(startNode);
  }

  return { convert, restore };
}
