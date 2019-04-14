#!/usr/bin/env sh

PROXY_PID=""; # background process

root_dir="$(dirname "$(dirname "$(readlink -f "$0")")")";
node_bin="$(which node)";
cc_bin="$(which cc)";
make_bin="$(which make)";
system="$(uname)";


if [[ -z "$node_bin" ]]; then
	echo "Please install node.js first.";
	exit 1;
fi;

if [[ -z "$cc_bin" ]]; then
	cc_bin="$(which clang)";
fi;

if [[ -z "$cc_bin" ]]; then
	echo "Please install gcc first.";
	exit 1;
fi;

if [[ -z "$make_bin" ]]; then
	echo "Please install make first.";
	exit 1;
fi;


if [[ "$system" == "Darwin" ]]; then

	echo "Need sudo to create alias for 127.0.0.2 ...";
	sudo ifconfig lo0 alias "127.0.0.2" up;

	echo "Need sudo to create alias for 127.0.0.3 ...";
	sudo ifconfig lo0 alias "127.0.0.3" up;

fi;



cd "$root_dir/covert/sketch/socks-proxy";
make .;

if [[ $? != 0 ]]; then
	echo "Compilation of SOCKS Proxy failed.";
	exit 1;
fi;

cd "$root_dir/covert/sketch/socks-proxy";
chmod +x ./socks-proxy;
./socks-proxy -i "127.0.0.3" &

PROXY_PID="$!";



cd "$root_dir";

# Shared between Stealth and Covert
cp ./stealth/source/console.mjs   ./covert/source/console.mjs;
cp ./stealth/source/Emitter.mjs   ./covert/source/Emitter.mjs;
cp ./stealth/source/POLYFILLS.mjs ./covert/source/POLYFILLS.mjs;

exec "$node_bin" --no-warnings --experimental-modules ./covert/covert.mjs "$@";



if [[ "$PROXY_PID" != "0" ]]; then
	kill "$PROXY_PID";
fi;

