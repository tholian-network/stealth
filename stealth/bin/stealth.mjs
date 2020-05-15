
import fs      from 'fs';
import url     from 'url';
import path    from 'path';
import process from 'process';

import { console                                        } from '../../base/index.mjs';
import { build as build_browser, clean as clean_browser } from '../../browser/bin/browser.mjs';

import { Stealth     } from '../source/Stealth.mjs';
import { ENVIRONMENT } from '../source/ENVIRONMENT.mjs';



const FILE = url.fileURLToPath(import.meta.url);
const ROOT = path.dirname(path.resolve(FILE, '../../'));

const copy = (origin, target) => {

	let stat   = null;
	let result = false;

	try {
		stat = fs.statSync(origin);
	} catch (err) {
		stat = null;
	}

	if (stat !== null) {

		if (stat.isFile() === true) {

			stat = null;

			try {
				stat = fs.statSync(path.dirname(target));
			} catch (err) {
				stat = null;
			}

			if (stat === null || stat.isDirectory() === false) {

				try {
					fs.mkdirSync(path.dirname(target), {
						recursive: true
					});
				} catch (err) {
					// Ignore
				}

			}

			try {
				fs.copyFileSync(origin, target);
				result = true;
			} catch (err) {
				result = false;
			}

		}

	}

	if (result === true) {
		console.info('stealth: copy("' + origin.substr(ROOT.length + 1) + '", "' + target.substr(ROOT.length + 1) + '")');
	} else {
		console.error('stealth: copy("' + origin.substr(ROOT.length + 1) + '", "' + target.substr(ROOT.length + 1) + '")');
	}

	return result;

};

const remove = (path) => {

	let stat   = null;
	let result = false;

	try {
		stat = fs.statSync(path);
	} catch (err) {
		stat = null;
	}

	if (stat !== null) {

		if (stat.isFile() === true) {

			try {
				fs.unlinkSync(path);
				result = true
			} catch (err) {
				result = false;
			}

		}

	}

	return result;

};



export const clean = () => {

	let results = [
		clean_browser(),
		remove(ROOT + '/stealth/extern/base.mjs')
	];

	if (results.includes(false) === false) {
		return true;
	}


	return false;

};

export const build = () => {

	let results = [
		build_browser(),
		copy(ROOT + '/base/build/node.mjs', ROOT + '/stealth/extern/base.mjs')
	];

	if (results.includes(false) === false) {
		return true;
	}


	return false;

};


if (process.argv.includes(FILE) === true) {

	let results = [
		clean(),
		build()
	];

	if (results.includes(false) === false) {

		console.clear();

		console.log('');
		console.info('Stealth');
		console.log('');

		let stealth = new Stealth({
			debug:   ENVIRONMENT.flags.debug,
			host:    ENVIRONMENT.flags.host,
			profile: ENVIRONMENT.flags.profile
		});

		stealth.on('disconnect', (result) => {
			process.exit(result === true ? 0 : 1);
		});

		stealth.connect();

	} else {

		process.exit(1);

	}

}

