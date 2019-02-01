#!/usr/bin/env sh

root_dir="$(dirname "$(dirname "$(readlink -f "$0")")")";
eslint_bin="$(which eslint)";


if [[ -z "$eslint_bin" ]]; then
	echo "Please install eslint first";
	exit 1;
fi;


cd "$root_dir/browser";
eslint --ext js  ./design;
eslint --ext mjs ./internal;
eslint --ext mjs ./source;

cd "$root_dir/stealth";
eslint --ext mjs ./source;


