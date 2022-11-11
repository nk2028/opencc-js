#!/bin/sh

set -e

# Build

node build.js

npx rollup -c

# Test

node test/node/basic.mjs
node test/node/basic.cjs

wget -nc -nv -P test https://raw.githubusercontent.com/weiyinfu/JinYong/db1d9a9/%E9%87%91%E5%BA%B8%E5%85%A8%E9%9B%86%E4%B8%89%E8%81%94%E7%89%88/%E7%A5%9E%E9%9B%95%E4%BE%A0%E4%BE%A3.txt
wget -nc -nv -P test https://raw.githubusercontent.com/weiyinfu/JinYong/db1d9a9/%E9%87%91%E5%BA%B8%E5%85%A8%E9%9B%86%E4%B8%89%E8%81%94%E7%89%88/%E5%A4%A9%E9%BE%99%E5%85%AB%E9%83%A8.txt
node test/node/speed.cjs
