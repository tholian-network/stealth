#!/usr/bin/env bash

root_dir="$(dirname "$(dirname "$(readlink -f "$0")")")"
node_bin="$(which node)"


if [[ -z "$node_bin" ]]; then
	echo "Please install node.js first"
	exit 1
fi

cd "$root_dir"
"$node_bin" --experimental-modules ./stealth/stealth.mjs "$@"

