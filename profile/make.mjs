
import fs      from 'fs';
import http    from 'http';
import https   from 'https';
import path    from 'path';
import process from 'process';
import url     from 'url';

import { console  } from '../base/source/node/console.mjs';
import { Buffer   } from '../base/source/node/Buffer.mjs';
import { isString } from '../base/source/String.mjs';
import { HOSTS    } from '../stealth/source/parser/HOSTS.mjs';
import { URL      } from '../stealth/source/parser/URL.mjs';



const DOMAINS = {};
const FILE    = url.fileURLToPath(import.meta.url);
const ROOT    = path.dirname(path.resolve(FILE, '../'));
const TARGET  = ROOT;

const download_adblock = async (url, cache) => {

	return new Promise((resolve) => {

		console.log('> Download "' + url + '"');

		let lib     = url.startsWith('https://') ? https : http;
		let request = lib.request(url, (response) => {

			if (response['statusCode'] === 200) {

				let chunks = [];

				response.on('data', (chunk) => {
					chunks.push(chunk);
				});

				response.on('end', () => {

					let hosts = Buffer.concat(chunks).toString('utf8').split('\n').map((line) => {

						if (line.startsWith('||') && (line.endsWith('^') || line.endsWith('^$third-party'))) {

							let domain = line.substr(2).split('^').shift();
							if (domain.includes('*') === false) {
								return domain;
							}

						}

						return null;

					}).filter((line) => line !== null);

					if (hosts.length > 0) {

						fs.writeFile(cache, hosts.join('\n'), 'utf8', (err) => {

							if (err === null) {
								resolve(true);
							} else {
								resolve(false);
							}

						});

					} else {
						resolve(false);
					}

				});

				response.resume();

			} else {

				response.destroy();
				resolve(false);

			}

		});

		request.on('error', () => {
			resolve(false);
		});

		request.write('');
		request.end();

	});

};

const download_hosts = async (url, cache) => {

	return new Promise((resolve) => {

		console.log('> Download "' + url + '"');

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
					resolve(true);
				});

				file.on('error', () => {
					fs.unlink(path.resolve(cache), () => resolve(false));
				});

				response.resume();

			} else if (cached === true) {

				response.destroy();
				resolve(true);

			} else {

				console.error(url + ' -> ' + response['statusCode']);

				response.destroy();
				resolve(false);

			}

		});

		request.on('error', (err) => {
			console.error(url);
			console.error(err);
			resolve(false);
		});

		request.write('');
		request.end();

	});

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

const walk = (url, result) => {

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

	let relative = path.resolve(url);
	if (relative.startsWith(ROOT) === true) {
		relative = relative.substr(ROOT.length);
	}

	if (result === true) {
		console.info('profile: write("' + relative + '")');
	} else {
		console.error('profile: write("' + relative + '")');
	}

	return result;

};



export const update = async (target) => {

	target = isString(target) ? target : TARGET;


	if (target === TARGET) {
		console.log('profile: update()');
	} else {
		console.log('profile: update("' + target + '")');
	}


	let update_exists = false;

	try {
		update_exists = fs.existsSync(target + '/profile/.update');
	} catch (err) {
		update_exists = false;
	}

	if (update_exists === false) {

		try {
			fs.mkdirSync(target + '/profile/.update', {
				recursive: true
			});
		} catch (err) {
			// Do Nothing
		}

	}


	let results = [

		// XXX: hosts.txt has no contents anymore, contacted webmaster
		// await download_hosts('https://www.malwaredomainlist.com/hostslist/hosts.txt', target + '/profile/.update/malwaredomainlist_hosts.txt'),

		await download_adblock('https://secure.fanboy.co.nz/easyprivacy.txt',         target + '/profile/.update/fanboy_easyprivacy.txt'),
		await download_adblock('https://secure.fanboy.co.nz/enhancedstats.txt',       target + '/profile/.update/fanboy_enhancedstats.txt'),
		await download_adblock('https://secure.fanboy.co.nz/fanboy-annoyance.txt',    target + '/profile/.update/fanboy_annoyance.txt'),
		await download_adblock('https://secure.fanboy.co.nz/fanboy-social.txt',       target + '/profile/.update/fanboy_social.txt'),

		await download_hosts('https://adaway.org/hosts.txt',                          target + '/profile/.update/adaway_hosts.txt'),
		await download_hosts('https://badmojr.github.io/1Hosts/Lite/domains.txt',     target + '/profile/.update/badmojr_lite_hosts.txt'),
		await download_hosts('https://hostsfile.org/Downloads/hosts.txt',             target + '/profile/.update/hostsfile_hosts.txt'),
		await download_hosts('https://hostsfile.mine.nu/hosts0.txt',                  target + '/profile/.update/hostsfile_hosts0.txt'),
		await download_hosts('https://someonewhocares.org/hosts/hosts',               target + '/profile/.update/someonewhocares_hosts.txt'),
		await download_hosts('https://sysctl.org/cameleon/hosts',                     target + '/profile/.update/sysctl_hosts.txt'),
		await download_hosts('https://v.firebog.net/hosts/BillStearns.txt',           target + '/profile/.update/firebog_billstearns.txt'),
		await download_hosts('https://v.firebog.net/hosts/Easylist.txt',              target + '/profile/.update/firebog_easylist.txt'),
		await download_hosts('https://v.firebog.net/hosts/Easyprivacy.txt',           target + '/profile/.update/firebog_easyprivacy.txt'),
		await download_hosts('https://v.firebog.net/hosts/Kowabit.txt',               target + '/profile/.update/firebog_kowabit.txt'),
		await download_hosts('https://v.firebog.net/hosts/Prigent-Ads.txt',           target + '/profile/.update/firebog_prigent.txt'),
		await download_hosts('https://winhelp2002.mvps.org/hosts.txt',                target + '/profile/.update/winhelp_hosts.txt')

	];

	if (results.includes(false) === false) {

		walk(target + '/profile/.update').map((path) => ({
			name:   path.split('/').pop(),
			buffer: read(path)
		})).forEach((file) => {

			let hosts = HOSTS.parse(file.buffer);
			if (hosts.length > 0) {

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

		write(target + '/profile/blockers.json', Buffer.from(JSON.stringify(blockers.sort((a, b) => {

			if (a.domain > b.domain) return  1;
			if (b.domain > a.domain) return -1;

			return 0;

		}), null, '\t'), 'utf8'));

		return true;

	} else {

		console.error('Download Errors occured.');
		console.error('Please verify update cache manually.');

	}


	return false;

};



(async (args) => {

	if (args.includes(FILE) === true) {

		let results = [];

		if (args.includes('update')) {
			results.push(await update());
		}

		if (results.length === 0) {
			results.push(await update());
		}


		if (results.includes(false) === false) {
			process.exit(0);
		} else {
			process.exit(1);
		}

	}

})(process.argv.slice(1));

