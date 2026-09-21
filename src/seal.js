// Add-on entry: the core and the dictionaries shared with the full build are
// loaded from full.js (kept external in rollup.config.js), so that this bundle
// only carries the seal dictionaries.
import { Trie, ConverterFactory, ConverterBuilder, CustomConverter, HTMLConverter } from "./full.js";
import * as Locale from "../dist/esm-lib/preset/seal.js";

const Converter = ConverterBuilder(Locale);
const OpenCC = { Trie, ConverterFactory, ConverterBuilder, Converter, CustomConverter, HTMLConverter, Locale };

export default OpenCC;
export { Trie, ConverterFactory, ConverterBuilder, Converter, CustomConverter, HTMLConverter, Locale };
