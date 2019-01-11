#!/bin/bash

ROOT=$(cd "$(dirname "$(readlink -f "$0")")/../"; pwd);
NWJS=`which nw`;

# search for iframe and browser init script
HTML_s_iframe='<iframe id="main-frame" sandbox="allow-scripts allow-same-origin" src="http://localhost:65432/browser/about/welcome.html"></iframe>';
HTML_s_script='<script type="module" src="./browser.mjs"></script>';

# replace with webview and nw.js init script
HTML_r_iframe='<webview id="main-frame" src="http://localhost:65432/browser/about/welcome.html" autosize="on" allowtransparency></webview>';
HTML_r_script='<script type="module" src="./webview.mjs"></script>';


if [ "$NWJS" != "" ]; then

	cd $ROOT;
	rm -rf $ROOT/build;
	mkdir $ROOT/build;

	cp -R $ROOT/browser/* $ROOT/build/;
	cp -R $ROOT/webview/* $ROOT/build/;
	rm $ROOT/build/browser.mjs;

	sed -i "s|$HTML_s_iframe|$HTML_r_iframe|g" $ROOT/build/index.html;
	sed -i "s|$HTML_s_script|$HTML_r_script|g" $ROOT/build/index.html;

	cd $ROOT/build;
	$NWJS . "$1" "$2" "$3" "$4" "$5" "$6" "$7" "$8";

else

	echo "Please install nw.js first";
	exit 1;

fi;

