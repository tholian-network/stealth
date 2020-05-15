
import fs      from 'fs';
import url     from 'url';
import path    from 'path';
import process from 'process';

import { console } from '../../base/index.mjs';



const FILE = url.fileURLToPath(import.meta.url);
const ROOT = path.dirname(path.resolve(FILE, '../'));

const read = (path) => {

	let buffer = null;

	try {
		buffer = fs.readFileSync(path);
	} catch (err) {
		buffer = null;
	}

	return {
		path:   path,
		buffer: buffer
	};

};

const generate = (path, files) => {

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

	try {
		fs.writeFileSync(path, Buffer.concat(buffers));
	} catch (err) {
		errors++;
	}

	if (errors === 0) {

		console.info('base: generate("base/' + path.substr(ROOT.length + 1) + '")');

		return true;

	} else {

		console.error('base: generate("base/' + path.substr(ROOT.length + 1) + '")');

		return false;

	}

};



const BASE_FILES = [
	ROOT + '/source/Array.mjs',
	ROOT + '/source/Boolean.mjs',
	ROOT + '/source/Date.mjs',
	ROOT + '/source/Function.mjs',
	ROOT + '/source/Number.mjs',
	ROOT + '/source/Object.mjs',
	ROOT + '/source/RegExp.mjs',
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



export const build = () => {

	let results = [
		generate(ROOT + '/build/browser.mjs', [].concat(BASE_FILES).concat(BROWSER_FILES)),
		generate(ROOT + '/build/node.mjs',    [].concat(BASE_FILES).concat(NODE_FILES))
	];

	if (results.includes(false) === false) {
		return true;
	}


	return false;

};


if (process.argv.includes(FILE) === true) {

	let result = build();
	if (result === true) {
		process.exit(0);
	} else {
		process.exit(1);
	}

}

