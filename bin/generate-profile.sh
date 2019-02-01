#!/usr/bin/env bash

root_dir="$(dirname "$(dirname "$(readlink -f "$0")")")";
node_bin="$(which node)";
wget_bin="$(which wget)";

_download() {

	url="$1";
	path="";
	folder="";

	if [[ "$url" == https://* ]]; then
		path=`printf '%s\n' "${url##https://}"`;
		folder=$(dirname "$path");
	elif [[ "$url" == http://* ]]; then
		path=`printf '%s\n' "${url##http://}"`;
		folder=$(dirname "$path");
	fi;

	if [[ "$path" != "" ]] && [[ "$folder" != "" ]]; then

		cd "$root_dir";

		mkdir -p "$root_dir/profile/cache/$folder";
		wget "$url" -O "$root_dir/profile/cache/$path";

	fi;

}



#
# Re-download hosts files into cache
#
if [[ -z "$wget_bin" ]]; then
	echo "Please install wget first";
	exit 1;
fi;

_download "http://winhelp2002.mvps.org/hosts.txt";
_download "http://someonewhocares.org/hosts/hosts";



#
# Re-generate blockers/hosts.json
#

if [[ -z "$node_bin" ]]; then
	echo "Please install node.js first";
	exit 1;
fi;

cd "$root_dir";

"$node_bin" --experimental-modules ./bin/generate-default-profile.mjs;


