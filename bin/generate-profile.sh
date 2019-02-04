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


# Host Blockers
_download "http://winhelp2002.mvps.org/hosts.txt";
_download "http://someonewhocares.org/hosts/hosts";
_download "https://filters.adtidy.org/extension/chromium/filters/15.txt"; # AdGuard Domain

_download "https://easylist-downloads.adblockplus.org/fanboy-annoyance.txt";
_download "https://easylist-downloads.adblockplus.org/fanboy-social.txt";
_download "https://easylist-downloads.adblockplus.org/easylist_noelemhide.txt";
_download "https://easylist-downloads.adblockplus.org/easyprivacy.txt";

# Filters and Optimizers
# XXX: Shittiest Download Servers on the Internet
# _download "https://filters.adtidy.org/extension/chromium/filters/1.txt";  # AdGuard Russian
# _download "https://filters.adtidy.org/extension/chromium/filters/2.txt";  # AdGuard Base
# _download "https://filters.adtidy.org/extension/chromium/filters/4.txt";  # AdGuard Social Media
# _download "https://filters.adtidy.org/extension/chromium/filters/6.txt";  # AdGuard German
# _download "https://filters.adtidy.org/extension/chromium/filters/14.txt"; # AdGuard Annoyances
# _download "https://filters.adtidy.org/extension/chromium/filters/16.txt"; # AdGuard French



#
# Re-generate blockers/hosts.json
#

if [[ -z "$node_bin" ]]; then
	echo "Please install node.js first";
	exit 1;
fi;

cd "$root_dir";

"$node_bin" --experimental-modules ./bin/generate-profile.mjs;


