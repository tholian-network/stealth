
import process from 'process';

import { console } from './source/console.mjs';
import { Covert  } from './source/Covert.mjs';

import Server   from './review/Server.mjs';
import Client   from './review/Client.mjs';
import Peers    from './review/Peers.mjs';
import Cache    from './review/client/Cache.mjs';
import Filter   from './review/client/Filter.mjs';
import Host     from './review/client/Host.mjs';
import Mode     from './review/client/Mode.mjs';
import Peer     from './review/client/Peer.mjs';
import Redirect from './review/client/Redirect.mjs';
import Stash    from './review/client/Stash.mjs';

const _ARGS = Array.from(process.argv).slice(2).filter((v) => v.trim() !== '');



let covert = global.covert = new Covert();
if (covert !== null) {

	let reviews = [

		// Server/Client
		Server, Client,

		// Client Services
		Cache, Filter, Host, Mode, Peer, Redirect, Stash,

		// Peer-to-Peer Services
		Peers

	];

	let filter = _ARGS[0] || null;
	if (filter !== null) {

		if (filter.startsWith('*')) {

			reviews = reviews.filter((review) => {
				return review.id.endsWith(filter.substr(1));
			});

		} else if (filter.endsWith('*')) {

			reviews = reviews.filter((review) => {
				return review.id.startsWith(filter.substr(0, filter.length - 1));
			});

		} else {

			reviews = reviews.filter((review) => {
				return review.id === filter;
			});

		}

	}


	reviews.forEach((review) => {
		covert.scan(review);
	});


	covert.connect((results, timelines) => {

		let flat_results   = [];
		let flat_timelines = [];


		results.forEach((data) => {
			data.before.forEach((v) => flat_results.push(v));
			data.tests.forEach((v)  => flat_results.push(...v));
			data.after.forEach((v)  => flat_results.push(v));
		});

		timelines.forEach((data) => {
			data.before.forEach((v) => flat_timelines.push(v));
			data.tests.forEach((v)  => flat_timelines.push(...v));
			data.after.forEach((v)  => flat_timelines.push(v));
		});


		console.log('');

		if (flat_results.includes(null)) {

			console.warn('Covert: Some tests incomplete.');
			process.exit(2);

		} else if (flat_results.includes(false)) {

			console.error('Covert: Some tests failed.');
			process.exit(1);

		} else {

			console.info('Covert: All tests okay.');
			process.exit(0);

		}

	});

}

