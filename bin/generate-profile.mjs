
import fs      from 'fs';
import path    from 'path';
import process from 'process';
import Buffer  from 'buffer';

import { AdGuard } from '../stealth/source/parser/AdGuard.mjs';
import { Hosts   } from '../stealth/source/parser/Hosts.mjs';
import { URL     } from '../stealth/source/parser/URL.mjs';

const _PROFILE   = process.env.PWD + '/profile';
const _PAYLOADS  = { adguard: [], hosts: [] };
const _THRESHOLD = 16; // if this many subdomains, main domain is blocked instead.

const _read = function(url) {

	let ref     = URL.parse(url);
	let rdomain = ref.domain || null;
	if (rdomain !== null) {

		let rsubdomain = ref.subdomain || null;
		if (rsubdomain !== null) {
			rdomain = rsubdomain + '.' + rdomain;
		}

		let rpath = ref.path || '/';
		if (rpath !== '/') {

			let buffer = null;
			try {
				buffer = fs.readFileSync(_PROFILE + '/cache/payload/' + rdomain + rpath);
			} catch (err) {
			}

			if (buffer !== null) {
				return buffer;
			}

		}

	}


	return null;

};

const _write = function(file, data) {

	let folder = path.dirname(file);

	fs.lstat(folder, (err, stat) => {

		if (!err) {

			fs.writeFile(file, JSON.stringify(data, null, '\t'), 'utf8', err => {
				if (!err) console.log('> generated ' + file.substr(_PROFILE.length) + ' with ' + data.length + ' entries.');
			});

		} else if (err.code === 'ENOENT') {

			fs.mkdir(folder, {
				recursive: true
			}, (err) => {
				fs.writeFile(file, JSON.stringify(data, null, '\t'), 'utf8', err => {
					if (!err) console.log('> generated ' + file.substr(_PROFILE.length) + ' with ' + data.length + ' entries.');
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
].forEach(url => {

	let payload = _read(url);
	if (payload !== null) {
		_PAYLOADS.hosts.push({
			url:     url,
			payload: payload
		});
	}

});

[
	'https://filters.adtidy.org/extension/chromium/filters/15.txt'
].forEach(url => {

	let payload = _read(url);
	if (payload !== null) {
		_PAYLOADS.adguard.push({
			url:     url,
			payload: payload
		});
	}

});


setTimeout(() => {

	let domains = {};

	_PAYLOADS.hosts.forEach(entry => {

		console.log('> processing ' + entry.url + ' ...');

		let blockers = Hosts.parse(entry.payload);
		if (blockers !== null) {

			blockers.forEach(ref => {

				let domain = domains[ref.domain] || null;
				if (domain === null) {
					domain = domains[ref.domain] = [];
				}

				let subdomain = ref.subdomain || null;
				if (subdomain !== null) {

					if (domain.includes(subdomain) === false && domain.length < _THRESHOLD) {
						domain.push(subdomain);
					}

				}

			});

		}

	});

	_PAYLOADS.adguard.forEach(entry => {

		console.log('> processing ' + entry.url + ' ...');

		let blockers = AdGuard.parse(entry.payload);
		if (blockers !== null) {

			blockers.forEach(ref => {

				let domain = domains[ref.domain] || null;
				if (domain === null) {
					domain = domains[ref.domain] = [];
				}

				let subdomain = ref.subdomain || null;
				if (subdomain !== null) {

					if (domain.includes(subdomain) === false && domain.length < _THRESHOLD) {
						domain.push(subdomain);
					}

				}

			});

		}

	});


	let cache = [];

	for (let domain in domains) {

		let subdomains = domains[domain];
		if (subdomains.length === _THRESHOLD) {

			cache.push({
				domain:    domain,
				subdomain: null
			});

		} else if (subdomains.length > 0) {

			subdomains.forEach(subdomain => {
				cache.push({
					domain:    domain,
					subdomain: subdomain
				});
			});

		} else {

			cache.push({
				domain:    domain,
				subdomain: null
			});

		}

	};

	let database = cache.sort((a, b) => {

		if (a.domain > b.domain) return  1;
		if (b.domain > a.domain) return -1;

		if (a.domain === b.domain) {
			if ((a.subdomain || '') > (b.subdomain || '')) return  1;
			if ((b.subdomain || '') > (a.subdomain || '')) return -1;
		}

		return 0;

	});


	_write(_PROFILE + '/blockers.json', database);

}, 1000);

