#!/usr/bin/env sh

root_dir="$(dirname "$(dirname "$(readlink -f "$0")")")";
node_bin="$(which node)";


if [[ -z "$node_bin" ]]; then
	echo "Please install node.js first";
	exit 1;
fi;



cd "$root_dir";

# Shared between Stealth and Browser
mkdir -p ./browser/source/client;
mkdir -p ./browser/source/parser;
cp ./stealth/source/POLYFILLS.mjs       ./browser/source/POLYFILLS.mjs;
cp ./stealth/source/Emitter.mjs         ./browser/source/Emitter.mjs;
cp ./stealth/source/client/Cache.mjs    ./browser/source/client/Cache.mjs;
cp ./stealth/source/client/Filter.mjs   ./browser/source/client/Filter.mjs;
cp ./stealth/source/client/Host.mjs     ./browser/source/client/Host.mjs;
cp ./stealth/source/client/Mode.mjs     ./browser/source/client/Mode.mjs;
cp ./stealth/source/client/Peer.mjs     ./browser/source/client/Peer.mjs;
cp ./stealth/source/client/Redirect.mjs ./browser/source/client/Redirect.mjs;
cp ./stealth/source/client/Session.mjs  ./browser/source/client/Session.mjs;
cp ./stealth/source/client/Settings.mjs ./browser/source/client/Settings.mjs;
cp ./stealth/source/client/Stash.mjs    ./browser/source/client/Stash.mjs;
cp ./stealth/source/parser/IP.mjs       ./browser/source/parser/IP.mjs;
cp ./stealth/source/parser/URL.mjs      ./browser/source/parser/URL.mjs;

# Shared between Stealth and Covert
cp ./stealth/source/console.mjs   ./covert/source/console.mjs;
cp ./stealth/source/Emitter.mjs   ./covert/source/Emitter.mjs;
cp ./stealth/source/POLYFILLS.mjs ./covert/source/POLYFILLS.mjs;

exec "$node_bin" --tls-cipher-list="ECDHE-RSA-AES128-GCM-SHA256" --no-warnings --experimental-modules ./stealth/stealth.mjs "$@";

