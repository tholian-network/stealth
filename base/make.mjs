
import fs      from 'fs';
import url     from 'url';
import path    from 'path';
import process from 'process';

import { console } from './source/node/console.mjs';



let   CACHE = null;
const FILE  = url.fileURLToPath(import.meta.url);
const ROOT  = path.dirname(path.resolve(FILE, './'));

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

	if (errors === 0) {

		console.info('base: generate("base/' + target.substr(ROOT.length + 1) + '")');

		return true;

	} else {

		console.error('base: generate("base/' + target.substr(ROOT.length + 1) + '")');

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
	ROOT + '/source/Array.mjs',
	ROOT + '/source/Boolean.mjs',
	ROOT + '/source/Date.mjs',
	ROOT + '/source/Function.mjs',
	ROOT + '/source/Map.mjs',
	ROOT + '/source/Number.mjs',
	ROOT + '/source/Object.mjs',
	ROOT + '/source/RegExp.mjs',
	ROOT + '/source/Set.mjs',
	ROOT + '/source/String.mjs',
	ROOT + '/source/Emitter.mjs'
].map((path) => read(path));

const BROWSER_FILES = [
	ROOT + '/source/browser/Buffer.mjs',
	ROOT + '/source/browser/console.mjs',
	ROOT + '/source/MODULE.mjs'
].map((path) => read(path));

const NODE_FILES = [
	ROOT + '/source/node/Buffer.mjs',
	ROOT + '/source/node/console.mjs',
	ROOT + '/source/MODULE.mjs'
].map((path) => read(path));



export const clean = () => {

	if (CACHE === false) {

		return true;

	} else {

		console.log('base: clean()');

		CACHE = false;

		let results = [
			remove(ROOT + '/build/browser.mjs'),
			remove(ROOT + '/build/node.mjs')
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

		console.log('base: build()');

		let results = [
			generate(ROOT + '/build/browser.mjs', [].concat(BASE_FILES).concat(BROWSER_FILES)),
			generate(ROOT + '/build/node.mjs',    [].concat(BASE_FILES).concat(NODE_FILES))
		];

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
		CACHE = true;
		results.push(clean());
	}

	if (args.includes('build')) {
		results.push(build());
	}

	if (results.length === 0) {
		CACHE = true;
		results.push(clean());
		results.push(build());
	}


	if (results.includes(false) === false) {
		process.exit(0);
	} else {
		process.exit(1);
	}

}

