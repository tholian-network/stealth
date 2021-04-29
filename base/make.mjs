
import fs      from 'fs';
import path    from 'path';
import process from 'process';
import url     from 'url';

import { console  } from './source/node/console.mjs';
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

