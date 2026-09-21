import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import terser from '@rollup/plugin-terser';

const minify = terser();

const fullEntry = fileURLToPath(new URL('./src/full.js', import.meta.url));
const dictDir = fileURLToPath(new URL('./dist/esm-lib/dict/', import.meta.url));

// For add-on bundles that load full.js at runtime: dictionaries already
// reachable through the full build's `Locale.configs` are taken from there
// instead of being bundled again.
function reuseFullDicts() {
    const prefix = '\0full-dict:';
    let dictPathsPromise;
    async function loadDictPaths() {
        const dictPaths = new Map();
        const { configs } = await import(pathToFileURL(`${dictDir}../preset/full.js`).href);
        const files = fs.readdirSync(dictDir);
        const dicts = await Promise.all(files.map(file => import(pathToFileURL(dictDir + file).href)));
        const contentToFile = new Map(dicts.map((dict, i) => [dict.default, files[i]]));
        for (const [name, config] of Object.entries(configs)) {
            for (const chainName of ['normalizationChain', 'conversionChain']) {
                (config[chainName] || []).forEach((group, i) => group.forEach((dict, j) => {
                    const file = contentToFile.get(dict);
                    if (file && !dictPaths.has(file)) {
                        dictPaths.set(file, `Locale.configs.${name}.${chainName}[${i}][${j}]`);
                    }
                }));
            }
        }
        return dictPaths;
    }
    function getDictPaths() {
        dictPathsPromise ??= loadDictPaths();
        return dictPathsPromise;
    }
    return {
        name: 'reuse-full-dicts',
        async resolveId(source, importer) {
            if (!importer || importer.startsWith(prefix)) return null;
            const resolved = path.resolve(path.dirname(importer), source);
            if (path.dirname(resolved) + path.sep !== dictDir) return null;
            const file = path.basename(resolved);
            return (await getDictPaths()).has(file) ? prefix + file : null;
        },
        async load(id) {
            if (!id.startsWith(prefix)) return null;
            const dictPath = (await getDictPaths()).get(id.slice(prefix.length));
            return `import { Locale } from ${JSON.stringify(fullEntry)};\nexport default ${dictPath};\n`;
        }
    };
}

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
    },
    {
        input: 'src/seal.js',
        external: [fullEntry],
        plugins: [reuseFullDicts()],
        output: [
            {
                file: 'dist/umd/seal.js',
                format: 'umd',
                name: 'OpenCCSeal',
                exports: 'named',
                globals: { [fullEntry]: 'OpenCC' },
                paths: { [fullEntry]: './full.js' },
                plugins: [minify]
            },
            {
                file: 'dist/esm/seal.js',
                format: 'es',
                paths: { [fullEntry]: './full.js' },
                plugins: [minify]
            }
        ]
    }
];
