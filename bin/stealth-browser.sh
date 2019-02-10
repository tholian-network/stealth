#!/usr/bin/env sh

browser_tmp="/tmp/stealth-browser";
chromium_bin="$(which chromium)";


if [[ -d $browser_tmp ]]; then
	rm -rf $browser_tmp;
	mkdir $browser_tmp;
fi;

if [[ -z "$chromium_bin" ]]; then
	echo "Please install ungoogled-chromium first";
	exit 1;
fi;

cd "$root_dir";

chromium --user-data-dir="$browser_tmp" --app="http://localhost:65432/browser/index.html" --start-fullscreen;

