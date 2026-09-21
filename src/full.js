import { Trie, ConverterFactory, ConverterBuilder, CustomConverter, HTMLConverter } from "./main.js";
import * as Locale from "../dist/esm-lib/preset/full.js";

const Converter = ConverterBuilder(Locale);
const OpenCC = { Trie, ConverterFactory, ConverterBuilder, Converter, CustomConverter, HTMLConverter, Locale };

export default OpenCC;
export { Trie, ConverterFactory, ConverterBuilder, Converter, CustomConverter, HTMLConverter, Locale };
