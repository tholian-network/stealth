
import fs      from 'fs';
import path    from 'path';
import process from 'process';
import Buffer  from 'buffer';

import { console } from '../stealth/source/console.mjs';
import { HOSTS   } from '../stealth/source/parser/HOSTS.mjs';
import { URL     } from '../stealth/source/parser/URL.mjs';

const DOMAINS  = {};
const PROFILE  = process.env.PWD + '/profile';
const PAYLOADS = [];


const get_url = function(ref) {

	let url = '';

	let domain    = ref.domain    || null;
	let host      = ref.host      || null;
	let path      = ref.path      || null;
	let query     = ref.query     || null;
	let subdomain = ref.subdomain || null;

	if (domain !== null) {

		if (subdomain !== null) {
			url += subdomain + '.' + domain;
		} else {
			url += domain;
		}

	} else if (host !== null) {
		url += host;
	}

	if (path !== null) {
		url += path;
	}

	// wget stores query in filename
	if (query !== null) {
		url += '?' + query;
	}

	return url;

};

const read = function(link) {

	let ref = URL.parse(link);
	let url = get_url(ref);

	let buffer = null;
	try {
		buffer = fs.readFileSync(PROFILE + '/cache/payload/' + url);
	} catch (err) {
	}

	return buffer;

};

const write = function(file, data) {

	let folder = path.dirname(file);

	fs.lstat(folder, (err, stat) => {

		if (!err) {

			fs.writeFile(file, JSON.stringify(data, null, '\t'), 'utf8', err => {

				if (!err) {
					console.info('Blockers stored to "' + file.substr(process.env.PWD.length) + '".');
				} else {
					console.error('Settings at "' + PROFILE.substr(0, process.env.PWD.length) + '" are not writeable!');
				}

			});

		} else if (err.code === 'ENOENT') {

			fs.mkdir(folder, {
				recursive: true
			}, (err) => {
				fs.writeFile(file, JSON.stringify(data, null, '\t'), 'utf8', err => {

					if (!err) {
						console.info('Blockers stored to "' + file.substr(process.env.PWD.length) + '".');
					} else {
						console.error('Settings at "' + PROFILE.substr(0, process.env.PWD.length) + '" are not writeable!');
					}

				});
			});

		}

	});

};



[
	'https://ransomwaretracker.abuse.ch/downloads/CW_C2_DOMBL.txt',
	'https://ransomwaretracker.abuse.ch/downloads/LY_C2_DOMBL.txt',
	'https://ransomwaretracker.abuse.ch/downloads/TC_C2_DOMBL.txt',
	'https://ransomwaretracker.abuse.ch/downloads/TL_C2_DOMBL.txt',
	'https://ransomwaretracker.abuse.ch/downloads/RW_DOMBL.txt',
	'https://zeustracker.abuse.ch/blocklist.php?download=domainblocklist',
	'https://adaway.org/hosts.txt',
	'https://dshield.org/feeds/suspiciousdomains_Low.txt',
	'https://dshield.org/feeds/suspiciousdomains_Medium.txt',
	'https://dshield.org/feeds/suspiciousdomains_High.txt',
	'https://hostsfile.org/Downloads/hosts.txt',
	'https://hosts-file.net/ad_servers.txt',
	'https://hosts-file.net/emd.txt',
	'https://hosts-file.net/exp.txt',
	'https://hosts-file.net/grm.txt',
	'https://hosts-file.net/psh.txt',
	'https://hostsfile.mine.nu/hosts0.txt',
	'https://v.firebog.net/hosts/BillStearns.txt',
	'https://v.firebog.net/hosts/Easylist.txt',
	'https://v.firebog.net/hosts/Easyprivacy.txt',
	'https://v.firebog.net/hosts/Kowabit.txt',
	'https://v.firebog.net/hosts/Prigent-Ads.txt',
	'https://phishing.army/download/phishing_army_blocklist_extended.txt',
	'http://someonewhocares.org/hosts/hosts',
	'http://winhelp2002.mvps.org/hosts.txt'
].forEach((url) => {

	let payload = read(url);
	if (payload !== null) {

		console.log('Parse "' + url + '" ...');

		let hosts = HOSTS.parse(payload);
		if (hosts !== null) {

			hosts.forEach((host) => {

				let ref = URL.parse(host.domain);
				if (ref !== null) {

					let domain = DOMAINS[ref.domain] || null;
					if (domain === null) {
						domain = DOMAINS[ref.domain] = [];
					}

					let subdomain = ref.subdomain || null;
					if (subdomain !== null) {

						if (domain.includes(subdomain) === false) {
							domain.push(subdomain);
						}

					}

				}

			});

			console.log(hosts.length + ' Hosts found.');

		}

	}

});


setTimeout(() => {

	let blockers = [];
	let count    = 0;

	for (let domain in DOMAINS) {

		let subdomains = DOMAINS[domain];
		if (subdomains.length > 0) {

			subdomains.forEach((subdomain) => {

				blockers.push({
					domain: subdomain + '.' + domain
				});

			});

		}

		count += subdomains.length;

	}

	console.info(count + ' Hosts resulted in ' + blockers.length + ' Blockers.');

	write(PROFILE + '/blockers.json', blockers.sort((a, b) => {

		if (a.domain > b.domain) return  1;
		if (b.domain > a.domain) return -1;

		return 0;

	}));

}, 1000);

