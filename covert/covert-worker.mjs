
import process from 'process';

import { Covert } from './source/Covert.mjs';

import Browser         from './review/Browser.mjs';
import Request         from './review/Request.mjs';
import Review          from './review/Review.mjs';
import Server          from './review/Server.mjs';
import Other_ERROR     from './review/other/ERROR.mjs';
import Other_FILE      from './review/other/FILE.mjs';
import Other_PAC       from './review/other/PAC.mjs';
import Other_REDIRECT  from './review/other/REDIRECT.mjs';
import Other_ROUTER    from './review/other/ROUTER.mjs';
import Parser_CSS      from './review/parser/CSS.mjs';
import Parser_HOSTS    from './review/parser/HOSTS.mjs';
import Parser_IP       from './review/parser/IP.mjs';
import Parser_URL      from './review/parser/URL.mjs';
import Optimizer_CSS   from './review/optimizer/CSS.mjs';
import Protocol_DNS    from './review/protocol/DNS.mjs';
import Protocol_HTTP   from './review/protocol/HTTP.mjs';
import Protocol_HTTPS  from './review/protocol/HTTPS.mjs';
import Protocol_SOCKS  from './review/protocol/SOCKS.mjs';
import Protocol_WS     from './review/protocol/WS.mjs';
import Protocol_WSS    from './review/protocol/WSS.mjs';
import Client          from './review/Client.mjs';
import Client_Cache    from './review/client/Cache.mjs';
import Client_Filter   from './review/client/Filter.mjs';
import Client_Host     from './review/client/Host.mjs';
import Client_Mode     from './review/client/Mode.mjs';
import Client_Peer     from './review/client/Peer.mjs';
import Client_Redirect from './review/client/Redirect.mjs';
import Client_Settings from './review/client/Settings.mjs';
import Client_Stash    from './review/client/Stash.mjs';
import Peer            from './review/Peer.mjs';
import Peer_Cache      from './review/peer/Cache.mjs';



export const ACTION = (() => {

	let value = Array.from(process.argv).slice(2)[0] || '';
	if (/^([watch]{5})$/g.test(value)) {
		return 'watch';
	} else if (/^([scan]{4})$/g.test(value)) {
		return 'scan';
	} else if (/^([time]{4})$/g.test(value)) {
		return 'time';
	}

	return 'help';

})();

export const FLAGS = (() => {

	let flags = {
		debug:    false,
		internet: true,
		network:  null
	};

	Array.from(process.argv).slice(2).filter((v) => v.startsWith('--') === true).forEach((flag) => {

		let tmp = flag.substr(2).split('=').map((v) => v.trim());
		if (tmp.length === 2) {

			let key = tmp[0];
			let val = tmp[1];

			let num = parseInt(val, 10);
			if (!isNaN(num) && (num).toString() === val) {
				val = num;
			} else if (val === 'true') {
				val = true;
			} else if (val === 'false') {
				val = false;
			} else if (val === 'null') {
				val = null;
			}

			flags[key] = val;

		}

	});

	return flags;

})();

export const PATTERNS = Array.from(process.argv).slice(3).filter((v) => v.startsWith('--') === false);

export const REVIEWS = (() => {

	let reviews = [

		Review,

		// Server Modules
		Other_ERROR,
		Other_FILE,
		Other_PAC,
		Other_REDIRECT,
		Other_ROUTER,

		// Parsers
		Parser_CSS,
		Parser_HOSTS,
		Parser_IP,
		Parser_URL,

		// Optimizers
		Optimizer_CSS,

		// Network Protocols
		Protocol_DNS,
		Protocol_HTTP,
		Protocol_HTTPS,
		Protocol_SOCKS,
		Protocol_WS,
		Protocol_WSS,

		// Server/Client
		Server,
		Client,

		// Network Services
		Client_Cache,
		Client_Filter,
		Client_Host,
		Client_Mode,
		Client_Peer,
		Client_Redirect,
		Client_Settings,
		Client_Stash,

		// Browser
		Browser,
		Request,

		// Peer-to-Peer
		Peer,
		Peer_Cache

	];


	let include  = reviews.map(() => false);
	let filtered = false;

	PATTERNS.forEach((pattern) => {

		filtered = true;


		if (pattern.startsWith('*')) {

			reviews.forEach((review, r) => {

				if (review.id.endsWith(pattern.substr(1))) {
					include[r] = true;
				}

			});

		} else if (pattern.endsWith('*')) {

			reviews.forEach((review, r) => {

				if (review.id.startsWith(pattern.substr(0, pattern.length - 1))) {
					include[r] = true;
				}

			});

		} else if (pattern.includes('*')) {

			let prefix = pattern.split('*').shift();
			let suffix = pattern.split('*').pop();

			reviews.forEach((review, r) => {

				if (review.id.startsWith(prefix) && review.id.endsWith(suffix)) {
					include[r] = true;
				}

			});

		} else {

			reviews.forEach((review, r) => {

				if (review.id === pattern) {
					include[r] = true;
				}

			});

		}

	});


	// --internet defaulted with true
	if (FLAGS.internet === false) {

		reviews.forEach((review, r) => {

			if (review.flags.internet === true) {
				include[r] = false;
			}

		});

	}


	if (filtered === true) {

		return include.map((inc, i) => {
			return inc === true ? reviews[i] : null;
		}).filter((v) => v !== null);

	}


	return reviews;

})();

export const create = () => {

	let covert = new Covert({
		action:  ACTION        || null,
		debug:   FLAGS.debug   || false,
		network: FLAGS.network || null
	});

	if (covert !== null) {

		process.on('SIGHUP', () => {
			covert.disconnect();
		});

		process.on('SIGINT', () => {
			covert.disconnect();
		});

		process.on('SIGQUIT', () => {
			covert.disconnect();
		});

		process.on('SIGABRT', () => {
			covert.disconnect();
		});

		process.on('SIGTERM', () => {
			covert.disconnect();
		});

		process.on('error', () => {
			covert.disconnect();
		});

		process.on('exit', () => {
			// Do nothing
		});


		REVIEWS.forEach((review) => {
			covert.scan(review);
		});

		return covert;

	}


	return null;

};

