#!/usr/bin/env node

import child_process from 'child_process';
import fs            from 'fs';
import os            from 'os';
import path          from 'path';
import process       from 'process';
import url           from 'url';

import { console } from '../base/index.mjs';



const FILE = url.fileURLToPath(import.meta.url);
const ROOT = path.dirname(path.resolve(FILE, '../'));

const TEMP = (() => {

	let user     = process.env.SUDO_USER || process.env.USER || process.env.USERNAME;
	let folder   = '/tmp/browser-' + user;
	let platform = os.platform();

	if (platform === 'linux' || platform === 'freebsd' || platform === 'openbsd') {
		folder = path.resolve('/tmp/browser-' + user);
	} else if (platform === 'darwin') {
		folder = path.resolve(process.env.TMPDIR || '/tmp/browser-' + user);
	} else if (platform === 'win32') {
		folder = path.resolve(process.env.USERPROFILE + '\\AppData\\Local\\Temp\\browser-' + user);
	}

	return folder;

})();

const exists = (path) => {

	let stat = null;
	try {
		stat = fs.lstatSync(path);
	} catch (err) {
		stat = null;
	}

	if (stat !== null) {

		if (stat.isDirectory() === true || stat.isFile() === true) {
			return path;
		}

	}

	return null;

};

const mkdir = (path) => {

	let stat = null;
	try {
		stat = fs.lstatSync(path);
	} catch (err) {
		stat = null;
	}

	if (stat === null || stat.isDirectory() === false) {

		let result = true;
		try {
			fs.mkdirSync(path, {
				recursive: true
			});
		} catch (err) {
			result = false;
		}

		return result;

	}

	return true;

};

const spawn = (program, args, options) => {

	args    = args    || [];
	options = options || {};


	options.detached = true;


	console.log('Spawning "' + program + ' ' + args.join(' ') + '" ...');

	let result = null;

	try {
		let handle = child_process.spawn(program, args, options);
		result = handle.stdout.toString('utf8').trim();
	} catch (err) {
		console.error(err);
		result = null;
	}

	if (result !== null) {
		console.info('Success.');
		return true;
	}

	console.error('Failure.');

	return false;

};

const which = (program) => {

	let result = null;

	try {
		result = child_process.execSync('which ' + program + ' 2> /dev/null').toString('utf8').trim();
	} catch (err) {
		result = null;
	}

	if (
		typeof result === 'string'
		&& result.trim().length === 0
	) {
		result = null;
	}

	return result;

};



console.clear();

console.info('');
console.info('Browser');
console.info('');

let platform = os.platform();
if (platform === 'linux' || platform === 'freebsd' || platform === 'openbsd') {

	let chromium = which('ungoogled-chromium') || which('chromium');
	let electron = which('electron');
	let xdg_open = which('xdg-open');
	let results  = [];


	if (electron !== null) {

		[
			mkdir(TEMP),
			spawn(electron, [
				ROOT + '/browser/app/index.js',
				'--user-data-dir=' + TEMP,
				'--app=http://localhost:65432/browser/index.html'
			], {
				cwd: TEMP
			})
		].forEach((result) => results.push(result));

	} else if (chromium !== null) {

		[
			mkdir(TEMP),
			spawn(chromium, [
				'--user-data-dir=' + TEMP,
				'--app=http://localhost:65432/browser/index.html',
				'--new-window'
			], {
				cwd: TEMP
			})
		].forEach((result) => results.push(result));

	} else if (xdg_open !== null) {

		[
			spawn(xdg_open, [
				'http://localhost:65432/browser/index.html'
			])
		].forEach((result) => results.push(result));

	}


	if (results.length === 0 || results.includes(false) === true) {

		console.error('Could not find any Web Browser.');
		console.error('Please open "http://localhost:65432/browser/index.html" manually.');

		process.exit(1);

	} else {

		process.exit(0);

	}

} else if (platform === 'darwin') {

	let open     = which('open');
	let chromium = exists('/Applications/Ungoogled Chromium.app') || exists('/Applications/Chromium.app');
	let safari   = exists('/Application/Safari.app');
	let results  = [];

	if (chromium !== null) {

		[
			mkdir(TEMP),
			spawn(open, [
				'-W',
				'-a ' + chromium,
				'--args',
				'--user-data-dir=' + TEMP + '',
				'--app=http://localhost:65432/browser/index.html'
			], {
				cwd: TEMP
			})
		].forEach((result) => results.push(result));

	} else if (safari !== null) {

		[
			spawn(open, [
				'-W',
				'-a ' + safari,
				'--args',
				'--app=http://localhost:65432/browser/index.html'
			], {
				cwd: TEMP
			})
		].forEach((result) => results.push(result));

	}


	if (results.length === 0 || results.includes(false) === true) {

		console.error('Could not find any Web Browser.');
		console.error('Please open "http://localhost:65432/browser/index.html" manually.');

		process.exit(1);

	} else {

		process.exit(0);

	}

} else if (platform === 'win32') {

	let chromium = exists(process.env.USERPROFILE + '\\AppData\\Local\\Chromium\\Application\\chrome.exe');
	let msedge   = exists('C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe') || exists('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe');
	let results  = [];

	if (chromium !== null) {

		[
			mkdir(TEMP),
			spawn(chromium, [
				'--user-data-dir=' + TEMP,
				'--app=http://localhost:65432/browser/index.html',
				'--new-window'
			], {
				cwd: TEMP
			})
		].forEach((result) => results.push(result));

	} else if (msedge !== null) {

		[
			mkdir(TEMP),
			spawn(msedge, [
				'--user-data-dir=' + TEMP,
				'--app=http://localhost:65432/browser/index.html',
				'--new-window'
			], {
				cwd: TEMP
			})
		].forEach((result) => results.push(result));

	}


	if (results.length === 0 || results.includes(false) === true) {

		console.error('Could not find any Web Browser.');
		console.error('Please open "http://localhost:65432/browser/index.html" manually.');

		process.exit(1);

	} else {

		process.exit(0);

	}

}

