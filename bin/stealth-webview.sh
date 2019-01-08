#!/bin/bash

ROOT=$(cd "$(dirname "$(readlink -f "$0")")/../"; pwd);
NWJS=`which nw`;



if [ "$NWJS" != "" ]; then

	cd $ROOT/webview;
	$NWJS ./index.html "$1" "$2" "$3" "$4" "$5" "$6" "$7" "$8";

else

	echo "Please install nw.js first";
	exit 1;

fi;

