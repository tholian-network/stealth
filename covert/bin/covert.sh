#!/bin/bash

root_dir="$(dirname "$(dirname "$(dirname "$(readlink -f "$0")")")")";
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


start_socks_proxy() {

	cd "$root_dir/covert/sketch/socks-proxy";
	make -C "$root_dir/covert/sketch/socks-proxy" -s > /dev/null;

	if [[ $? != 0 ]]; then
		echo "Compilation of SOCKS Proxy failed.";
		exit 1;
	fi;

	cd "$root_dir/covert/sketch/socks-proxy";
	chmod +x ./socks-proxy;
	./socks-proxy -i "127.0.0.3" &

}

start_socks_proxy;


cd "$root_dir";

"$node_bin" --no-warnings --experimental-modules ./covert/bin/covert.mjs "$@";

exit_code="$?";
proxy_pid=$(ps -o pid -C socks-proxy | tail -n +2);

if [[ "$proxy_pid" != "" ]]; then
	kill "$proxy_pid";
fi;

exit $exit_code;


