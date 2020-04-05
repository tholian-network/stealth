#!/bin/sh

root_dir="$(dirname "$(dirname "$(dirname "$(readlink -f "$0")")")")";

forced="";
system="$(uname)";

if [[ "$1" == "--force" ]]; then
	forced="$2";
fi;



build_browser() {

	cd "$root_dir";

	sh "./base/bin/base.sh";

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

build_sandbox() {

	local folder="/tmp/stealth";
	local mktemp_bin="$(which mktemp)";

	if [[ ! -z "$mktemp_bin" ]]; then
		folder="$(mktemp -d -t "stealth.XXXXXXXX")";
	fi;

	if [[ -d "$folder" ]]; then
		rm -rf "$folder" 2> /dev/null;
	fi;

	mkdir "$folder";
	echo "$folder";

}



if [[ "$system" == "Linux" ]]; then

	chromium_bin="$(which chromium)";
	electron_bin="$(which electron)";
	gjs_bin="$(which gjs)";
	qml_bin="$(which qmlscene)";

	if [[ "$forced" == "qml" ]]; then
		chromium_bin="";
		electron_bin="";
		gjs_bin="";
	elif [[ "$forced" == "gjs" ]]; then
		chromium_bin="";
		electron_bin="";
		qml_bin="";
	elif [[ "$forced" == "electron" ]]; then
		chromium_bin="";
		gjs_bin="";
		qml_bin="";
	fi;


	build_browser;
	folder="$(build_sandbox)";


	if [[ ! -z "$chromium_bin" ]]; then

		echo "> Launching Chromium App ...";

		cd "$root_dir";
		$chromium_bin --user-data-dir="$folder" --app="http://localhost:65432/browser/index.html";

		if [[ $? == 0 ]] && [[ -d "$folder" ]]; then
			rm -rf "$folder";
		fi;

	elif [[ ! -z "$electron_bin" ]]; then

		echo "> Launching Electron App ...";

		cd "$root_dir";
		$electron_bin --user-data-dir="$folder" ./browser/bin/electron/application.js;

		if [[ $? == 0 ]] && [[ -d "$folder" ]]; then
			rm -rf "$folder";
		fi;

	elif [[ ! -z "$gjs_bin" ]]; then

		echo "> Launching GJS App ...";

		cd "$root_dir";
		$gjs_bin ./browser/bin/gjs/application.js;

	elif [[ ! -z "$qml_bin" ]]; then

		ldconfig_bin="$(which ldconfig)";

		if [[ ! -z "$ldconfig_bin" ]]; then

			lib_webview="$(ldconfig_bin -p | grep libQt5WebView)";
			lib_controls="$(ldconfig_bin -p | grep libQt5Quick)";

			if [[ "$lib_webview" != "" ]] && [[ "$lib_controls" != "" ]]; then

				echo "> Launching QML App ...";

				cd "$root_dir";
				$qml_bin ./browser/bin/qml/application.qml;

			else

				echo "Please install QtQuickControls and QtWebView first.";
				exit 1;

			fi;

		fi;

	else

		echo "Please install Ungoogled Chromium first";
		exit 1;

	fi;

elif [[ "$system" == "Darwin" ]]; then

	open_bin="$(which open)";


	if [[ -d "/Applications/Ungoogled Chromium.app" ]]; then
		chromium_app="/Applications/Ungoogled Chromium.app";
	elif [[ -d "/Applications/Chromium.app" ]]; then
		chromium_app="/Applications/Chromium.app";
	elif [[ -d "/Applications/Google Chrome.app" ]]; then
		chromium_app="/Applications/Google Chrome.app";
	fi;

	if [[ -d "/Applications/Safari.app" ]]; then
		safari_app="/Applications/Safari.app";
	fi;


	if [[ "$forced" == "safari" ]]; then
		chromium_app="";
	fi;


	build_browser;
	folder="$(build_sandbox)";


	if [[ ! -z "$open_bin" ]]; then

		if [[ ! -z "$chromium_app" ]]; then

			echo "> Launching Chromium App ...";

			cd "$root_dir";
			$open_bin -W -a "$chromium_app" --args --user-data-dir="$folder" --app="http://localhost:65432/browser/index.html";

			if [[ $? == 0 ]] && [[ -d "$folder" ]]; then
				rm -rf "$folder";
			fi;

		elif [[ ! -z "$safari_app" ]]; then

			echo "> Launching Safari App ...";

			cd "$root_dir";
			$open_bin -W -a "$safari_app" "http://localhost:65432/browser/index.html";

		else

			echo "Please install Ungoogled Chromium first";
			exit 1;

		fi;

	else

		echo "Is this really MacOS?";
		exit 1;

	fi;

fi;

