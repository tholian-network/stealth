
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

const generate = (target, files) => {

	let errors  = 0;
	let buffers = [];

	files.forEach((file) => {

		if (file.buffer !== null) {
			buffers.push(file.buffer);
		} else {
			console.warn('> "' + file.path + '" is empty.');
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

	if (target.startsWith(ROOT) === true) {
		target = target.substr(ROOT.length + 1);
	}

	if (errors === 0) {

		console.info('base: generate("' + target + '")');

		return true;

	} else {

		console.error('base: generate("' + target + '")');

		return false;

	}

};

const read = (url) => {

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

const remove = (url) => {

	let stat   = null;
	let result = false;

	try {
		stat = fs.statSync(path.resolve(url));
	} catch (err) {
		stat = null;
	}

	if (stat !== null) {

		if (stat.isFile() === true) {

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


		let results = [];

		if (target === TARGET) {

			console.log('base: clean()');

			[
				remove(target + '/base/build/browser.mjs'),
				remove(target + '/base/build/node.mjs')
			].forEach((result) => results.push(result));

		} else {

			console.log('base: clean("' + target + '")');

			[
				remove(target + '/base/build/browser.mjs'),
				remove(target + '/base/build/node.mjs')
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

		let results = [];

		if (target === TARGET) {

			console.log('base: build()');

			[
				generate(target + '/base/build/browser.mjs', [].concat(BASE_FILES).concat(BROWSER_FILES)),
				generate(target + '/base/build/node.mjs',    [].concat(BASE_FILES).concat(NODE_FILES))
			].forEach((result) => results.push(result));

		} else {

			console.log('base: build("' + target + '")');

			[
				generate(target + '/base/build/browser.mjs', [].concat(BASE_FILES).concat(BROWSER_FILES)),
				generate(target + '/base/build/node.mjs',    [].concat(BASE_FILES).concat(NODE_FILES))
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {

			CACHE[target] = true;

			return true;

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

