
import child_process from 'child_process';
import fs            from 'fs';
import os            from 'os';
import path          from 'path';
import process       from 'process';
import url           from 'url';

import { console  } from './source/node/console.mjs';
import { isObject } from './source/Object.mjs';
import { isString } from './source/String.mjs';



const CACHE  = {};
const FILE   = url.fileURLToPath(import.meta.url);
const ROOT   = path.dirname(path.resolve(FILE, '../'));
const TARGET = ROOT;

export const _ = (url) => {

	if (url === TARGET) {
		url = '$PWD';
	} else if (url.startsWith(ROOT) === true) {
		url = '$PWD/' + url.substr(ROOT.length + 1);
	}

	return url;

};

export const copy = (origin, target) => {

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

	if (result === true) {

		return true;

	} else {

		console.error('> copy("' + _(origin) + '", "' + _(target) + '")');

		return false;

	}

};

export const exec = (command, options) => {

	options = options || {};


	let result = null;

	try {
		result = child_process.execSync(command + ' && echo "EXITCODE: $?"', options).toString('utf8').trim();
	} catch (err) {
		result = null;
	}

	if (typeof result === 'string' && result.endsWith('EXITCODE: 0') === true) {

		return true;

	} else {

		console.error('> exec("' + _(command) + '")');

		return false;

	}

};

const generate = (target, files) => {

	let errors  = 0;
	let buffers = [];

	files.forEach((file) => {

		if (file.buffer !== null) {
			buffers.push(file.buffer);
		} else {
			errors++;
		}

	});


	let stat = null;
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
		fs.writeFileSync(path.resolve(target), Buffer.concat(buffers));
	} catch (err) {
		errors++;
	}

	if (errors === 0) {

		return true;

	} else {

		console.error('> generate("' + _(target) + '")');

		return false;

	}

};

export const mktemp = (sandbox) => {

	sandbox = isString(sandbox) ? sandbox : 'sandbox';


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

export const read = (url) => {

	let buffer = null;

	try {
		buffer = fs.readFileSync(path.resolve(url));
	} catch (err) {
		buffer = null;
	}

	return {
		path:   url,
		buffer: buffer
	};

};

export const rebase = (url, src) => {

	src = isString(src) ? src : './extern/base.mjs';


	if (src.startsWith('/') === true) {
		src = './' + path.relative(path.dirname(url), src);
	}


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

					let check = line.substr(index0 + 1, index1 - index0 - 1);
					if (check === '../base/index.mjs') {
						line = line.substr(0, index0 + 1) + src + line.substr(index1);
					}

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

			console.error('rebase("' + _(url) + '","' + _(src) + '")');

			return false;

		}

	}


	return false;

};

export const replace = (url, map) => {

	map = isObject(map) ? map : {};


	let file = read(url);
	if (file.buffer !== null && Object.keys(map).length > 0) {

		let buffer = Buffer.from(file.buffer.toString('utf8').split('\n').map((line) => {

			Object.keys(map).forEach((key) => {

				if (line.includes(key) === true) {
					line = line.split(key).join(map[key]);
				}

			});

			return line;

		}).join('\n'), 'utf8');

		return write(url, buffer);

	}

	return false;

};

export const remove = (url) => {

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

	} else {
		result = true;
	}

	return result;

};

export const write = (url, buffer) => {

	let result = false;

	try {
		fs.writeFileSync(path.resolve(url), buffer);
		result = true;
	} catch (err) {
		result = false;
	}

	if (result === true) {

		return true;

	} else {

		console.error('write("' + _(url) + '")');

		return false;

	}

};



const BASE_FILES = [
	ROOT + '/base/source/Array.mjs',
	ROOT + '/base/source/Boolean.mjs',
	ROOT + '/base/source/Date.mjs',
	ROOT + '/base/source/Function.mjs',
	ROOT + '/base/source/Map.mjs',
	ROOT + '/base/source/Number.mjs',
	ROOT + '/base/source/Object.mjs',
	ROOT + '/base/source/RegExp.mjs',
	ROOT + '/base/source/Set.mjs',
	ROOT + '/base/source/String.mjs',
	ROOT + '/base/source/Emitter.mjs'
].map((path) => read(path));

const BROWSER_FILES = [
	ROOT + '/base/source/browser/Buffer.mjs',
	ROOT + '/base/source/browser/console.mjs',
	ROOT + '/base/source/MODULE.mjs'
].map((path) => read(path));

const NODE_FILES = [
	ROOT + '/base/source/node/Buffer.mjs',
	ROOT + '/base/source/node/console.mjs',
	ROOT + '/base/source/MODULE.mjs'
].map((path) => read(path));



export const clean = async (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] !== false) {

		CACHE[target] = false;


		console.info('base:    clean("' + _(target) + '")');

		let results = [];

		if (target === TARGET) {

			[
				remove(target + '/base/build/browser.mjs'),
				remove(target + '/base/build/node.mjs')
			].forEach((result) => results.push(result));

		} else {

			[
				remove(target + '/base/build/browser.mjs'),
				remove(target + '/base/build/node.mjs')
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {

			return true;

		} else {

			console.error('base:    clean("' + _(target) + '"): fail');

			return false;

		}

	}


	return true;

};

export const build = async (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] === true) {

		console.warn('base:    build("' + _(target) + '"): skip');

		return true;

	} else if (CACHE[target] !== true) {

		console.info('base:    build("' + _(target) + '")');

		let results = [];

		if (target === TARGET) {

			[
				generate(target + '/base/build/browser.mjs', [].concat(BASE_FILES).concat(BROWSER_FILES)),
				generate(target + '/base/build/node.mjs',    [].concat(BASE_FILES).concat(NODE_FILES))
			].forEach((result) => results.push(result));

		} else {

			[
				generate(target + '/base/build/browser.mjs', [].concat(BASE_FILES).concat(BROWSER_FILES)),
				generate(target + '/base/build/node.mjs',    [].concat(BASE_FILES).concat(NODE_FILES))
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {

			CACHE[target] = true;

			return true;

		} else {

			console.error('base:    build("' + _(target) + '"): fail');

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

