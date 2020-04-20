#!/bin/bash

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

		mkdir -p "$root_dir/profile/cache/payload/$folder";
		wget -c "$url" -O "$root_dir/profile/cache/payload/$path";

	fi;

}



#
# Re-download hosts files into vendor cache
#

if [[ -z "$wget_bin" ]]; then
	echo "Please install wget first";
	exit 1;
fi;

_download "https://ransomwaretracker.abuse.ch/downloads/CW_C2_DOMBL.txt";
_download "https://ransomwaretracker.abuse.ch/downloads/LY_C2_DOMBL.txt";
_download "https://ransomwaretracker.abuse.ch/downloads/TC_C2_DOMBL.txt";
_download "https://ransomwaretracker.abuse.ch/downloads/TL_C2_DOMBL.txt";
_download "https://ransomwaretracker.abuse.ch/downloads/RW_DOMBL.txt";
_download "https://zeustracker.abuse.ch/blocklist.php?download=domainblocklist";
_download "https://adaway.org/hosts.txt";
_download "https://dshield.org/feeds/suspiciousdomains_Low.txt";
_download "https://dshield.org/feeds/suspiciousdomains_Medium.txt";
_download "https://dshield.org/feeds/suspiciousdomains_High.txt";
_download "https://hostsfile.org/Downloads/hosts.txt";
_download "https://hosts-file.net/ad_servers.txt";
_download "https://hosts-file.net/emd.txt";
_download "https://hosts-file.net/exp.txt";
_download "https://hosts-file.net/grm.txt";
_download "https://hosts-file.net/psh.txt";
_download "https://hostsfile.mine.nu/hosts0.txt";
_download "https://v.firebog.net/hosts/BillStearns.txt";
_download "https://v.firebog.net/hosts/Easylist.txt";
_download "https://v.firebog.net/hosts/Easyprivacy.txt";
_download "https://v.firebog.net/hosts/Kowabit.txt";
_download "https://v.firebog.net/hosts/Prigent-Ads.txt";
_download "https://phishing.army/download/phishing_army_blocklist_extended.txt";
_download "http://someonewhocares.org/hosts/hosts";
_download "http://winhelp2002.mvps.org/hosts.txt";



#
# Re-generate blockers.json
#

if [[ -z "$node_bin" ]]; then
	echo "Please install node.js first";
	exit 1;
fi;

cd "$root_dir";

"$node_bin" --experimental-modules ./bin/generate-profile.mjs;

