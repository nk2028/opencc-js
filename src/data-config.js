export const variants2standard = {
  cn: ['STCharacters', 'STPhrases'],
  hk: ['HKVariantsRev', 'HKVariantsRevPhrases'],
  tw: ['TWVariantsRev', 'TWVariantsRevPhrases'],
  twp: ['TWVariantsRev', 'TWVariantsRevPhrases', 'TWPhrasesRev'],
  jp: ['JPVariantsRev', 'JPShinjitaiCharacters', 'JPShinjitaiPhrases'],
};

export const standard2variants = {
  cn: ['TSCharacters', 'TSPhrases'],
  hk: ['HKVariants'],
  tw: ['TWVariants'],
  twp: ['TWVariants', 'TWPhrasesIT', 'TWPhrasesName', 'TWPhrasesOther'],
  jp: ['JPVariants'],
};

export const presets = [
  {
    filename: 'full',
    from: Object.keys(variants2standard),
    to: Object.keys(standard2variants)
  },
  {
    filename: 'cn2t',
    from: ['cn'],
    to: ['hk', 'tw', 'twp', 'jp']
  },
  {
    filename: 't2cn',
    from: ['hk', 'tw', 'twp', 'jp'],
    to: ['cn']
  }
];
