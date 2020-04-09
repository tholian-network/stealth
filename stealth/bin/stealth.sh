#!/bin/bash

root_dir="$(dirname "$(dirname "$(dirname "$(readlink -f "$0")")")")";
node_bin="$(which node)";



if [[ -z "$node_bin" ]]; then
	echo "Please install node.js first";
	exit 1;
fi;



build_browser() {

	cd "$root_dir";

	bash "./base/bin/base.sh";

	if [ -f "./browser/source/BASE.mjs" ]; then
		rm "./browser/source/BASE.mjs";
	fi;

	cp "./base/build/browser/BASE.mjs" "./browser/source/BASE.mjs";


	if [ -d "./browser/source/client" ]; then
		rm -rf "./browser/source/client";
	fi;

	cp -R "./stealth/source/client" "./browser/source/client";

	if [ -d "./browser/source/parser" ]; then
		rm -rf "./browser/source/parser";
	fi;

	cp -R "./stealth/source/parser" "./browser/source/parser";

}

build_stealth() {

	cd "$root_dir";

	if [ -f "./stealth/source/BASE.mjs" ]; then
		rm "./stealth/source/BASE.mjs";
	fi;

	cp "./base/build/node/BASE.mjs" "./stealth/source/BASE.mjs";

}



cd "$root_dir";

build_browser;
build_stealth;

exec "$node_bin" --tls-cipher-list="ECDHE-RSA-AES128-GCM-SHA256" --no-warnings --experimental-modules ./bin/stealth.mjs "$@";

