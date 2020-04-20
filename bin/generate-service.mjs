
import fs      from 'fs';
import path    from 'path';
import process from 'process';

import { console, Buffer, isString } from '../base/index.mjs';



const BROWSER = process.env.PWD + '/browser';
const SERVICE = process.env.PWD + '/browser/service.js';
const IGNORE  = [
	BROWSER + '/bin',
	BROWSER + '/README.md'
];

const read = (path) => {

	let buffer = null;

	try {
		buffer = fs.readFileSync(path, 'utf8');
	} catch(err) {
		buffer = null;
	}

	return buffer;

};

const walk = (path, result) => {

	if (IGNORE.includes(path) === true) {
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

	return result;

};



let original = read(SERVICE);
let files    = walk(BROWSER).map((path) => {
	return path.substr(BROWSER.length + 1);
}).sort((a, b) => {
	if (a < b) return -1;
	if (b < a) return  1;
	return 0;
});


if (isString(original) === true) {

	let template = original;
	let index0   = template.indexOf('const ASSETS  = [') + 17;
	let index1   = template.indexOf('];', index0);

	if (index0 > 17 && index1 > 18) {
		template = template.substr(0, index0) + '\n\t\'' + files.join('\',\n\t\'') + '\'\n' + template.substr(index1);
	}

	if (template.length !== original.length) {

		let result = write(SERVICE, template);
		if (result === true) {
			console.info('Updated the "/browser/service.js" file.');
		} else {
			console.error('Could not update "/browser/service.js"!');
		}

	} else {
		console.warn('Nothing to do.');
	}

}

