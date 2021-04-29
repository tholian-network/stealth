
import fs      from 'fs';
import path    from 'path';
import process from 'process';
import url     from 'url';

import { console             } from '../base/source/node/console.mjs';
import { isString            } from '../base/source/String.mjs';
import { build as build_base } from '../base/make.mjs';



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
		console.info('browser: copy("' + origin + '", "' + target + '")');
	} else {
		console.error('browser: copy("' + origin + '", "' + target + '")');
	}

	return result;

};

const read = (url) => {

	let buffer = null;

	try {
		buffer = fs.readFileSync(path.resolve(url));
	} catch(err) {
		buffer = null;
	}

	return buffer;

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

const write = (url, buffer) => {

	let result = false;

	try {
		fs.writeFileSync(path.resolve(url), buffer);
		result = true;
	} catch (err) {
		result = false;
	}

	let pretty = path.resolve(url);
	if (pretty.startsWith(ROOT) === true) {
		pretty = pretty.substr(ROOT.length + 1);
	}

	if (result === true) {
		console.info('browser: write("' + pretty + '")');
	} else {
		console.error('browser: write("' + pretty + '")');
	}

	return result;

};



export const clean = async (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] !== false) {

		CACHE[target] = false;


		let results = [];

		if (target === TARGET) {

			console.log('browser: clean()');

			[
				remove(target + '/browser/extern/base.mjs'),
				remove(target + '/browser/source/Browser.mjs'),
				remove(target + '/browser/source/Tab.mjs'),
				remove(target + '/browser/source/client'),
				remove(target + '/browser/source/parser')
			].forEach((result) => results.push(result));

		} else {

			console.log('browser: clean("' + target + '")');

			[
				remove(target + '/browser')
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

			console.log('browser: build()');

			[
				copy(ROOT + '/base/build/browser.mjs',     target + '/browser/extern/base.mjs'),
				copy(ROOT + '/stealth/source/Browser.mjs', target + '/browser/source/Browser.mjs'),
				copy(ROOT + '/stealth/source/client',      target + '/browser/source/client'),
				copy(ROOT + '/stealth/source/parser',      target + '/browser/source/parser'),
				copy(ROOT + '/stealth/source/Tab.mjs',     target + '/browser/source/Tab.mjs')
			].forEach((result) => results.push(result));

		} else {

			console.log('browser: build("' + target + '")');

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


		let buffer = read(target + '/browser/service.js');
		if (buffer !== null) {

			let service = buffer.toString('utf8');
			let files   = walk(target + '/browser').map((url) => {
				return url.substr((target + '/browser').length + 1);
			}).sort((a, b) => {
				if (a < b) return -1;
				if (b < a) return  1;
				return 0;
			});

			if (files.length > 0) {

				let index0 = service.indexOf('const ASSETS  = [') + 17;
				let index1 = service.indexOf('];', index0);

				if (index0 > 17 && index1 > 18) {
					service = service.substr(0, index0) + '\n\t\'' + files.join('\',\n\t\'') + '\'\n' + service.substr(index1);
				}

				results.push(write(target + '/browser/service.js', Buffer.from(service, 'utf8')));

			}

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
		build(target)
	];

	// TODO: Copy binaries and bundle them?

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

