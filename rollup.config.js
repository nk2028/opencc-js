import generatePackageJson from 'rollup-plugin-generate-package-json';

export default [
    {
        input: 'src/full.js',
        output: [
            {
                file: 'dist/umd/full.js',
                format: 'umd',
                name: 'OpenCC',
                plugins: [
                    generatePackageJson({
                        baseContents: {
                            type: "commonjs"
                        }
                    })
                ]
            },
            {
                file: 'dist/esm/full.js',
                format: 'es',
            }
        ]
    },
    {
        input: 'src/cn2t.js',
        output: [
            {
                file: 'dist/umd/cn2t.js',
                format: 'umd',
                name: 'OpenCC'
            },
            {
                file: 'dist/esm/cn2t.js',
                format: 'es',
            }
        ]
    },
    {
        input: 'src/t2cn.js',
        output: [
            {
                file: 'dist/umd/t2cn.js',
                format: 'umd',
                name: 'OpenCC'
            },
            {
                file: 'dist/esm/t2cn.js',
                format: 'es',
            }
        ]
    }
];
