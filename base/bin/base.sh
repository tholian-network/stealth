#!/bin/bash

base_dir="$(dirname "$(dirname "$(readlink -f "$0")")")";



cd $base_dir;

if [ -d "$base_dir/build" ]; then
	rm -rf "$base_dir/build";
fi;

mkdir "$base_dir/build";
mkdir "$base_dir/build/browser";
mkdir "$base_dir/build/node";


BASE_FILES=(
	"$base_dir/source/Array.mjs"
	"$base_dir/source/Boolean.mjs"
	"$base_dir/source/Date.mjs"
	"$base_dir/source/Function.mjs"
	"$base_dir/source/Number.mjs"
	"$base_dir/source/Object.mjs"
	"$base_dir/source/RegExp.mjs"
	"$base_dir/source/String.mjs"
);

BROWSER_FILES=(
	"$base_dir/source/browser/Buffer.mjs"
	"$base_dir/source/browser/WebSocket.mjs"
	"$base_dir/source/browser/console.mjs"
);

NODE_FILES=(
	"$base_dir/source/node/Buffer.mjs"
	"$base_dir/source/node/WebSocket.mjs"
	"$base_dir/source/node/console.mjs"
);

cat "${BASE_FILES[@]}" "${BROWSER_FILES[@]}" "$base_dir/source/MODULE.mjs" > $base_dir/build/browser/BASE.mjs;
cat "${BASE_FILES[@]}" "${NODE_FILES[@]}"    "$base_dir/source/MODULE.mjs" > $base_dir/build/node/BASE.mjs;

exit 0;

