#!/usr/bin/env sh


root_dir="$(dirname "$(dirname "$(readlink -f "$0")")")";
node_bin="$(which node)";


if [[ -z "$node_bin" ]]; then
	echo "Please install node.js first";
	exit 1;
fi;

cd "$root_dir";



#
# Shared between Stealth and Covert
#

cp ./stealth/source/console.mjs   ./covert/source/console.mjs;
cp ./stealth/source/Emitter.mjs   ./covert/source/Emitter.mjs;
cp ./stealth/source/POLYFILLS.mjs ./covert/source/POLYFILLS.mjs;



"$node_bin" --no-warnings --experimental-modules ./covert/covert.mjs "$@";

