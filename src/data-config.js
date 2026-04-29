// The outer array represents conversion-chain stages. The inner array is a
// dictionary group used within one stage; dictionaries earlier in the group
// have higher priority when their entries overlap.
export const variants2standard = {
  cn: [['STPhrases', 'STCharacters']],
  hk: [['HKVariantsRevPhrases', 'HKVariantsRev']],
  tw: [['TWVariantsRevPhrases', 'TWVariantsRev']],
  twp: [['TWPhrasesRev', 'TWVariantsRevPhrases', 'TWVariantsRev']],
  jp: [['JPShinjitaiPhrases', 'JPShinjitaiCharacters', 'JPVariantsRev']],
};

export const standard2variants = {
  cn: [['TSPhrases', 'TSCharacters']],
  hk: [['HKVariants']],
  tw: [['TWVariants']],
  twp: [['TWPhrases'], ['TWVariants']],
  jp: [['JPVariants']],
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
