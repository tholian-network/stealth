
import fs      from 'fs';
import path    from 'path';
import process from 'process';
import url     from 'url';

import { console                } from '../base/source/node/console.mjs';
import { isString               } from '../base/source/String.mjs';
import { build as build_base    } from '../base/make.mjs';
import { build as build_stealth } from '../stealth/make.mjs';



const CACHE  = {};
const FILE   = url.fileURLToPath(import.meta.url);
const ROOT   = path.dirname(path.resolve(FILE, '../'));
const TARGET = ROOT;

const copy = (origin, target) => {

	let stat   = null;
	let result = false;

	try {
		stat = fs.statSync(path.resolve(origin));
	} catch (err) {
		stat = null;
	}

	if (stat !== null) {

		if (stat.isDirectory() === true) {

			let files = [];

			try {
				files = fs.readdirSync(path.resolve(origin));
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
				fs.copyFileSync(path.resolve(origin), path.resolve(target));
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

const remove = (url) => {

	let stat   = null;
	let result = false;

	try {
		stat = fs.statSync(path.resolve(url));
	} catch (err) {
		stat = null;
	}

	if (stat !== null) {

		if (stat.isDirectory() === true) {

			try {
				fs.rmdirSync(path.resolve(url), {
					recursive: true
				});
				result = true;
			} catch (err) {
				result = false;
			}

		} else if (stat.isFile() === true) {

			try {
				fs.unlinkSync(path.resolve(url));
				result = true;
			} catch (err) {
				result = false;
			}

		}

	}

	return result;

};



export const clean = async (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] !== false) {

		CACHE[target] = false;


		let results = [];

		if (target === TARGET) {

			console.log('covert: clean()');

			[
				remove(target + '/covert/extern/base.mjs')
			].forEach((result) => results.push(result));

		} else {

			console.log('covert: clean("' + target + '")');

			[
				remove(target + '/covert/extern/base.mjs')
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {
			return true;
		}


		return false;

	}


	return true;

};

export const build = async (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] === true) {

		return true;

	} else if (CACHE[target] !== true) {

		let results = [
			build_base()
		];

		if (target === TARGET) {

			console.log('covert: build()');

			[
				build_stealth(),
				copy(ROOT + '/base/build/node.mjs', target + '/covert/extern/base.mjs'),
			].forEach((result) => results.push(result));

		} else {

			console.log('covert: build("' + target + '")');

			[
				build_stealth(target),
				copy(ROOT + '/base/build/node.mjs', target + '/covert/extern/base.mjs'),
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {

			CACHE[target] = true;

			return true;

		}

	}


	return false;

};



(async (args) => {

	if (args.includes(FILE) === true) {

		let results = [];

		if (args.includes('clean')) {
			CACHE[TARGET] = true;
			results.push(await clean());
		}

		if (args.includes('build')) {
			results.push(await build());
		}

		if (results.length === 0) {
			CACHE[TARGET] = true;
			results.push(await clean());
			results.push(await build());
		}


		if (results.includes(false) === false) {
			process.exit(0);
		} else {
			process.exit(1);
		}

	}

})(process.argv.slice(1));

