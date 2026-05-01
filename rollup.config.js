import generatePackageJson from 'rollup-plugin-generate-package-json';
import terser from '@rollup/plugin-terser';

const minify = terser();

export default [
    {
        input: 'src/full.js',
        output: [
            {
                file: 'dist/umd/full.js',
                format: 'umd',
                name: 'OpenCC',
                exports: 'named',
                plugins: [
                    generatePackageJson({
                        baseContents: {
                            type: "commonjs"
                        }
                    }),
                    minify
                ]
            },
            {
                file: 'dist/esm/full.js',
                format: 'es',
                plugins: [minify]
            }
        ]
    },
    {
        input: 'src/cn2t.js',
        output: [
            {
                file: 'dist/umd/cn2t.js',
                format: 'umd',
                name: 'OpenCC',
                exports: 'named',
                plugins: [minify]
            },
            {
                file: 'dist/esm/cn2t.js',
                format: 'es',
                plugins: [minify]
            }
        ]
    },
    {
        input: 'src/t2cn.js',
        output: [
            {
                file: 'dist/umd/t2cn.js',
                format: 'umd',
                name: 'OpenCC',
                exports: 'named',
                plugins: [minify]
            },
            {
                file: 'dist/esm/t2cn.js',
                format: 'es',
                plugins: [minify]
            }
        ]
    }
];
