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

	if [[ ! -d "./browser/extern" ]]; then
		mkdir "./browser/extern";
	fi;

	rm "./browser/extern/base.mjs"    2> /dev/null;
	rm "./browser/source/Browser.mjs" 2> /dev/null;
	rm "./browser/source/Tab.mjs"     2> /dev/null;
	rm -rf "./browser/source/client"  2> /dev/null;
	rm -rf "./browser/source/parser"  2> /dev/null;

	cp "./base/build/browser.mjs"     "./browser/extern/base.mjs";
	cp "./stealth/source/Browser.mjs" "./browser/source/Browser.mjs";
	cp "./stealth/source/Tab.mjs"     "./browser/source/Tab.mjs";
	cp -R "./stealth/source/client"   "./browser/source/client";
	cp -R "./stealth/source/parser"   "./browser/source/parser";

}

build_stealth() {

	cd "$root_dir";

	bash "./base/bin/base.sh";

	if [[ ! -d "./stealth/extern" ]]; then
		mkdir "./stealth/extern";
	fi;

	rm "./stealth/extern/base.mjs" 2> /dev/null;
	cp "./base/build/node.mjs"     "./stealth/extern/base.mjs";

}



cd "$root_dir";

build_browser;
build_stealth;

exec "$node_bin" --tls-cipher-list="ECDHE-RSA-AES128-GCM-SHA256" --no-warnings --experimental-modules ./stealth/bin/stealth.mjs "$@";

