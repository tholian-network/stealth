
import fs      from 'fs';
import path    from 'path';
import process from 'process';
import url     from 'url';

import { _, copy, read, rebase, remove, write } from '../base/make.mjs';
import { console                              } from '../base/source/node/console.mjs';
import { isObject                             } from '../base/source/Object.mjs';
import { isString                             } from '../base/source/String.mjs';
import { build as build_base                  } from '../base/make.mjs';



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

const IGNORED = [
	path.resolve(ROOT + '/browser/app'),
	path.resolve(ROOT + '/browser/browser.mjs'),
	path.resolve(ROOT + '/browser/README.md'),
	path.resolve(ROOT + '/browser/make.mjs')
];

const patch = (url) => {

	let file = read(url);
	if (file.buffer !== null) {

		let root  = path.dirname(url);
		let text  = file.buffer.toString('utf8');
		let files = walk(root).map((file) => {
			return file.substr(root.length + 1);
		}).sort((a, b) => {
			if (a < b) return -1;
			if (b < a) return  1;
			return 0;
		});

		let index0 = text.indexOf('const VERSION = \'') + 17;
		let index1 = text.indexOf('\';', index0);

		if (index0 !== -1 && index1 !== -1) {
			text = text.substr(0, index0) + VERSION + text.substr(index1);
		}

		let index2 = text.indexOf('const ASSETS  = [') + 17;
		let index3 = text.indexOf('];', index2);

		if (index2 !== -1 && index3 !== -1) {
			text = text.substr(0, index2) + '\n\t\'' + files.join('\',\n\t\'') + '\'\n' + text.substr(index3);
		}

		if (file.buffer.toString('utf8') !== text) {
			return write(url, Buffer.from(text, 'utf8'));
		} else {
			return true;
		}

	}

	return false;

};

const walk = (url, result) => {

	if (IGNORED.includes(path.resolve(url))) {
		return result;
	}


	if (result === undefined) {
		result = [];
	}

	let stat = null;

	try {
		stat = fs.lstatSync(path.resolve(url));
	} catch (err) {
		stat = null;
	}

	if (stat !== null) {

		if (stat.isDirectory() === true) {

			let nodes = [];

			try {
				nodes = fs.readdirSync(path.resolve(url));
			} catch (err) {
				nodes = [];
			}

			if (nodes.length > 0) {

				nodes.forEach((node) => {
					walk(url + '/' + node, result);
				});

			}

		} else if (stat.isFile() === true) {

			let name = url.split('/').pop();
			if (name.startsWith('.') === false) {
				result.push(url);
			}

		}

	}

	return result;

};



export const clean = async (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] !== false) {

		CACHE[target] = false;


		console.info('browser: clean("' + _(target) + '")');

		let results = [];

		if (target === TARGET) {

			[
				remove(target + '/browser/extern/base.mjs'),
				remove(target + '/browser/source/Browser.mjs'),
				remove(target + '/browser/source/client'),
				remove(target + '/browser/source/parser'),
				remove(target + '/browser/source/Tab.mjs')
			].forEach((result) => results.push(result));

		} else {

			[
				remove(target + '/browser/app'),
				remove(target + '/browser/browser.mjs'),
				remove(target + '/browser/design'),
				remove(target + '/browser/extern/base.mjs'),
				remove(target + '/browser/extern/console.mjs'),
				remove(target + '/browser/index.html'),
				remove(target + '/browser/index.mjs'),
				remove(target + '/browser/index.webmanifest'),
				remove(target + '/browser/internal'),
				remove(target + '/browser/service.js'),
				remove(target + '/browser/source/Browser.mjs'),
				remove(target + '/browser/source/Client.mjs'),
				remove(target + '/browser/source/client'),
				remove(target + '/browser/source/ENVIRONMENT.mjs'),
				remove(target + '/browser/source/parser'),
				remove(target + '/browser/source/Session.mjs'),
				remove(target + '/browser/source/Tab.mjs')
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {

			return true;

		} else {

			console.error('browser: clean("' + _(target) + '"): fail');

			return false;

		}

	}


	return true;

};

export const build = async (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] === true) {

		console.warn('browser: build("' + _(target) + '"): skip');

		return true;

	} else if (CACHE[target] !== true) {

		console.info('browser: build("' + _(target) + '")');

		let results = [
			build_base()
		];

		if (target === TARGET) {

			[
				copy(ROOT + '/base/build/browser.mjs',     target + '/browser/extern/base.mjs'),
				copy(ROOT + '/stealth/source/Browser.mjs', target + '/browser/source/Browser.mjs'),
				copy(ROOT + '/stealth/source/client',      target + '/browser/source/client'),
				copy(ROOT + '/stealth/source/parser',      target + '/browser/source/parser'),
				copy(ROOT + '/stealth/source/Tab.mjs',     target + '/browser/source/Tab.mjs'),
				patch(target + '/browser/service.js')
			].forEach((result) => results.push(result));

		} else {

			[
				copy(ROOT + '/browser/app',                    target + '/browser/app'),
				copy(ROOT + '/browser/browser.mjs',            target + '/browser/browser.mjs'),
				copy(ROOT + '/browser/design',                 target + '/browser/design'),
				copy(ROOT + '/base/build/browser.mjs',         target + '/browser/extern/base.mjs'),
				copy(ROOT + '/base/source/node/console.mjs',   target + '/browser/extern/console.mjs'),
				copy(ROOT + '/browser/index.html',             target + '/browser/index.html'),
				copy(ROOT + '/browser/index.mjs',              target + '/browser/index.mjs'),
				copy(ROOT + '/browser/index.webmanifest',      target + '/browser/index.webmanifest'),
				copy(ROOT + '/browser/internal',               target + '/browser/internal'),
				copy(ROOT + '/browser/service.js',             target + '/browser/service.js'),
				copy(ROOT + '/stealth/source/Browser.mjs',     target + '/browser/source/Browser.mjs'),
				copy(ROOT + '/browser/source/Client.mjs',      target + '/browser/source/Client.mjs'),
				copy(ROOT + '/stealth/source/client',          target + '/browser/source/client'),
				copy(ROOT + '/browser/source/ENVIRONMENT.mjs', target + '/browser/source/ENVIRONMENT.mjs'),
				copy(ROOT + '/stealth/source/parser',          target + '/browser/source/parser'),
				copy(ROOT + '/browser/source/Session.mjs',     target + '/browser/source/Session.mjs'),
				copy(ROOT + '/stealth/source/Tab.mjs',         target + '/browser/source/Tab.mjs'),
				rebase(target + '/browser/browser.mjs',        target + '/browser/extern/console.mjs'),
				patch(target + '/browser/service.js')
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {

			CACHE[target] = true;

			return true;

		} else {

			console.error('browser: build("' + _(target) + '"): fail');

			return false;

		}

	}


	return false;

};

export const pack = async (target) => {

	target = isString(target) ? target : TARGET;


	console.info('browser: pack("' + _(target) + '")');

	let results = [
		clean(target),
		build(target)
	];

	// TODO: Copy binaries and bundle them?

	if (results.includes(false) === false) {

		return true;

	} else {

		console.error('browser: pack("' + _(target) + '"): fail');

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

