#!/usr/bin/env sh

system="$(uname)";

if [[ "$system" == "Linux" ]]; then

	chromium_bin="$(which chromium)";

fi;



# Shared between Browser and Extension
mkdir -p ./browser-extension/source/parser;
cp ./browser/design/content.css           ./browser-extension/design/content.css;
cp ./browser/design/control.css           ./browser-extension/design/control.css;
cp ./browser/design/Element.mjs           ./browser-extension/design/Element.mjs;
cp ./browser/design/other/icon.woff       ./browser-extension/design/other/icon.woff;
cp ./browser/design/other/index.css       ./browser-extension/design/other/index.css;
cp ./browser/design/other/museo.woff      ./browser-extension/design/other/museo.woff;
cp ./browser/design/other/museo-bold.woff ./browser-extension/design/other/museo-bold.woff;
cp ./browser/design/other/vera-mono.woff  ./browser-extension/design/other/vera-mono.woff;

# Shared between Stealth and Extension
cp ./stealth/source/POLYFILLS.mjs  ./browser-extension/source/POLYFILLS.mjs;
cp ./stealth/source/parser/IP.mjs  ./browser-extension/source/parser/IP.mjs;
cp ./stealth/source/parser/URL.mjs ./browser-extension/source/parser/URL.mjs;



if [[ ! -z "$chromium_bin" ]]; then

	echo "> Launching Chromium with Extension ...";
	$chromium_bin --user-data-dir="$folder" --load-extension="./browser-extension";

	if [[ $? == 0 ]] && [[ -d "$folder" ]]; then
		rm -rf "$folder";
	fi;

fi;


