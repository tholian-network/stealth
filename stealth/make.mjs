
import fs      from 'fs';
import path    from 'path';
import process from 'process';
import url     from 'url';

import { console                } from '../base/source/node/console.mjs';
import { Buffer                 } from '../base/source/node/Buffer.mjs';
import { isString               } from '../base/source/String.mjs';
import { build as build_base    } from '../base/make.mjs';
import { build as build_browser } from '../browser/make.mjs';



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

	if (origin.startsWith(ROOT) === true) {
		origin = origin.substr(ROOT.length + 1);
	}

	if (target.startsWith(ROOT) === true) {
		target = target.substr(ROOT.length + 1);
	}

	if (result === true) {
		console.info('stealth: copy("' + origin + '", "' + target + '")');
	} else {
		console.error('stealth: copy("' + origin + '", "' + target + '")');
	}

	return result;

};

const rebase = (url) => {

	let buffer = null;

	try {
		buffer = fs.readFileSync(path.resolve(url));
	} catch (err) {
		buffer = null;
	}

	if (buffer !== null) {

		let lines = [];

		buffer.toString('utf8').split('\n').forEach((line) => {

			if (line.startsWith('import') === true && line.includes(' from ') === true) {

				let index0 = line.indexOf('\'', line.indexOf(' from '));
				let index1 = line.indexOf('\'', index0 + 1);

				if (index0 !== -1 && index1 !== -1) {

					let source = line.substr(index0 + 1, index1 - index0 - 1);
					if (source === '../base/index.mjs') {
						source = './extern/base.mjs';
					}

					line = line.substr(0, index0 + 1) + source + line.substr(index1);

				}

			}

			lines.push(line);

		});

		let result = false;

		try {
			fs.writeFileSync(path.resolve(url), Buffer.from(lines.join('\n'), 'utf8'));
			result = true;
		} catch (err) {
			result = false;
		}

		if (result === true) {
			console.info('stealth: rebase("' + url + '")');
		} else {
			console.error('stealth: rebase("' + url + '")');
		}

		return result;

	}


	return false;

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

			console.log('stealth: clean()');

			[
				remove(target + '/stealth/extern/base.mjs')
			].forEach((result) => results.push(result));

		} else {

			console.log('stealth: clean("' + target + '")');

			[
				remove(target + '/stealth/extern/base.mjs'),
				remove(target + '/stealth')
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

			console.log('stealth: build()');

			[
				build_browser(),
				copy(ROOT + '/base/build/node.mjs', target + '/stealth/extern/base.mjs')
			].forEach((result) => results.push(result));

		} else {

			console.log('stealth: build("' + target + '")');

			[
				build_browser(target),
				copy(ROOT + '/base/build/node.mjs', target + '/stealth/extern/base.mjs'),
				copy(ROOT + '/stealth/index.mjs',   target + '/stealth/index.mjs'),
				copy(ROOT + '/stealth/stealth.mjs', target + '/stealth/stealth.mjs'),
				copy(ROOT + '/stealth/source',      target + '/stealth/source'),
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {

			CACHE[target] = true;

			return true;

		}

	}


	return false;

};

export const pack = async (target) => {

	target = isString(target) ? target : TARGET;


	let results = [
		clean(target),
		build(target),
		rebase(target + '/stealth/stealth.mjs')
	];

	// TODO: Minify code as single ESM?

	if (results.includes(false) === false) {
		return true;
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

		if (args.includes('pack')) {
			results.push(await pack());
		}

		if (results.length === 0) {
			CACHE[TARGET] = true;
			results.push(await clean());
			results.push(await build());
			results.push(await pack());
		}


		if (results.includes(false) === false) {
			process.exit(0);
		} else {
			process.exit(1);
		}

	}

})(process.argv.slice(1));

