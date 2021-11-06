
import fs      from 'fs';
import os      from 'os';
import path    from 'path';
import process from 'process';
import url     from 'url';

import { _, copy, rebase, remove, replace } from '../base/make.mjs';
import { console                          } from '../base/source/node/console.mjs';
import { Buffer                           } from '../base/source/node/Buffer.mjs';
import { isString                         } from '../base/source/String.mjs';
import { build as build_base              } from '../base/make.mjs';
import { build as build_browser           } from '../browser/make.mjs';


const CACHE  = {};
const FILE   = url.fileURLToPath(import.meta.url);
const ROOT   = path.dirname(path.resolve(FILE, '../'));
const TARGET = ROOT;

// TODO: Find out a mechanism to import VERSION
// without requirement of other dependencies
const VERSION = 'X0:2021-10-04';

const mktemp = (sandbox) => {

	let folder   = '/tmp/' + sandbox;
	let platform = os.platform();
	let suffix   = '';

	if (platform === 'linux' || platform === 'freebsd' || platform === 'openbsd') {
		folder = path.resolve('/tmp/' + sandbox);
	} else if (platform === 'android') {
		folder = path.resolve(process.env.TMPDIR + '/' + sandbox);
	} else if (platform === 'darwin') {
		folder = path.resolve(process.env.TMPDIR + '/' + sandbox);
	} else if (platform === 'win32') {
		folder = path.resolve(process.env.USERPROFILE + '\\AppData\\Local\\Temp\\' + sandbox);
	}

	if (folder.endsWith('/') === true) {
		folder = folder.substr(0, folder.length - 1);
	}

	for (let a = 0; a < 8; a++) {

		let val = '' + ((Math.random() * 0xff) | 0).toString(16);
		if (val.length < 2) {
			val = '0' + val;
		}

		suffix += val;

	}

	return folder + '-' + suffix;

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
				copy(ROOT + '/base/build/node.mjs',     target + '/stealth/extern/base.mjs'),
				copy(ROOT + '/stealth/index.mjs',       target + '/stealth/index.mjs'),
				copy(ROOT + '/stealth/stealth.mjs',     target + '/stealth/stealth.mjs'),
				copy(ROOT + '/stealth/source',          target + '/stealth/source'),
				copy(ROOT + '/stealth/vendor',          target + '/stealth/vendor'),
				rebase(target + '/stealth/stealth.mjs', target + '/stealth/extern/base.mjs')
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

	let sandbox = mktemp('stealth-package');
	let results = [
		clean(sandbox + '/src'),
		build(sandbox + '/src'),
		copy(ROOT + '/stealth/package/archlinux/PKGBUILD',                sandbox + '/PKGBUILD'),
		copy(ROOT + '/stealth/package/archlinux/tholian-stealth.desktop', sandbox + '/src/tholian-stealth.desktop'),
		copy(ROOT + '/stealth/package/archlinux/tholian-stealth.mjs',     sandbox + '/src/tholian-stealth.mjs'),
		copy(ROOT + '/stealth/package/archlinux/tholian-stealth.svg',     sandbox + '/src/tholian-stealth.svg'),
		replace(sandbox + '/PKGBUILD', {
			VERSION: VERSION.split(':').pop().split('-').join('.')
		})
	];



	// if (target === TARGET) {

	// 	// Do Nothing

	// } else {

	// }


	// TODO: copy recursively /stealth/build to /tmp/stealth
	// TODO: makepkg --noextract



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

