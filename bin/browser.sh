#!/usr/bin/env sh


folder="/tmp/stealth";
forced="";
system="$(uname)";


mktemp_bin="$(which mktemp)";

if [[ ! -z "$mktemp_bin" ]]; then
	folder="$(mktemp -d -t "stealth.XXXXXXXX")";
fi;


if [[ "$1" == "--force" ]]; then
	forced="$2";
fi;


if [[ "$system" == "Linux" ]]; then

	chromium_bin="$(which chromium)";
	firefox_bin="$(which firefox)";
	gjs_bin="$(which gjs)";
	qml_bin="$(which qmlscene)";

	if [[ "$forced" == "qml" ]]; then
		chromium_bin="";
		firefox_bin="";
		gjs_bin="";
	elif [[ "$forced" == "gjs" ]]; then
		chromium_bin="";
		firefox_bin="";
		qml_bin="";
	elif [[ "$forced" == "firefox" ]]; then
		chromium_bin="";
		gjs_bin="";
		qml_bin="";
	fi;



	if [[ -d "$folder" ]]; then
		rm -rf $folder;
	fi;

	mkdir $folder;
	cd "$root_dir";



	#
	# Shared between Stealth and Browser
	#

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
	cp ./stealth/source/client/Settings.mjs ./browser/source/client/Settings.mjs;
	cp ./stealth/source/client/Stash.mjs    ./browser/source/client/Stash.mjs;
	cp ./stealth/source/parser/IP.mjs       ./browser/source/parser/IP.mjs;
	cp ./stealth/source/parser/URL.mjs      ./browser/source/parser/URL.mjs;



	if [[ ! -z "$chromium_bin" ]]; then

		$chromium_bin --user-data-dir="$folder" --app="http://localhost:65432/browser/index.html";

		if [[ $? == 0 ]] && [[ -d "$folder" ]]; then
			rm -rf "$folder";
		fi;

	elif [[ ! -z "$firefox_bin" ]]; then

		$firefox_bin -app ./bin/firefox/application.ini -profile "$folder" --safe-mode;

		if [[ $? == 0 ]] && [[ -d "$folder" ]]; then
			rm -rf "$folder";
		fi;

	elif [[ ! -z "$gjs_bin" ]]; then

		$gjs_bin ./bin/gjs/application.js;

	elif [[ ! -z "$qml_bin" ]]; then

		# FIXME: How to resolve paths cross-Linux correctly?
		# There seems to be no environment variable for this.

		if [[ -x "/usr/lib/x86_64-linux-gnu/qt5/qml/QtQuick/Controls" ]] && [[ -x "/usr/lib/x86_64-linux-gnu/qt5/qml/QtWebView" ]]; then
			$qml_bin ./bin/qml/application.qml;
		elif [[ -x "/usr/lib/qt/qml/QtQuick/Controls" ]] && [[ -x "/usr/lib/qt/qml/QtWebView" ]]; then
			$qml_bin ./bin/qml/application.qml;
		elif [[ -x "/usr/lib64/qt5/qml/QtQuick/Controls" ]] && [[ -x "/usr/lib64/qt5/qml/QtWebView" ]]; then
			$qml_bin ./bin/qml/application.qml;
		elif [[ -x "/usr/lib32/qt5/qml/QtQuick/Controls" ]] && [[ -x "/usr/lib32/qt5/qml/QtWebView" ]]; then
			$qml_bin ./bin/qml/application.qml;
		else

			ldconfig_bin="$(which ldconfig)";

			if [[ ! -z "$ldconfig_bin" ]]; then

				lib_webview="$ldconfig_bin -p | grep libQt5WebView)";
				lib_controls="$($ldconfig_bin -p | grep libQt5Quick)";

				if [[ "$lib_webview" != "" ]] && [[ "$lib_controls" != "" ]]; then
					$qml_bin ./bin/qml/application.qml;
				else

					echo "Please install QtQuickControls and QtWebView first.";
					exit 1;

				fi;

			else

				echo "Please install QtQuickControls and QtWebView first.";
				exit 1;

			fi;

		fi;

	else

		echo "Please install Ungoogled Chromium or Firefox first";
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

	if [[ -d "/Applications/Firefox.app" ]]; then
		firefox_app="/Applications/Firefox.app";
	fi;

	if [[ -d "/Applications/Safari.app" ]]; then
		safari_app="/Applications/Safari.app";
	fi;


	if [[ "$forced" == "safari" ]]; then
		chromium_app="";
		firefox_app="";
	elif [[ "$forced" == "firefox" ]]; then
		chromium_app="";
		safari_app="";
	fi;



	if [[ -d "$folder" ]]; then
		rm -rf $folder;
	fi;

	mkdir $folder;
	cd "$root_dir";



	if [[ ! -z "$open_bin" ]]; then

		if [[ ! -z "$chromium_app" ]]; then

			$open_bin -W -a "$chromium_app" --args --user-data-dir="$folder" --app="http://localhost:65432/browser/index.html";

			if [[ $? == 0 ]] && [[ -d "$folder" ]]; then
				rm -rf "$folder";
			fi;

		elif [[ ! -z "$firefox_app" ]]; then

			# XXX: Firefox.app cannot be opened as an App
			# $open_bin -W -a "$firefox_app" --args -app ./bin/firefox/application.ini -profile "$folder" --safe-mode;
			"$firefox_app/Contents/MacOS/firefox-bin" -app ./bin/firefox/application.ini -profile "$folder" --safe-mode;

			if [[ $? == 0 ]] && [[ -d "$folder" ]]; then
				rm -rf "$folder";
			fi;

		elif [[ ! -z "$safari_app" ]]; then

			$open_bin -W -a "$safari_app" "http://localhost:65432/browser/index.html";

		else

			echo "Please install Ungoogled Chromium or Firefox first";
			exit 1;

		fi;

	else

		echo "Is this really MacOS?";
		exit 1;

	fi;

fi;

