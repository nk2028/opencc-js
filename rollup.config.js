export default [
  {
    input: 'full.js',
    output: {
      file: 'bundle-node.js',
      format: 'umd',
      name: 'OpenCC',
    },
  },
  {
    input: 'main.js',
    output: {
      file: 'bundle-browser.js',
      format: 'umd',
      name: 'OpenCC',
    },
  },
];
