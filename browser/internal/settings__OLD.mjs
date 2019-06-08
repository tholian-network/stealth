
import { extract, init, listen, render, reset } from './internal.mjs';



const elements = {
	peers: {
		body:   document.querySelector('#peers table tbody'),
		foot:   document.querySelector('#peers table tfoot'),
		search: document.querySelector('#peers-search input')
	},

	filter:       document.querySelector('#sites table#sites-filters tfoot'),
	filters:      document.querySelector('#sites table#sites-filters tbody'),
	mode:         document.querySelector('#sites table#sites-modes tfoot'),
	modes:        document.querySelector('#sites table#sites-modes tbody')
};



const sort_by_domain = (a, b) => {

	let a_domains = a.domain.split('.').reverse();
	let b_domains = b.domain.split('.').reverse();

	let max = Math.max(a_domains.length, b_domains.length);

	for (let d = 0; d < max; d++) {

		let a_domain = a_domains[d] || null;
		let b_domain = b_domains[d] || null;

		if (a_domain === null) {

			if (b_domain === null) {
				return 0;
			} else {
				return -1;
			}

		} else if (b_domain === null) {
			return 1;
		}

		if (a_domain > b_domain) return  1;
		if (b_domain > a_domain) return -1;

	}

	return 0;

};

const sort_by_domain_and_filter = (a, b) => {

	let a_domains = a.domain.split('.').reverse();
	let b_domains = b.domain.split('.').reverse();

	let max = Math.max(a_domains.length, b_domains.length);

	for (let d = 0; d < max; d++) {

		let a_domain = a_domains[d] || null;
		let b_domain = b_domains[d] || null;

		if (a_domain === null) {

			if (b_domain === null) {
				return 0;
			} else {
				return -1;
			}

		} else if (b_domain === null) {
			return 1;
		}

		if (a_domain > b_domain) return  1;
		if (b_domain > a_domain) return -1;

	}


	let a_prefix = a.filter.prefix || '';
	let b_prefix = b.filter.prefix || '';
	if (a_prefix > b_prefix) return  1;
	if (b_prefix > a_prefix) return -1;

	let a_midfix = a.filter.midfix || '';
	let b_midfix = b.filter.midfix || '';
	if (a_midfix > b_midfix) return  1;
	if (b_midfix > a_midfix) return -1;

	let a_suffix = a.filter.suffix || '';
	let b_suffix = b.filter.suffix || '';
	if (a_suffix > b_suffix) return  1;
	if (b_suffix > a_suffix) return -1;


	return 0;

};

const update = function(browser) {

	let service = browser.client.services.settings || null;
	if (service !== null) {
		service.read(null, () => on_update(browser.settings));
	}

};

const on_search = function(type, search) {

	if (search === '') {

		Array.from(elements[type].querySelectorAll('tr')).forEach((element) => {

			let data = extract(element);
			if (data !== null) {

				let domain = data.domain || null;
				if (domain !== null) {
					element.setAttribute('data-visible', domain.includes('.') === false);
				}

			}

		});

	} else {

		Array.from(elements[type].querySelectorAll('tr')).forEach((element) => {

			let data = extract(element);
			if (data !== null) {

				let domain = data.domain || null;
				if (domain !== null) {
					element.setAttribute('data-visible', domain.includes(search));
				}

			}

		});

	}

};

const on_update = function(settings) {

	let filters = settings.filters || null;
	if (filters !== null) {
		elements.filters.innerHTML = filters.sort(sort_by_domain_and_filter).map((filter) => render('filter', filter, [ 'remove' ])).join('');
	}

	let modes = settings.modes || null;
	if (modes !== null) {
		elements.modes.innerHTML = modes.sort(sort_by_domain).map((mode) => render('mode', mode, [ 'remove', 'save' ])).join('');
	}

	let peers = settings.peers || null;
	if (peers !== null) {
		elements.peers.body.innerHTML = peers.sort(sort_by_domain).map((peer) => render('peer', peer, [ 'refresh', 'remove', 'save' ])).join('');
		on_search('peers', elements.peers.search.value);
	}

};



init([
	elements.filters,
	elements.modes,
	elements.peers.body,
	elements.peers.foot,
	elements.peers.search
], (browser, result) => {

	if (result === true) {
		update(browser);
	}



	/*
	 * Table Body
	 */

	listen(elements.peers.body, (action, data, done) => {

		let service = browser.client.services.peer || null;
		if (service !== null) {

			if (action === 'refresh') {

				service.refresh(data, (peer) => {

					if (peer !== null) {

						let cache = browser.settings.peers.find((p) => p.domain === peer.domain) || null;
						if (cache !== null) {
							cache.connection = peer.connection;
						}

						on_update({
							peers: browser.settings.peers
						});

					}

					done(peer !== null);

				});

			} else if (action === 'remove') {

				service.remove(data, (result) => {

					if (result === true) {

						let cache = browser.settings.peers.find((p) => p.domain === data.domain) || null;
						if (cache !== null) {

							let index = browser.settings.peers.indexOf(cache);
							if (index !== -1) {
								browser.settings.peers.splice(index, 1);
							}

							on_update({
								peers: browser.settings.peers
							});

						}

					}

					done(result);

				});

			} else if (action === 'save') {

				service.save(data, (result) => {

					if (result === true) {

						let cache = browser.settings.peers.find((p) => p.domain === data.domain) || null;
						if (cache !== null) {
							cache.connection = data.connection;
						}

					}

					done(result);

				});

			} else {
				done(false);
			}

		} else {
			done(false);
		}

	});

	listen(elements.modes, (action, data, done) => {

		let service = browser.client.services.mode || null;
		if (service !== null) {

			if (action === 'remove') {

				service.remove(data, (result) => {

					if (result === true) {

						let cache = browser.settings.modes.find((m) => m.domain === data.domain) || null;
						if (cache !== null) {

							let index = browser.settings.modes.indexOf(cache);
							if (index !== -1) {
								browser.settings.modes.splice(index, 1);
							}

						}

						on_update({
							modes: browser.settings.modes
						});

					}

					done(result);

				});

			} else if (action === 'save') {

				service.save(data, (result) => {

					if (result === true) {

						let cache = browser.settings.modes.find((m) => m.domain === data.domain) || null;
						if (cache !== null) {
							cache.mode.text  = data.mode.text === true;
							cache.mode.image = data.mode.image === true;
							cache.mode.audio = data.mode.audio === true;
							cache.mode.video = data.mode.video === true;
							cache.mode.other = data.mode.other === true;
						}

					}

					done(result);

				});

			} else {
				done(false);
			}

		} else {
			done(false);
		}

	});

	listen(elements.filters, (action, data, done) => {

		let service = browser.client.services.filter || null;
		if (service !== null) {

			if (action === 'remove') {

				service.remove(data, (result) => {

					if (result === true) {

						let cache = browser.settings.filters.find((f) => {
							return (
								f.domain === data.domain
								&& f.filter.prefix === data.filter.prefix
								&& f.filter.midfix === data.filter.midfix
								&& f.filter.suffix === data.filter.suffix
							);
						}) || null;

						if (cache !== null) {

							let index = browser.settings.filters.indexOf(cache);
							if (index !== -1) {
								browser.settings.filters.splice(index, 1);
							}

							on_update({
								filters: browser.settings.filters
							});

						}

					}

					done(result);

				});

			} else {
				done(false);
			}

		} else {
			done(false);
		}

	});



	/*
	 * Table Footer
	 */

	reset(elements.peers.foot);
	listen(elements.peers.foot, (action, data, done) => {

		let button  = elements.peers.foot.querySelector('button[data-action]');
		let service = browser.client.services.peer || null;
		if (service !== null) {

			if (action === 'refresh') {

				button.setAttribute('data-action', 'confirm');
				button.setAttribute('disabled', 'true');

				service.refresh(data, (peer) => {

					if (peer !== null) {

						let cache = browser.settings.peers.find((p) => p.domain === peer.domain) || null;
						if (cache !== null) {
							cache.connection = peer.connection;
						}

						let button_connection = elements.peers.foot.querySelector('button[data-key="connection"]');
						if (button_connection !== null) {
							button_connection.setAttribute('data-val', peer.connection);
						}

						button.setAttribute('data-action', 'confirm');
						button.removeAttribute('disabled');

					} else {

						button.setAttribute('data-action', 'refresh');
						button.removeAttribute('disabled');

					}

					done(peer !== null);

				});

			} else if (action === 'confirm') {

				let cache = browser.settings.peers.find((p) => p.domain === data.domain) || null;
				if (cache !== null) {
					cache.connection = data.connection;
					data = cache;
				}

				service.save(data, (result) => {

					if (result === true) {

						browser.settings.peers.push(data);

						on_update({
							peers: browser.settings.peers
						});

						reset(elements.peers.foot);

					}

					done(result);

				});

			} else {

				button.removeAttribute('disabled');
				button.setAttribute('data-action', 'refresh');

				reset(elements.peers.foot);
				done(false);

			}

		} else {

			button.removeAttribute('disabled');
			button.setAttribute('data-action', 'refresh');

			reset(elements.peers.foot);
			done(false);

		}

	});

	reset(elements.mode);
	listen(elements.mode, (action, data, done) => {

		let service = browser.client.services.mode || null;
		if (service !== null) {

			if (action === 'confirm') {

				let cache = browser.settings.modes.find((m) => m.domain === data.domain) || null;
				if (cache !== null) {
					cache.mode.text  = data.mode.text === true;
					cache.mode.image = data.mode.image === true;
					cache.mode.audio = data.mode.audio === true;
					cache.mode.video = data.mode.video === true;
					cache.mode.other = data.mode.other === true;
					data = cache;
				}

				service.save(data, (result) => {

					if (result === true) {

						browser.settings.modes.push(data);

						on_update({
							modes: browser.settings.modes
						});

						reset(elements.mode);

					}

					done(result);

				});

			} else {
				done(false);
			}

		} else {
			done(false);
		}

	});

	reset(elements.filter);
	listen(elements.filter, (action, data, done) => {

		let service = browser.client.services.filter || null;
		if (service !== null) {

			if (action === 'confirm') {

				let cache = browser.settings.filters.find((f) => {
					return (
						f.domain === data.domain
						&& f.filter.prefix === data.filter.prefix
						&& f.filter.midfix === data.filter.midfix
						&& f.filter.suffix === data.filter.suffix
					);
				}) || null;

				if (cache === null) {

					service.save(data, (result) => {

						if (result === true) {

							browser.settings.filters.push(data);

							on_update({
								filters: browser.settings.filters
							});

							reset(elements.filter);

						}

						done(result);

					});

				} else {
					done(false);
				}

			} else {
				done(false);
			}

		} else {
			done(false);
		}

	});

});

