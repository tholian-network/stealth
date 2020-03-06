
import process from 'process';

import { console } from './source/console.mjs';
import { Covert  } from './source/Covert.mjs';

import Server          from './review/Server.mjs';
import Request         from './review/Request.mjs';
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


const ARGV  = Array.from(process.argv).slice(2).map((v) => v.trim()).filter((v) => v !== '');
const ARGS  = Array.from(ARGV).filter((v) => v.startsWith('--') === false);
const FLAGS = (() => {

	let flags = {
		debug:    false,
		internet: true,
		network:  null
	};

	Array.from(ARGV).filter((v) => v.startsWith('--') === true).forEach((flag) => {

		let tmp = flag.substr(2).split('=');
		if (tmp.length === 2) {

			let key = tmp[0];
			let val = tmp[1];

			let num = parseInt(val, 10);
			if (!isNaN(num) && (num).toString() === val) {
				val = num;
			}

			if (val === 'true')  val = true;
			if (val === 'false') val = false;
			if (val === 'null')  val = null;

			flags[key] = val;

		}

	});

	return flags;

})();



const inspect = (result) => {

	if (result.state === 'wait' || result.state === 'fail') {

		console.log('');

		if (result.state === 'wait') {
			console.warn('review/' + result.id + '.mjs:');
		} else if (result.state === 'fail') {
			console.error('review/' + result.id + '.mjs:');
		}


		let blank1 = '';
		let blank2 = '';

		result.tests.forEach((test) => {

			let str1 = test.name;
			if (str1.length > blank1.length) {
				blank1 = new Array(str1.length).fill(' ').join('');
			}

			let str2 = test.results.render();
			if (str2.length > blank2.length) {
				blank2 = new Array(str2.length).fill(' ').join('');
			}

		});

		result.tests.forEach((test) => {

			let results  = test.results.render();
			let timeline = test.timeline.render();
			let indent1  = blank1.substr(0, blank1.length - test.name.length);
			let indent2  = blank2.substr(0, blank2.length - results.length);

			if (test.results.includes(null)) {
				console.warn('> ' + test.name + ' ' + indent1 + results + indent2 + ' => ' + timeline);
			} else if (test.results.includes(false)) {
				console.error('> ' + test.name + ' ' + indent1 + results + indent2 + ' => ' + timeline);
			}

		});

	}

};



const settings = {
	debug:   FLAGS.debug   || false,
	network: FLAGS.network || null
};

(function(global) {

	let covert = global.covert = new Covert(settings);
	if (covert !== null) {

		let reviews = [

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

			// Request
			Request,

			// Peer-to-Peer
			Peer,
			Peer_Cache

		];

		let filter = ARGS[0] || null;
		if (filter !== null) {

			if (filter.startsWith('*')) {

				reviews = reviews.filter((review) => {
					return review.id.endsWith(filter.substr(1));
				});

			} else if (filter.endsWith('*')) {

				reviews = reviews.filter((review) => {
					return review.id.startsWith(filter.substr(0, filter.length - 1));
				});

			} else if (filter.includes('*')) {

				let prefix = filter.split('*').shift();
				let suffix = filter.split('*').pop();

				reviews = reviews.filter((review) => {
					return review.id.startsWith(prefix) && review.id.endsWith(suffix);
				});

			} else if (filter.includes('#')) {

				let prefix = filter.split('#').shift();
				let suffix = filter.split('#').pop();

				reviews = reviews.filter((review) => {
					return review.id === prefix;
				});

				reviews.forEach((review) => {

					review.tests = review.tests.filter((test) => {
						return test.name.includes(suffix);
					});

				});

			} else {

				reviews = reviews.filter((review) => {
					return review.id === filter;
				});

			}

		}


		if (FLAGS.internet === false) {

			reviews = reviews.filter((review) => {
				return review.flags.internet !== true;
			});

		}


		if (reviews.length > 0) {

			reviews.forEach((review) => {
				covert.scan(review);
			});


			const on_error = () => {
				covert.disconnect();
			};

			process.on('SIGHUP',  on_error);
			process.on('SIGINT',  on_error);
			process.on('SIGQUIT', on_error);
			process.on('SIGABRT', on_error);
			process.on('SIGTERM', on_error);
			process.on('error',   on_error);
			process.on('exit',    () => {});


			covert.connect((results) => {

				let waits = results.filter((result) => result.state === 'wait');
				let fails = results.filter((result) => result.state === 'fail');

				if (waits.length > 0) {

					console.log('');
					console.warn('');
					console.warn('Covert: Some reviews didn\'t complete.');
					console.warn('');

					waits.forEach((result) => inspect(result));
					fails.forEach((result) => inspect(result));

					process.exit(2);

				} else if (fails.length > 0) {

					console.log('');
					console.error('');
					console.error('Covert: Some reviews didn\'t succeed.');
					console.error('');

					fails.forEach((result) => inspect(result));

					process.exit(1);

				} else {

					console.log('');
					console.info('');
					console.info('Covert: All reviews did succeed.');
					console.info('');

					process.exit(0);

				}

			});

		} else {

			console.warn('Covert: No matching reviews found.');
			process.exit(2);

		}

	}

})(global);

