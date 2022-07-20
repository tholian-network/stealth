
import { Element                     } from '../Element.mjs';
import { Widget                      } from '../Widget.mjs';
import { Beacon                      } from '../card/Beacon.mjs';
import { Blocker                     } from '../card/Blocker.mjs';
// import { Echo                        } from '../card/Echo.mjs';
import { Host                        } from '../card/Host.mjs';
import { Mode                        } from '../card/Mode.mjs';
import { Peer                        } from '../card/Peer.mjs';
import { Policy                      } from '../card/Policy.mjs';
import { Redirect                    } from '../card/Redirect.mjs';
import { Session                     } from '../card/Session.mjs';
// import { Task                        } from '../card/Task.mjs';
import { isArray, isObject, isString } from '../../extern/base.mjs';



const update = function(browser) {

	let value = this.value();

	if (isObject(value) === true && isString(value.domain) === true) {

		this.results = {};


		let domain = value.domain;
		let prefix = null;
		let midfix = null;
		let suffix = null;


		if (domain.includes('*') === true) {

			if (domain.startsWith('*') === true) {
				suffix = domain.split('*').pop();
			}

			if (domain.endsWith('*') === true) {
				prefix = domain.split('*').shift();
			}

		} else {

			midfix = domain;

		}


		this.allowed.sort().forEach((type) => {

			browser.settings[type].forEach((entry) => {

				if (
					(prefix === null || entry.domain.startsWith(prefix) === true)
					&& (midfix === null || entry.domain.includes(midfix) === true)
					&& (suffix === null || entry.domain.endsWith(suffix) === true)
				) {

					if (isObject(this.results[entry.domain]) === false) {

						this.results[entry.domain] = {
							beacons:   [],
							blockers:  [],
							echos:     [],
							hosts:     [],
							modes:     [],
							peers:     [],
							policies:  [],
							redirects: [],
							sessions:  [],
							tasks:     []
						};

					}

					this.results[entry.domain][type].push(entry);

				}

			});

		});

	}


	let element = this.element.query('[data-key="results"]');
	if (element !== null) {

		element.value(this.allowed.sort().map((type) => {

			let visible = Object.values(this.results).map((domain) => domain[type].length).reduce((a, b) => a + b, 0);
			let overall = browser.settings[type].length;

			return visible + ' of ' + overall + ' ' + type.charAt(0).toUpperCase() + type.substr(1);

		}).join(', '));

	}


	let article = this.element.query('browser-card-settings-article');
	if (article !== null) {

		article.query('*', true).forEach((element) => {
			element.erase();
		});


		Object.keys(this.results).sort().forEach((domain) => {

			let cards = [];
			let entry = this.results[domain];

			if (this.actions.includes('remove') === true) {

				let headline = new Element('h4', [
					domain,
					'<button title="Remove ' + domain + '" data-action="remove"></button>'
				]);

				let button = headline.query('[data-action="remove"]');
				if (button !== null) {

					button.on('click', () => {

						cards.forEach((card) => {

							let remove = card.query('[data-action="remove"]');
							if (remove !== null) {
								remove.emit('click');
							}

							setTimeout(() => {
								card.erase();
							}, 0);

						});

						setTimeout(() => {
							headline.erase();
						}, 0);

					});

				}

				headline.render(article);

			} else {

				new Element('h4', [ domain ]).render(article);

			}

			if (entry.beacons.length > 0) {

				entry.beacons.map((beacon) => {

					try {

						if (this.actions.includes('remove') === true) {
							return Beacon.from(beacon, [ 'remove', 'save' ]);
						} else {
							return Beacon.from(beacon, [ 'save' ]);
						}

					} catch (err) {
						this.emit('error', [ err ]);
					}

					return null;

				}).forEach((card) => cards.push(card));

			}

			if (entry.blockers.length > 0) {

				entry.blockers.map((blocker) => {

					try {
						return Blocker.from(blocker, []);
					} catch (err) {
						this.emit('error', [ err ]);
					}

					return null;

				}).forEach((card) => cards.push(card));

			}

			if (entry.echos.length > 0) {

				// entry.echos.map((echo) => {

				// 	try {

				// 		if (this.actions.includes('remove') === true) {
				// 			return Echo.from(echo, [ 'remove', 'save' ]);
				// 		} else {
				// 			return Echo.from(echo, [ 'save' ]);
				// 		}

				// 	} catch (err) {
				// 		this.emit('error', [ err ]);
				// 	}

				// 	return null;

				// }).forEach((card) => cards.push(card));

			}

			if (entry.hosts.length > 0) {

				entry.hosts.map((host) => {

					try {

						if (this.actions.includes('remove') === true) {
							return Host.from(host, [ 'remove', 'save' ]);
						} else {
							return Host.from(host, [ 'save' ]);
						}

					} catch (err) {
						this.emit('error', [ err ]);
					}

					return null;

				}).forEach((card) => cards.push(card));

			}

			if (entry.modes.length > 0) {

				entry.modes.map((mode) => {

					try {

						if (this.actions.includes('remove') === true) {
							return Mode.from(mode, [ 'remove', 'save' ]);
						} else {
							return Mode.from(mode, [ 'save' ]);
						}

					} catch (err) {
						this.emit('error', [ err ]);
					}

					return null;

				}).forEach((card) => cards.push(card));

			}

			if (entry.peers.length > 0) {

				entry.peers.map((peer) => {

					try {

						if (this.actions.includes('remove') === true) {
							return Peer.from(peer, [ 'remove', 'save' ]);
						} else {
							return Peer.from(peer, [ 'save' ]);
						}

					} catch (err) {
						this.emit('error', [ err ]);
					}

					return null;

				}).forEach((card) => cards.push(card));

			}

			if (entry.policies.length > 0) {

				entry.policies.map((policy) => {

					try {

						if (this.actions.includes('remove') === true) {
							return Policy.from(policy, [ 'remove', 'save' ]);
						} else {
							return Policy.from(policy, [ 'save' ]);
						}

					} catch (err) {
						this.emit('error', [ err ]);
					}

					return null;

				}).forEach((card) => cards.push(card));

			}

			if (entry.redirects.length > 0) {

				entry.redirects.map((redirect) => {

					try {

						if (this.actions.includes('remove') === true) {
							return Redirect.from(redirect, [ 'remove', 'save' ]);
						} else {
							return Redirect.from(redirect, [ 'save' ]);
						}

					} catch (err) {
						this.emit('error', [ err ]);
					}

					return null;

				}).forEach((card) => cards.push(card));

			}

			if (entry.sessions.length > 0) {

				entry.sessions.map((redirect) => {

					try {

						if (this.actions.includes('remove') === true) {
							return Session.from(redirect, [ 'remove' ]);
						} else {
							return Session.from(redirect, []);
						}

					} catch (err) {
						this.emit('error', [ err ]);
					}

					return null;

				}).forEach((card) => cards.push(card));

			}

			if (entry.tasks.length > 0) {

				// entry.tasks.map((task) => {

				// 	try {

				// 		if (this.actions.includes('remove') === true) {
				// 			return Task.from(task, [ 'remove', 'save' ]);
				// 		} else {
				// 			return Task.from(task, [ 'save' ]);
				// 		}

				// 	} catch (err) {
				// 		this.emit('error', [ err ]);
				// 	}

				// 	return null;

				// }).forEach((card) => cards.push(card));

			}

			if (cards.length > 0) {

				cards.forEach((card) => {

					if (card !== null) {
						card.render(article);
					}

				});

			}

		});

	}

};



const Settings = function(browser, allowed, actions) {

	this.allowed = isArray(allowed) ? allowed : [ 'beacons', 'blockers', 'echos', 'hosts', 'modes', 'peers', 'policies', 'redirects', 'sessions', 'tasks' ];
	this.actions = isArray(actions) ? actions : [ 'refresh', 'remove' ];
	this.element = new Element('browser-card-settings', [
		'<h3>Settings</h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<browser-card-settings-header>',
		'<p>Search for Sites-specific Settings via their Domain:</p>',
		'<input title="Domain" type="text" data-key="domain" pattern="([A-Za-z0-9._\\-*]+).([A-Za-z*]+)" placeholder="domain.tld" disabled/>',
		'<p data-key="results">0 of 0 Beacons, 0 of 0 Blockers, 0 of 0 Echos, 0 of 0 Hosts, 0 of 0 Modes, 0 of 0 Peers, 0 of 0 Policies, 0 of 0 Redirects, 0 of 0 Sessions, 0 of 0 Tasks</p>',
		'</browser-card-settings-header>',
		'<browser-card-settings-article>',
		'</browser-card-settings-article>',
		'<browser-card-settings-footer>',
		'<button title="Refresh all results" data-action="refresh"></button>',
		'</browser-card-settings-footer>'
	]);

	this.buttons = {
		refresh: this.element.query('button[data-action="refresh"]'),
		toggle:  this.element.query('button[data-action="toggle"]')
	};

	this.model = {
		domain: this.element.query('[data-key="domain"]')
	};

	this.results = {};

	Widget.call(this);


	this.model.domain.on('keyup', () => {
		this.model.domain.validate();
	});

	this.model.domain.on('change', () => {

		this.model.domain.validate();

		if (this.model.domain.state() === 'enabled') {
			update.call(this, browser);
		}

	});

	this.element.on('show', () => {

		this.element.state('active');

		if (this.buttons.toggle !== null) {
			this.buttons.toggle.state('active');
		}

	});

	this.element.on('hide', () => {

		this.element.state('');

		if (this.buttons.toggle !== null) {
			this.buttons.toggle.state('');
		}

	});

	this.element.on('update', () => {

		this.buttons.refresh.erase();


		this.model.domain.state('enabled');


		let footer = this.element.query('browser-card-settings-footer');

		if (this.actions.includes('refresh') === true) {
			this.buttons.refresh.render(footer);
		}

		update.call(this, browser);

	});


	if (this.buttons.refresh !== null) {

		this.buttons.refresh.on('click', () => {

			this.model.domain.validate();

			if (this.model.domain.state() === 'enabled') {
				update.call(this, browser);
			}

		});

	}

	if (this.buttons.toggle !== null) {

		this.buttons.toggle.on('click', () => {

			if (this.element.state() === 'active') {
				this.element.emit('hide');
			} else {
				this.element.emit('show');
			}

		});

	}

	setTimeout(() => {
		this.element.emit('update');
	}, 0);

};


Settings.from = function(value, allowed, actions) {

	value   = isObject(value)  ? value   : null;
	allowed = isArray(allowed) ? allowed : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Settings(window.parent.BROWSER || null, allowed, actions);
		widget.value(value);

	}

	return widget;

};


Settings.prototype = Object.assign({}, Widget.prototype);


export { Settings };

