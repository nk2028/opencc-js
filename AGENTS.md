# Repository Guidelines

## Project Overview

`opencc-js` is a pure JavaScript implementation of Open Chinese Convert for browsers and Node.js. Dictionary data is generated from `opencc-data` at build time and bundled into `dist`.

## Common Commands

- `npm run build`: generate dictionary modules and Rollup bundles.
- `npm test`: build the package, run ESM and CommonJS smoke tests, and run OpenCC upstream test cases.
- `npm run test:opencc`: run only the OpenCC upstream test cases.
- `npm pack --dry-run`: inspect the files that will be published to npm.

## Development Notes

- Keep runtime source changes scoped to `src/`; generated package artifacts live under `dist/`.
- Do not hand-edit generated files in `dist`; run `npm run build` instead.
- Preserve both ESM and CommonJS package entry behavior when changing `exports` or build outputs.
- Keep changelog entries in `CHANGELOG.md`; update the `Unreleased` section regularly when making user-visible, packaging, build, or release-process changes.
- Published npm contents are controlled by the `files` list in `package.json`.

## Release Preparation

When preparing a new release that syncs with a new `opencc-data` version:

- Update the package version in `package.json` and `package-lock.json` to the release version.
- Update the `opencc-data` dev dependency to the exact upstream version, without a semver range such as `^`.
- Run `npm run build` to regenerate dictionary modules and Rollup bundles; never hand-edit generated `dist` files.
- Update `CHANGELOG.md` with a release entry. For dictionary-only upstream syncs, note that the release aligns with the upstream `opencc-data` version and refreshes generated dictionary data.
- Update all README files (`README.md`, `README-zh-CN.md`, and `README-zh-TW.md`) so version callouts, CDN URLs, pinned-version comments, and sample outputs match the new release.
- Search the README files for the previous release version and update any remaining user-facing references.
- Verify sample conversion outputs against the current build when README examples mention exact output.

## Verification

Before release-oriented changes, run:

```sh
npm test
npm pack --dry-run
```
