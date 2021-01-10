/**
 * 使用 Map 實作 Trie 樹
 * Trie 的每個節點為一個 Map 物件
 * key 為 code point，value 為子節點（也是一個 Map）。
 * 如果 Map 物件有 trie_val 屬性，則該屬性為值字串，代表替換的字詞。
 */
export default class Trie {
  constructor() {
    this.map = new Map();
  }

  /**
   * 將一組資料加入字典樹
   *
   * @param {String} s 來源字串
   * @param {String} v 替換的字詞
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
