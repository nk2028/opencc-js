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

export const generatedReverseDicts = {
  HKVariantsRev: 'HKVariants',
  JPVariantsRev: 'JPVariants',
  TWVariantsRev: 'TWVariants',
};

export const conversionConfigs = {
  hk2s: { from: 'hk', to: 'cn', segmentation: 'TSPhrases', chain: [['HKVariantsRevPhrases', 'HKVariantsRev'], ['TSPhrases', 'TSCharacters']] },
  hk2t: { from: 'hk', to: 't', segmentation: 'HKVariantsRevPhrases', chain: [['HKVariantsRevPhrases', 'HKVariantsRev']] },
  jp2t: { from: 'jp', to: 't', segmentation: 'JPShinjitaiPhrases', chain: [['JPShinjitaiPhrases', 'JPShinjitaiCharacters', 'JPVariantsRev']] },
  s2hk: { from: 'cn', to: 'hk', segmentation: 'STPhrases', chain: [['STPhrases', 'STCharacters'], ['HKVariants']] },
  s2t: { from: 'cn', to: 't', segmentation: 'STPhrases', chain: [['STPhrases', 'STCharacters']] },
  s2tw: { from: 'cn', to: 'tw', segmentation: 'STPhrases', chain: [['STPhrases', 'STCharacters'], ['TWVariants']] },
  s2twp: { from: 'cn', to: 'twp', segmentation: 'STPhrases', chain: [['STPhrases', 'STCharacters'], ['TWPhrases'], ['TWVariants']] },
  t2hk: { from: 't', to: 'hk', segmentation: 'HKVariants', chain: [['HKVariants']] },
  t2jp: { from: 't', to: 'jp', segmentation: 'JPVariants', chain: [['JPVariants']] },
  t2s: { from: 't', to: 'cn', segmentation: 'TSPhrases', chain: [['TSPhrases', 'TSCharacters']] },
  t2tw: { from: 't', to: 'tw', segmentation: 'TWVariants', chain: [['TWVariants']] },
  tw2s: { from: 'tw', to: 'cn', segmentation: 'TSPhrases', chain: [['TWVariantsRevPhrases', 'TWVariantsRev'], ['TSPhrases', 'TSCharacters']] },
  tw2sp: { from: 'twp', to: 'cn', segmentation: 'TSPhrases', chain: [['TWPhrasesRev', 'TWVariantsRevPhrases', 'TWVariantsRev'], ['TSPhrases', 'TSCharacters']] },
  tw2t: { from: 'tw', to: 't', segmentation: 'TWVariantsRevPhrases', chain: [['TWVariantsRevPhrases', 'TWVariantsRev']] },
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
