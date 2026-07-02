# Changelog

All notable changes to this project will be documented in this file.

## 1.4.0 - 2026-07-02

### Changed

- Align with upstream `opencc-data` 1.4.0 and refresh the generated dictionary data.

## 1.3.2 - 2026-06-28

### Changed

- Align the package version and generated dictionary source with `opencc-data` 1.3.2.
- Generate built-in conversion presets from upstream `opencc-data` config JSON instead of maintaining parallel conversion-chain definitions in `src/data-config.js`.
- Apply upstream pre-segmentation normalization data, including `CJK_Compatibility_Ideographs` mappings.
- Add the `hkp` locale for Hong Kong phrase conversion, covering upstream `s2hkp` and `hk2sp` configs and bundling the corresponding `HKPhrases` and `HKPhrasesRev` dictionaries.
- Preserve the existing `{ from, to }` converter option API, including mappings such as `{ from: 'cn', to: 'twp' }` and `{ from: 'twp', to: 'cn' }`, while sourcing the underlying chains from upstream config files.
- Add OpenCC golden-file conversion tests for supported Simplified-to-Traditional configs without including the golden fixtures in the published npm package.
- Allow manually dispatched npm publishes for prerelease package versions while validating that manual publishes cannot use a stable semver version.
- Clarify published license metadata and add a standalone Apache 2.0 license file so npm and GitHub license scanners more accurately detect the existing licensing of bundled `opencc-data` derivatives.

### Fixed

- Support upstream config normalization steps that run before segmentation.
- Support upstream configs without a segmentation section, such as `t2jp`.
- Preserve unmatched ideographic description sequences as whole units during segmentation and conversion.
- Keep excluding `may_output_tofu` conversion dictionaries by default, and document the resulting intentional upstream test-case skips in the OpenCC testcase runner.
- Sync generated dictionary data with the upstream `opencc-data` package layout and dictionary names.
- Continue to omit `TSCharactersExt` tofu-risk mappings to avoid producing glyphs that are often missing from browser and system fonts.
- Fix `ConverterFactory(Locale.from.cn, Locale.to.hk)`-style locale dictionary collection arguments being silently treated as custom dictionary entries instead of bundled locale dictionaries.
- Throw clearer errors for malformed dictionary entries, invalid `ConverterFactory` dictionary arguments, and unknown converter locales.

## 1.3.1 - 2026-05-09

### Added

- Add OpenCC-style mmseg segmentation for built-in converters so multi-stage conversions preserve official phrase boundaries.
- Add explicit package exports for `opencc-js/core`, `opencc-js/preset`, `opencc-js/preset/cn2t`, and `opencc-js/preset/t2cn`.
- Add CommonJS conditional exports for `opencc-js/cn2t` and `opencc-js/t2cn`.
- Add default ESM exports for the bundled package entry points.
- Add TypeScript declaration files for the public package entry points.
- Add `THIRD_PARTY_LICENSES.md` documenting the use of `opencc-data` (Apache 2.0) and include it in the published package.

### Changed

- Adapt dictionary generation and OpenCC test cases to `opencc-data` 1.3.1-next.1.
- Publish only built artifacts, type declarations, README files, changelog, and license files to npm.
- Mark the package as side-effect-free for bundlers.

## 1.3.0 - 2026-04-29

Changes since 1.0.5.

### Added

- Sync dictionary generation with [`opencc-data`](https://www.npmjs.com/package/opencc-data) 1.3.0 and bundle the generated data at build time so browser usage does not fetch dictionary text files at runtime.
- Add OpenCC upstream test cases to `npm test` and the publish lifecycle.
- Add a Node benchmark for OpenCC-style workloads.
- Convert `placeholder` and `aria-label` attributes in `HTMLConverter`.

### Changed

- Minify Rollup bundles with terser.
- Restore [`opencc-data`](https://www.npmjs.com/package/opencc-data) as the source for generated dictionary data.

### Fixed

- Fix the GitHub Actions test workflow Node.js version configuration.
