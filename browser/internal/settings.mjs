
import { extract, init, listen, render, reset } from './internal.mjs';



const elements = {
	internet: {
		connection: Array.from(document.querySelectorAll('#internet-connection input')),
		history:    Array.from(document.querySelectorAll('#internet-history input')),
		useragent:  Array.from(document.querySelectorAll('#internet-useragent input'))
	},
	filter:       document.querySelector('#sites table#sites-filters tfoot'),
	filters:      document.querySelector('#sites table#sites-filters tbody'),
	host:         document.querySelector('#hosts table tfoot'),
	hosts:        document.querySelector('#hosts table tbody'),
	hosts_search: document.querySelector('#hosts-search input'),
	mode:         document.querySelector('#sites table#sites-modes tfoot'),
	modes:        document.querySelector('#sites table#sites-modes tbody'),
	peer:         document.querySelector('#peers table tfoot'),
	peers:        document.querySelector('#peers table tbody'),
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

const listen_choices = function(browser, elements, setting, callback) {

	Object.keys(elements).forEach((category) => {

		elements[category].forEach((element, e, others) => {

			element.onchange = () => {

				let active = others.find((e) => e.checked === true) || null;
				if (active !== null) {

					let cur_val = browser.settings[setting][category];
					let new_val = active.value;

					if (cur_val !== new_val) {

						let data = {};
						data[setting] = {};
						Object.assign(data[setting], browser.settings[setting]);
						data[setting][category] = new_val;


						element.className = 'busy';

						callback('save', data, function(result) {

							if (result === true) {
								element.className = '';
							} else {
								element.className = 'error';
							}

						});

					}

				}

			};

		});

	});

};

const update = function(browser) {

	let service = browser.client.services.settings || null;
	if (service !== null) {
		service.read(null, () => on_update(browser.settings));
	}

};

const on_update_choices = function(choices, value, elements) {

	choices.forEach((choice, c) => {

		let element = elements[c];
		if (element !== null) {

			if (choice === value) {
				element.setAttribute('checked', 'true');
			} else {
				element.removeAttribute('checked');
			}

		}

	});

};

const on_update_hosts = function(search) {

	if (search === '') {

		Array.from(elements.hosts.querySelectorAll('tr')).forEach((element) => {

			let host = extract(element);
			if (host !== null) {

				let domain = host.domain || null;
				if (domain !== null) {
					element.setAttribute('data-visible', domain.includes('.') === false);
				}

			}

		});

	} else {

		Array.from(elements.hosts.querySelectorAll('tr')).forEach((element) => {

			let host = extract(element);
			if (host !== null) {

				let domain = host.domain || null;
				if (domain !== null) {
					element.setAttribute('data-visible', domain.endsWith(search));
				}

			}

		});

	}

};

const on_update = function(settings) {

	let internet = settings.internet || null;
	if (internet !== null) {

		on_update_choices(
			[ 'mobile', 'broadband', 'peer', 'i2p', 'tor' ],
			settings.internet.connection,
			elements.internet.connection
		);

		on_update_choices(
			[ 'stealth', 'day', 'week', 'forever' ],
			settings.internet.history,
			elements.internet.history
		);

		on_update_choices(
			[ 'stealth', 'browser-mobile', 'browser-desktop', 'spider-mobile', 'spider-desktop' ],
			settings.internet.useragent,
			elements.internet.useragent
		);

	}

	let filters = settings.filters || null;
	if (filters !== null) {
		elements.filters.innerHTML = filters.sort(sort_by_domain_and_filter).map((filter) => render('filter', filter, [ 'remove' ])).join('');
	}

	let hosts = settings.hosts || null;
	if (hosts !== null) {
		elements.hosts.innerHTML = hosts.sort(sort_by_domain).map((host) => render('host', host, [ 'refresh', 'remove', 'save' ])).join('');
	}

	let modes = settings.modes || null;
	if (modes !== null) {
		elements.modes.innerHTML = modes.sort(sort_by_domain).map((mode) => render('mode', mode, [ 'remove', 'save' ])).join('');
	}

	let peers = settings.peers || null;
	if (peers !== null) {
		elements.peers.innerHTML = peers.sort(sort_by_domain).map((peer) => render('peer', peer, [ 'refresh', 'remove', 'save' ])).join('');
	}


	let search = elements.hosts_search || null;
	if (search !== null) {
		on_update_hosts(search.value);
	}

};



init([
	elements.filters,
	elements.hosts,
	elements.modes,
	elements.peers
], (browser, result) => {

	if (result === true) {
		update(browser);
	}


	listen_choices(browser, elements.internet, 'internet', (action, data, done) => {

		let service = browser.client.services.settings || null;
		if (service !== null) {

			if (action === 'save') {

				service.save(data, (result) => {

					if (result === true) {

						Object.keys(data.internet).forEach((key) => {
							browser.settings.internet[key] = data.internet[key];
						});

						on_update({
							internet: browser.settings.internet
						});

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
	 * Table Body
	 */

	if (elements.hosts_search !== null) {
		elements.hosts_search.onkeyup = () => on_update_hosts(elements.hosts_search.value);
	}

	listen(elements.hosts, (action, data, done) => {

		let service = browser.client.services.host || null;
		if (service !== null) {

			if (action === 'refresh') {

				service.refresh(data, (host) => {

					if (host !== null) {

						let cache = browser.settings.hosts.find((h) => h.domain === host.domain) || null;
						if (cache !== null) {
							cache.hosts = host.hosts;
						}

						on_update({
							hosts: browser.settings.hosts
						});

					}

					done(host !== null);

				});

			} else if (action === 'remove') {

				service.remove(data, (result) => {

					if (result === true) {

						let cache = browser.settings.hosts.find((h) => h.domain === data.domain) || null;
						if (cache !== null) {

							let index = browser.settings.hosts.indexOf(cache);
							if (index !== -1) {
								browser.settings.hosts.splice(index, 1);
							}

							on_update({
								hosts: browser.settings.hosts
							});

						}

					}

					done(result);

				});

			} else if (action === 'save') {

				service.save(data, (result) => {

					if (result === true) {

						let cache = browser.settings.hosts.find((h) => h.domain === data.domain) || null;
						if (cache !== null) {
							cache.hosts = data.hosts;
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

	listen(elements.peers, (action, data, done) => {

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

	reset(elements.host);
	listen(elements.host, (action, data, done) => {

		let service = browser.client.services.host || null;
		if (service !== null) {

			if (action === 'confirm') {

				let cache = browser.settings.hosts.find((h) => h.domain === data.domain) || null;
				if (cache !== null) {
					cache.hosts = data.hosts;
					data = cache;
				}

				service.save(data, (result) => {

					if (result === true) {

						browser.settings.hosts.push(data);

						on_update({
							hosts: browser.settings.hosts
						});

						reset(elements.host);

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

	reset(elements.peer);
	listen(elements.peer, (action, data, done) => {

		let button  = elements.peer.querySelector('button[data-action]');
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

						let button_connection = elements.peer.querySelector('button[data-key="connection"]');
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

						reset(elements.peer);

					}

					done(result);

				});

			} else {

				button.removeAttribute('disabled');
				button.setAttribute('data-action', 'refresh');

				reset(elements.peer);
				done(false);

			}

		} else {

			button.removeAttribute('disabled');
			button.setAttribute('data-action', 'refresh');

			reset(elements.peer);
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

