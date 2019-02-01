
import fs          from 'fs';
import path        from 'path';
import process     from 'process';
import Buffer      from 'buffer';
import { Blocker } from '../stealth/source/request/Blocker.mjs';
import { URL     } from '../stealth/source/parser/URL.mjs';



const _PROFILE  = process.env.PWD + '/profile';
const _PAYLOADS = [
	'http://winhelp2002.mvps.org/hosts.txt',
	'http://someonewhocares.org/hosts/hosts'
].map(url => {

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

}).filter(buf => buf !== null);


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


Blocker.refresh(_PAYLOADS, blockers => {
	_write(_PROFILE + '/blockers/hosts.json',   blockers.hosts);
	_write(_PROFILE + '/blockers/filters.json', blockers.filters);
});

