
import fs      from 'fs';
import http    from 'http';
import https   from 'https';
import url     from 'url';
import path    from 'path';
import process from 'process';

import { console             } from '../base/source/node/console.mjs';
import { isString            } from '../base/source/String.mjs';
import { build as build_base } from '../base/make.mjs';



const CACHE   = {};
const DOMAINS = {};
const FILE    = url.fileURLToPath(import.meta.url);
const ROOT    = path.dirname(path.resolve(FILE, '../'));
const TARGET  = ROOT + '/browser';

const copy = (origin, target) => {

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

	if (origin.startsWith(ROOT) === true) {
		origin = origin.substr(ROOT.length + 1);
	}

	if (target.startsWith(ROOT) === true) {
		target = target.substr(ROOT.length + 1);
	}

	if (result === true) {
		console.info('browser: copy("' + origin + '", "' + target + '")');
	} else {
		console.error('browser: copy("' + origin + '", "' + target + '")');
	}

	return result;

};

const download = (url, cache, callback) => {

	let lib     = url.startsWith('https://') ? https : http;
	let request = lib.request(url, (response) => {

		let cached = false;
		let length = parseInt(response.headers['content-length'], 10);
		if (Number.isNaN(length) === false) {

			let stat = null;
			try {
				stat = fs.lstatSync(path.resolve(cache));
			} catch (err) {
				stat = null;
			}

			if (stat !== null) {

				if (stat['size'] === length) {
					cached = true;
				}
			}

		}

		if (cached === false && response['statusCode'] === 200) {

			let file = fs.createWriteStream(path.resolve(cache));

			response.on('data', (chunk) => {
				file.write(chunk);
			});

			response.on('end', () => {
				file.end();
				callback(true);
			});

			file.on('error', () => {
				fs.unlink(path.resolve(cache), () => callback(false));
			});

			response.resume();

		} else {

			response.destroy();
			callback(false);

		}

	});

	request.on('error', () => {
		callback(false);
	});

	request.write('');
	request.end();

};

const read = (url) => {

	let buffer = null;

	try {
		buffer = fs.readFileSync(path.resolve(url));
	} catch(err) {
		buffer = null;
	}

	return buffer;

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

	}

	return result;

};

const IGNORED = [
	path.resolve(ROOT + '/browser/bin'),
	path.resolve(ROOT + '/browser.mjs'),
	path.resolve(ROOT + '/browser/README.md'),
	path.resolve(ROOT + '/browser/make.mjs')
];

const walk = (url, result) => {

	if (IGNORED.includes(path.resolve(url))) {
		return result;
	}


	if (result === undefined) {
		result = [];
	}

	let stat = null;

	try {
		stat = fs.lstatSync(path.resolve(url));
	} catch (err) {
		stat = null;
	}

	if (stat !== null) {

		if (stat.isDirectory() === true) {

			let nodes = [];

			try {
				nodes = fs.readdirSync(path.resolve(url));
			} catch (err) {
				nodes = [];
			}

			if (nodes.length > 0) {

				nodes.forEach((node) => {
					walk(url + '/' + node, result);
				});

			}

		} else if (stat.isFile() === true) {

			let name = url.split('/').pop();
			if (name.startsWith('.') === false) {
				result.push(url);
			}

		}

	}

	return result;

};

const write = (url, buffer) => {

	let result = false;

	try {
		fs.writeFileSync(path.resolve(url), buffer);
		result = true;
	} catch (err) {
		result = false;
	}

	if (result === true) {
		console.info('browser: write("' + path.resolve(url).substr(ROOT.length + 1) + '")');
	} else {
		console.error('browser: write("' + path.resolve(url).substr(ROOT.length + 1) + '")');
	}

	return result;

};



export const clean = (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] === true) {

		CACHE[target] = false;


		let results = [];

		if (target === TARGET) {

			console.log('browser: clean()');

			[
				remove(target + '/extern/base.mjs'),
				remove(target + '/source/Browser.mjs'),
				remove(target + '/source/Tab.mjs'),
				remove(target + '/source/client'),
				remove(target + '/source/parser')
			].forEach((result) => results.push(result));

		} else {

			console.log('browser: clean("' + target + '")');

			[
				remove(target)
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {
			return true;
		}


		return false;

	}


	return true;

};

export const build = (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] !== true) {

		let results = [
			build_base()
		];

		if (target === TARGET) {

			console.log('browser: build()');

			[
				copy(ROOT + '/base/build/browser.mjs',     target + '/extern/base.mjs'),
				copy(ROOT + '/stealth/source/Browser.mjs', target + '/source/Browser.mjs'),
				copy(ROOT + '/stealth/source/client',      target + '/source/client'),
				copy(ROOT + '/stealth/source/parser',      target + '/source/parser'),
				copy(ROOT + '/stealth/source/Tab.mjs',     target + '/source/Tab.mjs')
			].forEach((result) => results.push(result));

		} else {

			console.log('browser: build("' + target + '")');

			[
				copy(ROOT + '/browser/app',                    target + '/app'),
				copy(ROOT + '/browser/design',                 target + '/design'),
				copy(ROOT + '/base/build/browser.mjs',         target + '/extern/base.mjs'),
				copy(ROOT + '/browser/index.html',             target + '/index.html'),
				copy(ROOT + '/browser/index.webmanifest',      target + '/index.webmanifest'),
				copy(ROOT + '/browser/internal',               target + '/internal'),
				copy(ROOT + '/browser/service.js',             target + '/service.js'),
				copy(ROOT + '/stealth/source/Browser.mjs',     target + '/source/Browser.mjs'),
				copy(ROOT + '/browser/source/Client.mjs',      target + '/source/Client.mjs'),
				copy(ROOT + '/stealth/source/client',          target + '/source/client'),
				copy(ROOT + '/browser/source/ENVIRONMENT.mjs', target + '/source/ENVIRONMENT.mjs'),
				copy(ROOT + '/stealth/source/parser',          target + '/source/parser'),
				copy(ROOT + '/stealth/source/Tab.mjs',         target + '/source/Tab.mjs')
			].forEach((result) => results.push(result));

		}


		let buffer = read(target + '/service.js');
		if (buffer !== null) {

			let service = buffer.toString('utf8');
			let files   = walk(target).map((url) => {
				return url.substr(target.length + 1);
			}).sort((a, b) => {
				if (a < b) return -1;
				if (b < a) return  1;
				return 0;
			});

			if (files.length > 0) {

				let index0 = service.indexOf('const ASSETS  = [') + 17;
				let index1 = service.indexOf('];', index0);

				if (index0 > 17 && index1 > 18) {
					service = service.substr(0, index0) + '\n\t\'' + files.join('\',\n\t\'') + '\'\n' + service.substr(index1);
				}

				results.push(write(target + '/service.js', Buffer.from(service, 'utf8')));

			}

		}


		if (results.includes(false) === false) {

			CACHE[target] = true;

			return true;

		}

	}


	return false;

};

export const update = async (target) => {

	target = isString(target) ? target : ROOT + '/profile';


	if (target === ROOT + '/profile') {
		console.log('browser: update()');
	} else {
		console.log('browser: update("' + target + '")');
	}



	// This dynamic import() allows calling the browser/make.mjs file
	// without having a cyclic dependency for stealth/extern/base.mjs
	let build_stealth = await import('../stealth/make.mjs').then((module) => module['build']);
	if (build_stealth !== null) {
		build_stealth();
	}

	const HOSTS = await import('../stealth/source/parser/HOSTS.mjs').then((module) => module['HOSTS']);
	const URL   = await import('../stealth/source/parser/URL.mjs').then((module) => module['URL']);



	let queue   = [
		download.bind(null, 'https://adaway.org/hosts.txt',                          target + '/.update/adaway_hosts.txt'),
		download.bind(null, 'https://badmojr.github.io/1Hosts/complete/hosts.txt',   target + '/.update/badmojr_hosts.txt'),
		download.bind(null, 'https://hostsfile.org/Downloads/hosts.txt',             target + '/.update/hostsfile_hosts.txt'),
		download.bind(null, 'https://hostsfile.mine.nu/hosts0.txt',                  target + '/.update/hostsfile_hosts0.txt'),
		download.bind(null, 'https://www.malwaredomainlist.com/hostslist/hosts.txt', target + '/.update/malwaredomainlist_hosts.txt'),
		download.bind(null, 'https://someonewhocares.org/hosts/hosts',               target + '/.update/someonewhocares_hosts.txt'),
		download.bind(null, 'https://sysctl.org/cameleon/hosts',                     target + '/.update/sysctl_hosts.txt'),
		download.bind(null, 'https://v.firebog.net/hosts/BillStearns.txt',           target + '/.update/firebog_billstearns.txt'),
		download.bind(null, 'https://v.firebog.net/hosts/Easylist.txt',              target + '/.update/firebog_easylist.txt'),
		download.bind(null, 'https://v.firebog.net/hosts/Easyprivacy.txt',           target + '/.update/firebog_easyprivacy.txt'),
		download.bind(null, 'https://v.firebog.net/hosts/Kowabit.txt',               target + '/.update/firebog_kowabit.txt'),
		download.bind(null, 'https://v.firebog.net/hosts/Prigent-Ads.txt',           target + '/.update/firebog_prigent.txt'),
		download.bind(null, 'https://winhelp2002.mvps.org/hosts.txt',                target + '/.update/winhelp_hosts.txt')
	];
	let results = new Array(queue.length).fill(null);


	queue.forEach((entry, q) => {

		entry((result) => {
			results[q] = result;
		});

	});

	let interval = setInterval(() => {

		if (results.includes(null) === false) {

			if (interval !== null) {
				clearInterval(interval);
				interval = null;
			}

			walk(target + '/.update').map((path) => ({
				name:   path.split('/').pop(),
				buffer: read(path)
			})).forEach((file) => {

				let hosts = HOSTS.parse(file.buffer);
				if (hosts !== null) {

					hosts.forEach((host) => {

						let ref = URL.parse(host.domain);
						if (ref !== null) {

							let domain = DOMAINS[ref.domain] || null;
							if (domain === null) {
								domain = DOMAINS[ref.domain] = [];
							}

							let subdomain = ref.subdomain || null;
							if (subdomain !== null) {

								if (domain.includes(subdomain) === false) {
									domain.push(subdomain);
								}

							}

						}

					});

					console.log('> ' + file.name + ': ' + hosts.length + ' Hosts found.');

				}

			});


			setTimeout(() => {

				let blockers = [];
				let count    = 0;

				for (let domain in DOMAINS) {

					let subdomains = DOMAINS[domain];
					if (subdomains.length > 0) {

						subdomains.forEach((subdomain) => {

							blockers.push({
								domain: subdomain + '.' + domain
							});

						});

					}

					count += subdomains.length;

				}

				console.info(count + ' Hosts resulted in ' + blockers.length + ' Blockers.');

				write(target + '/blockers.json', Buffer.from(JSON.stringify(blockers.sort((a, b) => {

					if (a.domain > b.domain) return  1;
					if (b.domain > a.domain) return -1;

					return 0;

				}), null, '\t'), 'utf8'));

			}, 2000);

		}

	}, 100);

};



let args = process.argv.slice(1);
if (args.includes(FILE) === true) {

	if (args.includes('update')) {

		update();

	} else {

		let results = [];

		if (args.includes('clean')) {
			CACHE[TARGET] = true;
			results.push(clean());
		}

		if (args.includes('build')) {
			results.push(build());
		}

		if (results.length === 0) {
			CACHE[TARGET] = true;
			results.push(clean());
			results.push(build());
		}


		if (results.includes(false) === false) {
			process.exit(0);
		} else {
			process.exit(1);
		}

	}

}

