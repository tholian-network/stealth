#!/bin/bash

ROOT=$(cd "$(dirname "$(readlink -f "$0")")/../"; pwd);
NODE=`which node`;



if [ "$NODE" != "" ]; then

	cd $ROOT;
	$NODE --experimental-modules ./stealth/stealth.mjs "$@";

else

	echo "Please install node.js first";
	exit 1;

fi;

