
import fs      from 'fs';
import url     from 'url';
import path    from 'path';
import process from 'process';

import { console             } from '../base/source/node/console.mjs';
import { isString            } from '../base/source/String.mjs';
import { build as build_base } from '../base/make.mjs';



const CACHE  = {};
const FILE   = url.fileURLToPath(import.meta.url);
const ROOT   = path.dirname(path.resolve(FILE, '../'));
const TARGET = ROOT + '/browser';

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

const read = (path) => {

	let buffer = null;

	try {
		buffer = fs.readFileSync(path, 'utf8');
	} catch(err) {
		buffer = null;
	}

	return buffer;

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

const IGNORED = [
	ROOT + '/browser/bin',
	ROOT + '/browser.mjs',
	ROOT + '/browser/README.md',
	ROOT + '/browser/make.mjs'
];

const walk = (path, result) => {

	if (IGNORED.includes(path)) {
		return result;
	}


	if (result === undefined) {
		result = [];
	}

	let stat = null;

	try {
		stat = fs.lstatSync(path);
	} catch (err) {
		stat = null;
	}

	if (stat !== null) {

		if (stat.isDirectory() === true) {

			let nodes = [];

			try {
				nodes = fs.readdirSync(path);
			} catch (err) {
				nodes = [];
			}

			if (nodes.length > 0) {

				nodes.forEach((node) => {
					walk(path + '/' + node, result);
				});

			}

		} else if (stat.isFile() === true) {

			let name = path.split('/').pop();
			if (name.startsWith('.') === false) {
				result.push(path);
			}

		}

	}

	return result;

};

const write = (path, buffer) => {

	let result = false;

	try {
		fs.writeFileSync(path, buffer, 'utf8');
		result = true;
	} catch (err) {
		result = false;
	}

	if (result === true) {
		console.info('browser: write("' + path.substr(ROOT.length + 1) + '")');
	} else {
		console.error('browser: write("' + path.substr(ROOT.length + 1) + '")');
	}

	return result;

};



export const clean = (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] === true) {

		CACHE[target] = false;


		let results = [];

		if (target === TARGET) {

			console.log('browser: clean()');

			[
				remove(target + '/extern/base.mjs'),
				remove(target + '/source/Browser.mjs'),
				remove(target + '/source/Tab.mjs'),
				remove(target + '/source/client'),
				remove(target + '/source/parser')
			].forEach((result) => results.push(result));

		} else {

			console.log('browser: clean("' + target + '")');

			[
				remove(target)
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {
			return true;
		}


		return false;

	}


	return true;

};

export const build = (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] !== true) {

		let results = [
			build_base()
		];

		if (target === TARGET) {

			console.log('browser: build()');

			[
				copy(ROOT + '/base/build/browser.mjs',     target + '/extern/base.mjs'),
				copy(ROOT + '/stealth/source/Browser.mjs', target + '/source/Browser.mjs'),
				copy(ROOT + '/stealth/source/client',      target + '/source/client'),
				copy(ROOT + '/stealth/source/parser',      target + '/source/parser'),
				copy(ROOT + '/stealth/source/Tab.mjs',     target + '/source/Tab.mjs')
			].forEach((result) => results.push(result));

		} else {

			console.log('browser: build("' + target + '")');

			[
				copy(ROOT + '/browser/app',                    target + '/app'),
				copy(ROOT + '/browser/design',                 target + '/design'),
				copy(ROOT + '/base/build/browser.mjs',         target + '/extern/base.mjs'),
				copy(ROOT + '/browser/index.html',             target + '/index.html'),
				copy(ROOT + '/browser/index.webmanifest',      target + '/index.webmanifest'),
				copy(ROOT + '/browser/internal',               target + '/internal'),
				copy(ROOT + '/browser/service.js',             target + '/service.js'),
				copy(ROOT + '/stealth/source/Browser.mjs',     target + '/source/Browser.mjs'),
				copy(ROOT + '/browser/source/Client.mjs',      target + '/source/Client.mjs'),
				copy(ROOT + '/stealth/source/client',          target + '/source/client'),
				copy(ROOT + '/browser/source/ENVIRONMENT.mjs', target + '/source/ENVIRONMENT.mjs'),
				copy(ROOT + '/stealth/source/parser',          target + '/source/parser'),
				copy(ROOT + '/stealth/source/Tab.mjs',         target + '/source/Tab.mjs')
			].forEach((result) => results.push(result));

		}


		let service = read(target + '/service.js');
		if (service !== null) {

			let files = walk(target).map((path) => {
				return path.substr(target.length + 1);
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

				results.push(write(target + '/service.js', service));

			}

		}


		if (results.includes(false) === false) {

			CACHE[target] = true;

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

