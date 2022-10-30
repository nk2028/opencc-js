import { Trie, ConverterFactory, ConverterBuilder, CustomConverter, HTMLConverter } from "./main.js";
import * as loc from "../dist/esm/preset/cn2t.js";

const Converter = ConverterBuilder(loc);

export { Trie, ConverterFactory, Converter, CustomConverter, HTMLConverter };
