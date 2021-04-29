
import path    from 'path';
import process from 'process';
import url     from 'url';

import { console } from './base/source/node/console.mjs';

import { build as build_base,    clean as clean_base                          } from './base/make.mjs';
import { build as build_browser, clean as clean_browser, pack as pack_browser } from './browser/make.mjs';
import { build as build_covert,  clean as clean_covert                        } from './covert/make.mjs';
import { build as build_stealth, clean as clean_stealth, pack as pack_stealth } from './stealth/make.mjs';


const FILE = url.fileURLToPath(import.meta.url);
const ROOT = path.dirname(path.resolve(FILE, '.'));

const isComparison = (line, chunk) => {

	let offset = line.indexOf(chunk + '(');
	if (offset !== -1) {

		let is_true    = line.indexOf('=== true',  offset) !== -1;
		let is_false   = line.indexOf('=== false', offset) !== -1;
		// let is_return  = line.substr(offset - 7, 6) === 'return';
		let is_ternary = line.indexOf('?', offset) !== -1 && line.indexOf(':', offset) !== -1;

		if (is_true === true || is_false === true) {
			return true;
		} else if (is_ternary === true) {
			return true;
		}

	}

	return false;

};



const clean = async () => {

	console.log('');
	console.log('clean()');
	console.log('');

	let results = [
		await clean_base(),
		await clean_browser(),
		await clean_covert(),
		await clean_stealth()
	];

	if (results.includes(false) === false) {
		return true;
	}


	return false;

};

const build = async () => {

	console.log('');
	console.log('build()');
	console.log('');

	let results = [
		await build_base(),
		await build_browser(),
		await build_covert(),
		await build_stealth()
	];

	if (results.includes(false) === false) {
		return true;
	}


	return false;

};

const REQUIRED_COMPARE = [
	'isArray',
	'isBoolean',
	'isBuffer',
	'isDate',
	'isEmitter',
	'isFunction',
	'isMap',
	'isNumber',
	'isObject',
	'isRegExp',
	'isSet',
	'isString',
	'DATETIME.isDate',
	'DATETIME.isDATETIME',
	'DATETIME.isTime',
	'HOSTS.isHost',
	'HOSTS.isHOSTS',
	'IP.isIP',
	'UA.isUA',
	'URL.isURL',
	'Number.isNaN',
	'isNaN'
];

const OPTIONAL_COMPARE = [
	'.includes',
	'.startsWith',
	'.endsWith',
	'.test'
];

const lint_file = (file) => {

	let lines  = file.buffer.split('\n');
	let result = true;

	lines.forEach((line, l) => {

		REQUIRED_COMPARE.forEach((chunk) => {

			if (line.includes(chunk + '(') === true) {

				if (isComparison(line, chunk) === false) {
					console.error(' > ' + file.name + '#L' + (l + 1) + ':' + line.trim());
					result = false;
				}

			}

		});

		OPTIONAL_COMPARE.forEach((chunk) => {

			if (line.includes(chunk + '(') === true) {

				if (isComparison(line, chunk) === false) {
					console.warn(' > ' + file.name + '#L' + (l + 1) + ':' + line.trim());
					result = false;
				}

			}

		});

	});

	return result;

};

const lint = async () => {

	console.log('');
	console.log('lint()');
	console.log('');

	let ignored = [];

	let Filesystem = await import(ROOT + '/covert/source/Filesystem.mjs').then((mod) => mod['Filesystem']).catch(() => {
		console.error('Please execute "make.mjs build" first.');
		process.exit(1);
	});

	let FILESYSTEM = new Filesystem();

	FILESYSTEM.read(ROOT + '/browser/.gitignore').split('\n').forEach((line) => {

		if (line.startsWith('/') === true) {

			if (line.endsWith('.mjs') === true) {
				ignored.push('/browser' + line);
			} else if (line.endsWith('*') === true) {
				ignored.push('/browser' + line.substr(0, line.length - 1));
			} else {
				ignored.push('/browser' + line);
			}

		}

	});

	let files = [
		...FILESYSTEM.scan(ROOT + '/base/source',    true),
		...FILESYSTEM.scan(ROOT + '/browser/design', true),
		...FILESYSTEM.scan(ROOT + '/browser/source', true),
		...FILESYSTEM.scan(ROOT + '/covert/source',  true),
		...FILESYSTEM.scan(ROOT + '/stealth/source', true)
	].map((file) => {
		return file.substr(ROOT.length);
	}).filter((file) => {
		return file.endsWith('.mjs');
	}).filter((file) => {

		let check = ignored.find((i) => {
			return file.startsWith(i) === true;
		}) !== undefined;

		if (check === true) {
			return false;
		}

		return true;

	}).map((file) => ({
		name:   file,
		buffer: FILESYSTEM.read(ROOT + file)
	}));


	let results = files.map((file) => {
		return lint_file(file);
	});

	if (results.includes(false) === false) {
		return true;
	}


	return false;

};

const pack = async (target) => {

	console.log('');
	console.log('pack()');
	console.log('');

	let results = [
		await pack_browser(target),
		await pack_stealth(target)
	];

	if (results.includes(false) === false) {
		return true;
	}


	return false;

};



(async (args) => {

	if (args.includes(FILE) === true) {

		let results = [];

		if (args.includes('clean')) {
			results.push(await clean());
		}

		if (args.includes('build')) {
			results.push(await build());
		}

		if (args.includes('lint')) {
			results.push(await lint());
		}

		if (args.includes('pack')) {

			let folder = args.find((v) => v.includes('/') && v !== FILE) || null;
			if (folder !== null) {

				let sandbox = null;

				try {
					sandbox = path.resolve(ROOT, folder);
				} catch (err) {
					sandbox = null;
				}

				if (sandbox !== null) {

					results.push(await pack(sandbox));

				} else {

					console.error('Invalid parameter "' + folder + '". Please use a correct path.');
					results.push(false);

				}

			} else {
				results.push(await pack());
			}

		}

		if (results.length === 0) {

			results.push(await clean());
			results.push(await build());
			results.push(await lint());

			// XXX: Don't pack by default
			// results.push(await pack());

		}


		if (results.includes(false) === false) {
			process.exit(0);
		} else {
			process.exit(1);
		}

	}

})(process.argv.slice(1));

