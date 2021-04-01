#!/usr/bin/env node

import child_process from 'child_process';
import fs            from 'fs';
import os            from 'os';
import path          from 'path';
import process       from 'process';

import { console } from '../base/index.mjs';



const ROOT = (() => {

	let folder   = '/tmp/stealth';
	let platform = os.platform();

	if (platform === 'linux' || platform === 'freebsd' || platform === 'openbsd' || platform === 'darwin') {

		let pwd = process.env.PWD || null;
		if (pwd !== null) {
			folder = path.resolve(pwd);
		}

		if (folder.endsWith('/')) {
			folder = folder.substr(0, folder.length - 1);
		}

	} else if (platform === 'win32') {

		if (process.env.MSYSTEM === 'MINGW64') {

			let pwd = process.env.PWD || null;
			if (pwd.startsWith('/c/') === true) {
				folder = path.resolve('C:\\' + pwd.substr(3).split('/').join('\\'));
			}

			if (folder.endsWith('/')) {
				folder = folder.substr(0, folder.length - 1);
			}

		} else {

			let cwd = null;
			try {
				cwd = child_process.execSync('echo %cd%').toString('utf8').trim();
			} catch (err) {
				cwd = null;
			}

			if (cwd !== null) {
				folder = cwd;
			}

		}

	}

	return folder;

})();

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
		result = child_process.execSync('which ' + program).toString('utf8').trim();
	} catch (err) {
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

	let chromium = which('chromium');
	let electron = which('electron');
	let gjs      = which('gjs');
	let xdg_open = which('xdg-open');
	let results  = [];


	if (chromium !== null) {

		[
			mkdir(TEMP),
			spawn(chromium, [
				'--user-data-dir=' + TEMP,
				'--app=http://localhost:65432/browser/index.html'
			], {
				cwd: TEMP
			})
		].forEach((result) => results.push(result));

	} else if (electron !== null) {

		[
			mkdir(TEMP),
			spawn(electron, [
				ROOT + '/browser/app/electron.js',
				'--user-data-dir=' + TEMP
			], {
				cwd: TEMP
			})
		].forEach((result) => results.push(result));

	} else if (gjs !== null) {

		[
			mkdir(TEMP),
			spawn(gjs, [
				ROOT + '/browser/app/gjs.js',
				'--user-data-dir=' + TEMP
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
	let edgium   = null; // TODO: How to detect edgium in a failsafe manner?
	let results  = [];

	if (chromium !== null) {

		[
			mkdir(TEMP),
			spawn(chromium, [
				'--user-data-dir=' + TEMP,
				'--app=http://localhost:65432/browser/index.html'
			], {
				cwd: TEMP
			})
		].forEach((result) => results.push(result));

	} else if (edgium !== null) {

		// TODO: spawn edgium correctly

	}


	if (results.length === 0 || results.includes(false) === true) {

		console.error('Could not find any Web Browser.');
		console.error('Please open "http://localhost:65432/browser/index.html" manually.');

		process.exit(1);

	} else {

		process.exit(0);

	}

}

