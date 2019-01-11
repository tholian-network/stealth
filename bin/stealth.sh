#!/bin/bash

ROOT=$(cd "$(dirname "$(readlink -f "$0")")/../"; pwd);
NODE=`which node`;



if [ "$NODE" != "" ]; then

	cd $ROOT;
	$NODE --experimental-modules ./stealth/stealth.mjs "$1" "$2" "$3" "$4" "$5" "$6" "$7" "$8";

else

	echo "Please install node.js first";
	exit 1;

fi;

