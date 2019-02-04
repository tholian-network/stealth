
import fs      from 'fs';
import path    from 'path';
import process from 'process';
import Buffer  from 'buffer';

import { AdGuard } from '../stealth/source/parser/AdGuard.mjs';
import { Hosts   } from '../stealth/source/parser/Hosts.mjs';
import { URL     } from '../stealth/source/parser/URL.mjs';

const _PROFILE  = process.env.PWD + '/profile';
const _BLOCKERS = { hosts: [], filters: [], optimizers: [] };
const _PAYLOADS = { adguard: [], hosts: [] };

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
				buffer = fs.readFileSync(_PROFILE + '/cache/' + rdomain + rpath);
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
	'http://winhelp2002.mvps.org/hosts.txt',
	'http://someonewhocares.org/hosts/hosts'
].forEach(url => {

	let payload = _read(url);
	if (payload !== null) {
		_PAYLOADS.hosts.push(payload);
	}

});

[

	'https://easylist-downloads.adblockplus.org/fanboy-annoyance.txt',
	'https://easylist-downloads.adblockplus.org/fanboy-social.txt',
	'https://easylist-downloads.adblockplus.org/easylist_noelemhide.txt',
	'https://easylist-downloads.adblockplus.org/easyprivacy.txt',

	'https://filters.adtidy.org/extension/chromium/filters/1.txt',
	'https://filters.adtidy.org/extension/chromium/filters/2.txt',
	'https://filters.adtidy.org/extension/chromium/filters/4.txt',
	'https://filters.adtidy.org/extension/chromium/filters/6.txt',
	'https://filters.adtidy.org/extension/chromium/filters/14.txt',
	'https://filters.adtidy.org/extension/chromium/filters/15.txt',
	'https://filters.adtidy.org/extension/chromium/filters/16.txt',

].forEach(url => {

	let payload = _read(url);
	if (payload !== null) {
		_PAYLOADS.adguard.push(payload);
	}

});


setTimeout(() => {

	_PAYLOADS.hosts.forEach(payload => {

		let blockers = Hosts.parse(payload);
		if (blockers !== null) {

			blockers.hosts.forEach(ref => {

				let check = _BLOCKERS.hosts.find(b => b.domain === ref.domain && b.subdomain === ref.subdomain) || null;
				if (check === null) {
					_BLOCKERS.hosts.push(ref);
				}

			});

		}

	});

	_PAYLOADS.adguard.forEach(payload => {

		let blockers = AdGuard.parse(payload);
		if (blockers !== null) {

			blockers.hosts.forEach(ref => {

				let check = _BLOCKERS.hosts.find(b => b.domain === ref.domain && b.subdomain === ref.subdomain) || null;
				if (check === null) {
					_BLOCKERS.hosts.push(ref);
				}

			});

			blockers.filters.forEach(ref => {

				let check = _BLOCKERS.filters.find(b => {
					return (
						b.domain === ref.domain
						&& b.subdomain === ref.subdomain
						&& b.prefix === ref.prefix
						&& b.midfix === ref.midfix
						&& b.suffix === ref.suffix
					);
				}) || null;

				if (check === null) {
					_BLOCKERS.filters.push(ref);
				}

			});

		}

	});

	_BLOCKERS.hosts = _BLOCKERS.hosts.sort((a, b) => {

		if (a.domain > b.domain) return  1;
		if (b.domain > a.domain) return -1;

		if (a.domain === b.domain) {
			if ((a.subdomain || '') > (b.subdomain || '')) return  1;
			if ((b.subdomain || '') > (a.subdomain || '')) return -1;
		}

		return 0;

	});

	_BLOCKERS.filters = _BLOCKERS.filters.sort((a, b) => {

		if (a.domain > b.domain) return  1;
		if (b.domain > a.domain) return -1;

		if (a.domain === b.domain) {
			if ((a.subdomain || '') > (b.subdomain || '')) return  1;
			if ((b.subdomain || '') > (a.subdomain || '')) return -1;
			if (a.subdomain === b.subdomain) {
				if ((a.prefix || '') > (b.prefix || '')) return  1;
				if ((b.prefix || '') > (a.prefix || '')) return -1;
				if ((a.midfix || '') > (b.midfix || '')) return  1;
				if ((b.midfix || '') > (a.midfix || '')) return -1;
				if ((a.suffix || '') > (b.suffix || '')) return  1;
				if ((b.suffix || '') > (a.suffix || '')) return -1;
			}
		}

		return 0;

	});


	_write(_PROFILE + '/blockers/hosts.json',      _BLOCKERS.hosts);
	_write(_PROFILE + '/blockers/filters.json',    _BLOCKERS.filters);
	_write(_PROFILE + '/blockers/optimizers.json', _BLOCKERS.optimizers);

}, 1000);

