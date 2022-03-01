
import fs      from 'fs';
import path    from 'path';
import process from 'process';
import url     from 'url';

import { _, copy, exec, mktemp, read, rebase, remove, replace, write } from '../base/make.mjs';
import { console                                                     } from '../base/source/node/console.mjs';
import { Buffer                                                      } from '../base/source/node/Buffer.mjs';
import { isObject                                                    } from '../base/source/Object.mjs';
import { isString                                                    } from '../base/source/String.mjs';
import { build as build_base                                         } from '../base/make.mjs';
import { build as build_browser                                      } from '../browser/make.mjs';



const CACHE  = {};
const FILE   = url.fileURLToPath(import.meta.url);
const ROOT   = path.dirname(path.resolve(FILE, '../'));
const TARGET = ROOT;

const VERSION = (() => {

	let json = null;

	try {
		json = JSON.parse(fs.readFileSync(ROOT + '/package.json', 'utf8'));
	} catch (err) {
		json = null;
	}

	if (
		isObject(json) === true
		&& isString(json['version']) === true
	) {
		return json['version'];
	}

	return 'X0:SECRET';

})();

const patch = (url) => {

	let file = read(url);
	if (file.buffer !== null) {

		let text = file.buffer.toString('utf8');

		let index0 = text.indexOf('export const VERSION = \'') + 24;
		let index1 = text.indexOf('\';', index0);

		if (index0 !== -1 && index1 !== -1) {
			text = text.substr(0, index0) + VERSION + text.substr(index1);
		}

		return write(url, Buffer.from(text, 'utf8'));

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
				remove(target + '/stealth/source'),
				remove(target + '/stealth/vendor')
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
				copy(ROOT + '/base/build/node.mjs', target + '/stealth/extern/base.mjs'),
				patch(target + '/stealth/source/Stealth.mjs')
			].forEach((result) => results.push(result));

		} else {

			[
				build_browser(target),
				copy(ROOT + '/base/build/node.mjs',     target + '/stealth/extern/base.mjs'),
				copy(ROOT + '/stealth/index.mjs',       target + '/stealth/index.mjs'),
				copy(ROOT + '/stealth/stealth.mjs',     target + '/stealth/stealth.mjs'),
				copy(ROOT + '/stealth/source',          target + '/stealth/source'),
				copy(ROOT + '/stealth/vendor',          target + '/stealth/vendor'),
				rebase(target + '/stealth/stealth.mjs', target + '/stealth/extern/base.mjs'),
				patch(target + '/stealth/source/Stealth.mjs')
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

	let results = [];


	let sandbox_archlinux = mktemp('tholian-stealth-archlinux');
	let version_archlinux = VERSION.split(':').pop().split('-').join('.');

	if (sandbox_archlinux !== null) {

		// ArchLinux Package
		[
			build(sandbox_archlinux + '/src'),
			remove(sandbox_archlinux + '/src/browser/app'),
			remove(sandbox_archlinux + '/src/browser/browser.mjs'),
			copy(ROOT + '/stealth/package/archlinux/PKGBUILD',                sandbox_archlinux + '/PKGBUILD'),
			copy(ROOT + '/stealth/package/archlinux/tholian-stealth.mjs',     sandbox_archlinux + '/src/tholian-stealth.mjs'),
			copy(ROOT + '/stealth/package/archlinux/tholian-stealth.service', sandbox_archlinux + '/src/tholian-stealth.service'),
			replace(sandbox_archlinux + '/PKGBUILD', {
				VERSION: version_archlinux
			}),
			exec('makepkg --noextract', {
				cwd: sandbox_archlinux
			}),
			copy(
				sandbox_archlinux + '/tholian-stealth-' + version_archlinux + '-1-any.pkg.tar.zst',
				target + '/stealth/build/tholian-stealth-' + version_archlinux + '-1-any.pkg.tar.zst'
			)
		].forEach((result) => {
			results.push(result);
		});

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
		}


		if (results.includes(false) === false) {
			process.exit(0);
		} else {
			process.exit(1);
		}

	}

})(process.argv.slice(1));

