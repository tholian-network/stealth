
import fs      from 'fs';
import url     from 'url';
import path    from 'path';
import process from 'process';

import { console                                        } from '../base/source/node/console.mjs';
import { build as build_base                            } from '../base/make.mjs';
import { build as build_stealth, clean as clean_stealth } from '../stealth/make.mjs';



let   CACHE = null;
const FILE  = url.fileURLToPath(import.meta.url);
const ROOT  = path.dirname(path.resolve(FILE, '../'));

const copy = (origin, target) => {

	let stat   = null;
	let result = false;

	try {
		stat = fs.statSync(origin);
	} catch (err) {
		stat = null;
	}

	if (stat !== null) {

		if (stat.isDirectory() === true) {

			let files = [];

			try {
				files = fs.readdirSync(origin);
			} catch (err) {
				files = [];
			}

			if (files.length > 0) {

				let results = files.map((file) => {
					return copy(origin + '/' + file, target + '/' + file);
				});

				if (results.includes(false) === false) {
					result = true;
				} else {
					result = false;
				}

			} else {
				result = true;
			}

		} else if (stat.isFile() === true) {

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
		console.info('covert: copy("' + origin.substr(ROOT.length + 1) + '", "' + target.substr(ROOT.length + 1) + '")');
	} else {
		console.error('covert: copy("' + origin.substr(ROOT.length + 1) + '", "' + target.substr(ROOT.length + 1) + '")');
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

		if (stat.isDirectory() === true) {

			try {
				fs.rmdirSync(path, {
					recursive: true
				});
				result = true;
			} catch (err) {
				result = false;
			}

		} else if (stat.isFile() === true) {

			try {
				fs.unlinkSync(path);
				result = true;
			} catch (err) {
				result = false;
			}

		}

	}

	return result;

};



export const clean = () => {

	if (CACHE === false) {

		return true;

	} else {

		console.log('covert: clean()');

		CACHE = false;

		let results = [
			clean_stealth(),
			remove(ROOT + '/covert/extern/base.mjs')
		];

		if (results.includes(false) === false) {
			return true;
		}

	}


	return false;

};

export const build = () => {

	if (CACHE === true) {

		return true;

	} else {

		console.log('covert: build()');

		let results = [
			build_base(),
			build_stealth(),
			copy(ROOT + '/base/build/node.mjs', ROOT + '/covert/extern/base.mjs'),
		];

		if (results.includes(false) === false) {
			CACHE = true;
			return true;
		}

	}


	return false;

};



let args = process.argv.slice(1);
if (args.includes(FILE) === true) {

	let results = [];

	if (args.includes('clean')) {
		results.push(clean());
	}

	if (args.includes('build')) {
		results.push(build());
	}

	if (results.length === 0) {
		results.push(clean());
		results.push(build());
	}


	if (results.includes(false) === false) {
		process.exit(0);
	} else {
		process.exit(1);
	}

}

