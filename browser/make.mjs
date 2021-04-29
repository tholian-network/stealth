
import fs      from 'fs';
import path    from 'path';
import process from 'process';
import url     from 'url';

import { _, copy, read, remove, write } from '../base/make.mjs';
import { console                      } from '../base/source/node/console.mjs';
import { isObject                     } from '../base/source/Object.mjs';
import { isString                     } from '../base/source/String.mjs';
import { build as build_base          } from '../base/make.mjs';



const CACHE  = {};
const FILE   = url.fileURLToPath(import.meta.url);
const ROOT   = path.dirname(path.resolve(FILE, '../'));
const TARGET = ROOT;



const IGNORED = [
	path.resolve(ROOT + '/browser/app'),
	path.resolve(ROOT + '/browser/browser.mjs'),
	path.resolve(ROOT + '/browser/README.md'),
	path.resolve(ROOT + '/browser/make.mjs')
];

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

const patch = (text, target) => {

	let meta  = read(ROOT + '/package.json');
	let files = walk(target + '/browser').map((url) => {
		return url.substr((target + '/browser').length + 1);
	}).sort((a, b) => {
		if (a < b) return -1;
		if (b < a) return  1;
		return 0;
	});
	let version = 'X0:SECRET';

	if (meta.buffer !== null) {

		try {

			let object = JSON.parse(meta.buffer.toString('utf8'));

			if (isObject(object) === true && isString(object.version) === true) {
				version = object.version;
			}

		} catch (err) {
			version = 'X0:SECRET';
		}

	}

	let index0 = text.indexOf('const VERSION = \'') + 17;
	let index1 = text.indexOf('\';', index0);

	if (index0 > 17 && index1 > 18) {
		text = text.substr(0, index0) + version + text.substr(index1);
	}

	let index2 = text.indexOf('const ASSETS  = [') + 17;
	let index3 = text.indexOf('];', index2);

	if (index2 > 17 && index3 > 18) {
		text = text.substr(0, index2) + '\n\t\'' + files.join('\',\n\t\'') + '\'\n' + text.substr(index3);
	}

	return text;

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
				copy(ROOT + '/stealth/source/Tab.mjs',     target + '/browser/source/Tab.mjs')
			].forEach((result) => results.push(result));

		} else {

			[
				copy(ROOT + '/browser/app',                    target + '/browser/app'),
				copy(ROOT + '/browser/browser.mjs',            target + '/browser/browser.mjs'),
				copy(ROOT + '/browser/design',                 target + '/browser/design'),
				copy(ROOT + '/base/build/browser.mjs',         target + '/browser/extern/base.mjs'),
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
				copy(ROOT + '/stealth/source/Tab.mjs',         target + '/browser/source/Tab.mjs')
			].forEach((result) => results.push(result));

		}


		let service_worker = read(target + '/browser/service.js');
		if (service_worker.buffer !== null) {

			let old_text = service_worker.buffer.toString('utf8');
			let new_text = patch(old_text, target);
			if (new_text !== old_text) {
				results.push(write(target + '/browser/service.js', Buffer.from(new_text, 'utf8')));
			}

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

