const variants2standard = {
  cn: ['STCharacters', 'STPhrases'],
  hk: ['HKVariantsRev', 'HKVariantsRevPhrases'],
  tw: ['TWVariantsRev', 'TWVariantsRevPhrases'],
  twp: ['TWVariantsRev', 'TWVariantsRevPhrases', 'TWPhrasesRev'],
  jp: ['JPVariantsRev', 'JPShinjitaiCharacters', 'JPShinjitaiPhrases'],
};

const standard2variants = {
  cn: ['TSCharacters', 'TSPhrases'],
  hk: ['HKVariants'],
  tw: ['TWVariants'],
  twp: ['TWVariants', 'TWPhrasesIT', 'TWPhrasesName', 'TWPhrasesOther'],
  jp: ['JPVariants'],
};

/**
 * Trie 樹。
 */
export class Trie {
  // 使用 Map 實作 Trie 樹
  // Trie 的每個節點為一個 Map 物件
  // key 為 code point，value 為子節點（也是一個 Map）。
  // 如果 Map 物件有 trie_val 屬性，則該屬性為值字串，代表替換的字詞。

  constructor() {
    this.map = new Map();
  }

  /**
   * 將一項資料加入字典樹
   * @param {string} s 要匹配的字串
   * @param {string} v 若匹配成功，則替換為此字串
   */
  addWord(s, v) {
    let { map } = this;
    for (const c of s) {
      const cp = c.codePointAt(0);
      const nextMap = map.get(cp);
      if (nextMap == null) {
        const tmp = new Map();
        map.set(cp, tmp);
        map = tmp;
      } else {
        map = nextMap;
      }
    }
    map.trie_val = v;
  }

  /**
   * 根據字典樹中的資料轉換字串。
   * @param {string} s 要轉換的字串
   */
  convert(s) {
    const t = this.map;
    const n = s.length, arr = [];
    let orig_i;
    for (let i = 0; i < n;) {
      let t_curr = t, k = 0, v;
      for (let j = i; j < n;) {
        const x = s.codePointAt(j);
        j += x > 0xffff ? 2 : 1;

        const t_next = t_curr.get(x);
        if (typeof t_next === 'undefined') {
          break;
        }
        t_curr = t_next;

        const v_curr = t_curr.trie_val;
        if (typeof v_curr !== 'undefined') {
          k = j;
          v = v_curr;
        }
      }
      if (k > 0) { //有替代
        if (orig_i !== null) {
          arr.push(s.slice(orig_i, i));
          orig_i = null;
        }
        arr.push(v);
        i = k;
      } else { //無替代
        if (orig_i === null) {
          orig_i = i;
        }
        i += s.codePointAt(i) > 0xffff ? 2 : 1;
      }
    }
    if (orig_i !== null) {
      arr.push(s.slice(orig_i, n));
    }
    return arr.join('');
  }
}

function getDict(dictName) {
  return OpenCCJSData[dictName];
}

function loadDict(s, type) {
  const t = new Trie();
  for (const dictName of (type === 'from' ? variants2standard : standard2variants)[s]) {
    for (const line of getDict(dictName).split('\n')) {
      const [l, r] = line.split(' ');
      t.addWord(l, r);
    }
  }
  return t;
}

export function Converter(fromVariant, toVariant) {
  return (s) => {
    let res = s;
    if (fromVariant !== 't') res = loadDict(fromVariant, 'from').convert(res);
    if (toVariant !== 't') res = loadDict(toVariant, 'to').convert(res);
    return res;
  };
}


export function CustomConverter(dict) {
  const t = new Trie();
  dict.forEach(([k, v]) => {
    t.addWord(k, v);
  });

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
