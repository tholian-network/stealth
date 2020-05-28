
import fs      from 'fs';
import url     from 'url';
import path    from 'path';
import process from 'process';

import { console             } from '../base/source/node/console.mjs';
import { build as build_base } from '../base/make.mjs';



let   CACHE = null;
const FILE  = url.fileURLToPath(import.meta.url);
const ROOT  = path.dirname(path.resolve(FILE, '../'));

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

	if (result === true) {
		console.info('browser: copy("' + origin.substr(ROOT.length + 1) + '", "' + target.substr(ROOT.length + 1) + '")');
	} else {
		console.error('browser: copy("' + origin.substr(ROOT.length + 1) + '", "' + target.substr(ROOT.length + 1) + '")');
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



export const clean = () => {

	if (CACHE === false) {

		return true;

	} else {

		console.log('browser: clean()');

		CACHE = false;

		let results = [
			remove(ROOT + '/browser/extern/base.mjs'),
			remove(ROOT + '/browser/source/Browser.mjs'),
			remove(ROOT + '/browser/source/Tab.mjs'),
			remove(ROOT + '/browser/source/client'),
			remove(ROOT + '/browser/source/parser')
		];

		if (results.includes(false) === false) {
			return true;
		}

	}


	return false;

};

export const build = () => {

	if (CACHE === true) {

		return true;

	} else {

		console.log('browser: build()');

		let results = [
			build_base(),
			copy(ROOT + '/base/build/browser.mjs',     ROOT + '/browser/extern/base.mjs'),
			copy(ROOT + '/stealth/source/Browser.mjs', ROOT + '/browser/source/Browser.mjs'),
			copy(ROOT + '/stealth/source/Tab.mjs',     ROOT + '/browser/source/Tab.mjs'),
			copy(ROOT + '/stealth/source/client',      ROOT + '/browser/source/client'),
			copy(ROOT + '/stealth/source/parser',      ROOT + '/browser/source/parser')
		];


		let service = read(ROOT + '/browser/service.js');
		if (service !== null) {

			let files = walk(ROOT + '/browser').map((path) => {
				return path.substr((ROOT + '/browser').length + 1);
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

				results.push(write(ROOT + '/browser/service.js', service));

			}

		}


		if (results.includes(false) === false) {
			CACHE = true;
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

