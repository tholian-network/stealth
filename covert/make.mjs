
import path    from 'path';
import process from 'process';
import url     from 'url';

import { _, copy, remove        } from '../base/make.mjs';
import { console                } from '../base/source/node/console.mjs';
import { isString               } from '../base/source/String.mjs';
import { build as build_base    } from '../base/make.mjs';
import { build as build_stealth } from '../stealth/make.mjs';



const CACHE  = {};
const FILE   = url.fileURLToPath(import.meta.url);
const ROOT   = path.dirname(path.resolve(FILE, '../'));
const TARGET = ROOT;



export const clean = async (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] !== false) {

		CACHE[target] = false;


		console.info('covert:  clean("' + _(target) + '")');

		let results = [];

		if (target === TARGET) {

			[
				remove(target + '/covert/extern/base.mjs')
			].forEach((result) => results.push(result));

		} else {

			[
				remove(target + '/covert/extern/base.mjs'),
				remove(target + '/covert/index.mjs'),
				remove(target + '/covert/covert.mjs'),
				remove(target + '/covert/source')
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {

			return true;

		} else {

			console.error('covert:  clean("' + _(target) + '"): fail');

			return false;

		}

	}


	return true;

};

export const build = async (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] === true) {

		console.warn('covert:  build("' + _(target) + '"): skip');

		return true;

	} else if (CACHE[target] !== true) {

		console.info('covert:  build("' + _(target) + '")');

		let results = [
			build_base()
		];

		if (target === TARGET) {

			[
				build_stealth(),
				copy(ROOT + '/base/build/node.mjs', target + '/covert/extern/base.mjs'),
			].forEach((result) => results.push(result));

		} else {

			[
				build_stealth(target),
				copy(ROOT + '/base/build/node.mjs', target + '/covert/extern/base.mjs'),
				copy(ROOT + '/covert/index.mjs',    target + '/covert/index.mjs'),
				copy(ROOT + '/covert/covert.mjs',   target + '/covert/covert.mjs'),
				copy(ROOT + '/covert/source',       target + '/covert/source')
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {

			CACHE[target] = true;

			return true;

		} else {

			console.error('covert:  build("' + _(target) + '"): fail');

			return false;

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

