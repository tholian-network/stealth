#!/bin/bash

root_dir="$(dirname "$(dirname "$(readlink -f "$0")")")";
node_bin="$(which node)";


if [[ -z "$node_bin" ]]; then
	echo "Please install node.js first";
fi;

cd "$root_dir";

"$node_bin" --experimental-modules ./bin/generate-service.mjs;

