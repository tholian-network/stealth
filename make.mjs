
import url from 'url';

import { build as build_base,    clean as clean_base    } from './base/make.mjs';
import { build as build_browser, clean as clean_browser } from './browser/make.mjs';
import { build as build_covert,  clean as clean_covert  } from './covert/make.mjs';
import { build as build_stealth, clean as clean_stealth } from './stealth/make.mjs';


const FILE = url.fileURLToPath(import.meta.url);

const clean = () => {

	let results = [
		clean_base(),
		clean_browser(),
		clean_covert(),
		clean_stealth()
	];

	if (results.includes(false) === false) {
		return true;
	}


	return false;

};

const build = () => {

	let results = [
		build_base(),
		build_browser(),
		build_covert(),
		build_stealth()
	];

	if (results.includes(false) === false) {
		return true;
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

