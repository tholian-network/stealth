#!/usr/bin/env sh

root_dir="$(dirname "$(dirname "$(readlink -f "$0")")")"
node_bin="$(which node)"


if [[ -z "$node_bin" ]]; then
	echo "Please install node.js first";
	exit 1;
fi

cd "$root_dir";

# Shared source between stealth and browser
cp ./stealth/source/parser/IP.mjs  ./browser/source/parser/IP.mjs;
cp ./stealth/source/parser/URL.mjs ./browser/source/parser/URL.mjs;

"$node_bin" --experimental-modules ./stealth/stealth.mjs "$@";

