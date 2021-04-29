
import fs      from 'fs';
import path    from 'path';
import process from 'process';
import url     from 'url';

import { _, copy, remove        } from '../base/make.mjs';
import { console                } from '../base/source/node/console.mjs';
import { Buffer                 } from '../base/source/node/Buffer.mjs';
import { isString               } from '../base/source/String.mjs';
import { build as build_base    } from '../base/make.mjs';
import { build as build_browser } from '../browser/make.mjs';


const CACHE  = {};
const FILE   = url.fileURLToPath(import.meta.url);
const ROOT   = path.dirname(path.resolve(FILE, '../'));
const TARGET = ROOT;

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

			return true;

		} else {

			console.error('stealth: rebase("' + _(url) + '")');

			return false;

		}

	}


	return false;

};



export const clean = async (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] !== false) {

		CACHE[target] = false;


		console.info('stealth: clean("' + _(target) + '")');

		let results = [];

		if (target === TARGET) {

			[
				remove(target + '/stealth/extern/base.mjs')
			].forEach((result) => results.push(result));

		} else {

			[
				remove(target + '/stealth/extern/base.mjs'),
				remove(target + '/stealth/index.mjs'),
				remove(target + '/stealth/stealth.mjs'),
				remove(target + '/stealth/source')
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {

			return true;

		} else {

			console.error('stealth: clean("' + _(target) + '"): fail');

			return false;

		}

	}


	return true;

};

export const build = async (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] === true) {

		console.warn('stealth: build("' + _(target) + '"): skip');

		return true;

	} else if (CACHE[target] !== true) {

		console.info('stealth: build("' + _(target) + '")');

		let results = [
			build_base()
		];

		if (target === TARGET) {

			[
				build_browser(),
				copy(ROOT + '/base/build/node.mjs', target + '/stealth/extern/base.mjs')
			].forEach((result) => results.push(result));

		} else {

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

		} else {

			console.error('stealth: build("' + _(target) + '"): fail');

			return false;

		}

	}


	return false;

};

export const pack = async (target) => {

	target = isString(target) ? target : TARGET;


	console.info('stealth: pack("' + _(target) + '")');

	let results = [
		clean(target),
		build(target)
	];

	if (target === TARGET) {

		// Do Nothing

	} else {

		[
			rebase(target + '/stealth/stealth.mjs')
		].forEach((result) => results.push(result));

	}


	if (results.includes(false) === false) {

		return true;

	} else {

		console.error('stealth: pack("' + _(target) + '"): fail');

		return false;

	}

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

