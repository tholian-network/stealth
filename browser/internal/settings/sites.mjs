
import { isArray, isObject } from '../../extern/base.mjs';
import { Element           } from '../../internal/index.mjs';



const ELEMENTS = {

	beacons: {
		output: Element.query('#sites-beacons tbody')
	},

	modes: {
		input: {
			domain: Element.query('#sites-modes tfoot *[data-key="domain"]'),
			mode: {
				text:  Element.query('#sites-modes tfoot *[data-key="mode.text"]'),
				image: Element.query('#sites-modes tfoot *[data-key="mode.image"]'),
				audio: Element.query('#sites-modes tfoot *[data-key="mode.audio"]'),
				video: Element.query('#sites-modes tfoot *[data-key="mode.video"]'),
				other: Element.query('#sites-modes tfoot *[data-key="mode.other"]')
			},
			button: Element.query('#sites-modes tfoot *[data-action]')
		},
		output: Element.query('#sites-modes tbody')
	},

	label:  Element.query('#sites-filter label'),
	search: Element.query('#sites-filter input')

};

const listen_beacons = (settings, callback) => {

	if (ELEMENTS.beacons.output !== null) {

		ELEMENTS.beacons.output.on('click', (e) => {

			let target = e.target;
			let type   = target.tagName.toLowerCase();

			if (type === 'button') {

				let button  = Element.from(target, null, false);
				let action  = button.attr('data-action');
				let dataset = button.parent('tr');

				if (action !== null) {

					button.state('disabled');
					button.state('busy');

					// TODO: save action would require beacons
					callback(action, {
						'domain': dataset.query('*[data-key="domain"]').value() || null,
						'path':   dataset.query('*[data-key="path"]').value()   || null
					}, (result) => {

						button.state('enabled');
						button.state(result === true ? '' : 'error');

					});

				}

			}

		});

	}

};

const listen_modes = (settings, callback) => {

	let button = ELEMENTS.modes.input.button || null;
	if (button !== null) {

		button.on('click', () => {

			button.state('disabled');
			button.state('busy');

			callback('save', {
				'domain': ELEMENTS.modes.input.domain.value() || null,
				'mode':   {
					'text':  ELEMENTS.modes.input.mode.text.value(),
					'image': ELEMENTS.modes.input.mode.image.value(),
					'audio': ELEMENTS.modes.input.mode.audio.value(),
					'video': ELEMENTS.modes.input.mode.video.value(),
					'other': ELEMENTS.modes.input.mode.other.value()
				}
			}, (result) => {

				button.state('enabled');
				button.state(result === true ? '' : 'error');

				reset_modes();

			});

		});

	}

	let mode = Object.values(ELEMENTS.modes.input.mode).filter((b) => b !== null);
	if (mode.length > 0) {

		mode.forEach((button) => {

			button.on('click', () => {
				button.value(button.value() === true ? 'false' : 'true');
			});

		});

	}

	if (ELEMENTS.modes.output !== null) {

		ELEMENTS.modes.output.on('click', (e) => {

			let target = e.target;
			let type   = target.tagName.toLowerCase();

			if (type === 'button') {

				let button  = Element.from(target, null, false);
				let action  = button.attr('data-action');
				let dataset = button.parent('tr');
				let key     = button.attr('data-key');

				if (action !== null) {

					button.state('disabled');
					button.state('busy');

					callback(action, {
						'domain': dataset.query('*[data-key="domain"]').value() || null,
						'mode':   {
							'text':  dataset.query('*[data-key="mode.text"]').value(),
							'image': dataset.query('*[data-key="mode.image"]').value(),
							'audio': dataset.query('*[data-key="mode.audio"]').value(),
							'video': dataset.query('*[data-key="mode.video"]').value(),
							'other': dataset.query('*[data-key="mode.other"]').value()
						}
					}, (result) => {

						button.state('enabled');
						button.state(result === true ? '' : 'error');

					});

				} else if (key.startsWith('mode.')) {

					button.value(button.value() === true ? 'false' : 'true');

				}

			}

		});

	}

};

const render_beacon = (beacon, actions, visible) => `
<tr data-visible="${visible}">
	<td data-key="domain">${beacon.domain}</td>
	<td data-key="path">${beacon.path}</td>
	<td>${beacon.beacons.length} Beacons</td>
	<td>${actions.map((action) => '<button data-action="' + action + '"></button>').join('')}</td>
</tr>
`;

const render_mode = (mode, actions, visible) => `
<tr data-visible="${visible}">
	<td data-key="domain">${mode.domain}</td>
	<td>
		<button data-key="mode.text"  data-val="${mode.mode.text  === true ? 'true' : 'false'}" ${actions.includes('save') === true ? '' : 'disabled'}></button>
		<button data-key="mode.image" data-val="${mode.mode.image === true ? 'true' : 'false'}" ${actions.includes('save') === true ? '' : 'disabled'}></button>
		<button data-key="mode.audio" data-val="${mode.mode.audio === true ? 'true' : 'false'}" ${actions.includes('save') === true ? '' : 'disabled'}></button>
		<button data-key="mode.video" data-val="${mode.mode.video === true ? 'true' : 'false'}" ${actions.includes('save') === true ? '' : 'disabled'}></button>
		<button data-key="mode.other" data-val="${mode.mode.other === true ? 'true' : 'false'}" ${actions.includes('save') === true ? '' : 'disabled'}></button>
	</td>
	<td>${actions.map((action) => '<button data-action="' + action + '"></button>').join('')}</td>
</tr>
`;

export const reset = () => {

	reset_modes();

};

export const reset_modes = () => {

	let domain = ELEMENTS.modes.input.domain || null;
	if (domain !== null) {
		domain.value(null);
	}

	let text = ELEMENTS.modes.input.mode.text || null;
	if (text !== null) {
		text.value(false);
	}

	let image = ELEMENTS.modes.input.mode.image || null;
	if (image !== null) {
		image.value(false);
	}

	let audio = ELEMENTS.modes.input.mode.audio || null;
	if (audio !== null) {
		audio.value(false);
	}

	let video = ELEMENTS.modes.input.mode.video || null;
	if (video !== null) {
		video.value(false);
	}

	let other = ELEMENTS.modes.input.mode.other || null;
	if (other !== null) {
		other.value(false);
	}

};

const search = () => {

	let search = ELEMENTS.search || null;
	if (search !== null) {
		return search.value() || '';
	}

	return null;

};

const sort_beacon = (a, b) => {

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

	if (a.path < b.path) return -1;
	if (b.path < a.path) return  1;

	return 0;

};

const sort_mode = (a, b) => {

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

export const update = (settings, actions) => {

	settings = isObject(settings) ? settings : {};
	actions  = isArray(actions)   ? actions  : [ 'remove', 'save' ];


	let visible = 0;
	let total   = 0;
	let value   = search();

	if (isArray(settings['beacons']) === true && ELEMENTS.beacons.output !== null) {

		total += settings['beacons'].length;

		if (value === null) {

			ELEMENTS.beacons.output.value(settings['beacons'].sort(sort_beacon).map((beacon) => {
				visible++;
				return render_beacon(beacon, [ 'remove' ], true);
			}));

		} else if (value !== '') {

			ELEMENTS.beacons.output.value(settings['beacons'].sort(sort_beacon).map((beacon) => {

				if (beacon.domain.includes(value)) {
					visible++;
					return render_beacon(beacon, [ 'remove' ], true);
				} else {
					return render_beacon(beacon, [ 'remove' ], false);
				}

			}));

		} else {

			ELEMENTS.beacons.output.value(settings['beacons'].sort(sort_beacon).map((beacon) => {

				if (beacon.domain.includes('.') === false) {
					visible++;
					return render_beacon(beacon, [ 'remove' ], true);
				} else {
					return render_beacon(beacon, [ 'remove' ], false);
				}

			}));

		}

	}

	if (isArray(settings['modes']) === true && ELEMENTS.modes.output !== null) {

		total += settings['modes'].length;

		if (value === null) {

			ELEMENTS.modes.output.value(settings['modes'].sort(sort_mode).map((mode) => {
				visible++;
				return render_mode(mode, actions, true);
			}));

		} else if (value !== '') {

			ELEMENTS.modes.output.value(settings['modes'].sort(sort_mode).map((mode) => {

				if (mode.domain.includes(value)) {
					visible++;
					return render_mode(mode, actions, true);
				} else {
					return render_mode(mode, actions, false);
				}

			}));

		} else {

			ELEMENTS.modes.output.value(settings['modes'].sort(sort_mode).map((mode) => {

				if (mode.domain.includes('.') === false) {
					visible++;
					return render_mode(mode, actions, true);
				} else {
					return render_mode(mode, actions, false);
				}

			}));

		}

	}

	let label = ELEMENTS.label || null;
	if (label !== null) {
		label.value(visible + ' out of ' + total + ' Sites.');
	}

};



export const init = (browser, settings, actions) => {

	actions  = isArray(actions)   ? actions  : [ 'remove', 'save' ];
	settings = isObject(settings) ? settings : browser.settings;


	if (isArray(settings['beacons']) === false) {
		settings['beacons'] = [];
	}

	if (isArray(settings['modes']) === false) {
		settings['modes'] = [];
	}


	listen_beacons(settings, (action, data, done) => {

		if (action === 'remove') {

			browser.client.services.beacon.remove(data, (result) => {

				if (result === true) {

					let cache = settings['beacons'].find((b) => b.domain === data.domain && b.path === data.path) || null;
					if (cache !== null) {
						settings['beacons'].remove(cache);
						update(settings, actions);
					}

				}

				done(result);

			});

		} else {
			done(false);
		}

	});

	listen_modes(settings, (action, data, done) => {

		if (action === 'remove') {

			browser.client.services.mode.remove(data, (result) => {

				if (result === true) {

					let cache = settings['modes'].find((m) => m.domain === data.domain) || null;
					if (cache !== null) {
						settings['modes'].remove(cache);
						update(settings, actions);
					}

				}

				done(result);

			});

		} else if (action === 'save') {

			browser.client.services.mode.save(data, (result) => {

				if (result === true) {

					let cache = settings['modes'].find((m) => m.domain === data.domain) || null;
					if (cache !== null) {
						cache.mode.text  = data.mode.text  === true;
						cache.mode.image = data.mode.image === true;
						cache.mode.audio = data.mode.audio === true;
						cache.mode.video = data.mode.video === true;
						cache.mode.other = data.mode.other === true;
					} else {
						settings['modes'].push(data);
					}

					update(settings, actions);

				}

				done(result);

			});

		} else {
			done(false);
		}

	});

	let search = ELEMENTS.search || null;
	if (search !== null) {

		search.on('change', () => {
			update(settings, actions);
		});

	}

	reset();

	update(settings, actions);

};

