
import { isArray, isObject } from '../../extern/base.mjs';
import { Element           } from '../../internal/index.mjs';



const ELEMENTS = {

	beacons: {
		input: {
			// TODO: Query Beacon input elements
		},
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

const listen_modes = (browser, callback) => {

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

	let output = ELEMENTS.modes.output || null;
	if (output !== null) {

		output.on('click', (e) => {

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
TODO: Render Beacon correctly...
      ${beacon} ${actions} ${visible}
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

	reset_beacons();
	reset_modes();

};

export const reset_beacons = () => {

	// TODO: Reset Beacon input elements

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

const sort_beacon = (a, b) => {

	// TODO: Sort Beacon datasets correctly
	return sort_mode(a, b);

};

export const update = (settings, actions) => {

	settings = isObject(settings) ? settings : {};
	actions  = isArray(actions)   ? actions  : [ 'remove', 'save' ];


	let visible = 0;
	let total   = 0;
	let value   = search();

	let beacons = settings.beacons || null;
	if (beacons !== null) {

		total += beacons.length;

		if (value === null) {

			ELEMENTS.beacons.output.value(beacons.sort(sort_beacon).map((beacon) => {
				visible++;
				return render_beacon(beacon, actions, true);
			}));

		} else if (value !== '') {

			ELEMENTS.beacons.output.value(beacons.sort(sort_beacon).map((beacon) => {

				if (beacon.domain.includes(value)) {
					visible++;
					return render_beacon(beacon, actions, true);
				} else {
					return render_beacon(beacon, actions, false);
				}

			}));

		} else {

			ELEMENTS.beacons.output.value(beacons.sort(sort_beacon).map((beacon) => {

				if (beacon.domain.includes('.') === false) {
					visible++;
					return render_beacon(beacon, actions, true);
				} else {
					return render_beacon(beacon, actions, false);
				}

			}));

		}

	}

	let modes = settings.modes || null;
	if (modes !== null) {

		total += modes.length;

		if (value === null) {

			ELEMENTS.modes.output.value(modes.sort(sort_mode).map((mode) => {
				visible++;
				return render_mode(mode, actions, true);
			}));

		} else if (value !== '') {

			ELEMENTS.modes.output.value(modes.sort(sort_mode).map((mode) => {

				if (mode.domain.includes(value)) {
					visible++;
					return render_mode(mode, actions, true);
				} else {
					return render_mode(mode, actions, false);
				}

			}));

		} else {

			ELEMENTS.modes.output.value(modes.sort(sort_mode).map((mode) => {

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

	settings = isObject(settings) ? settings : browser.settings;
	actions  = isArray(actions)   ? actions  : [ 'remove', 'save' ];

	// TODO: listen_beacons()

	listen_modes(browser, (action, data, done) => {

		let service = browser.client.services.mode || null;
		if (service !== null) {

			if (action === 'remove') {

				service.remove(data, (result) => {

					if (result === true) {

						let cache = settings.modes.find((m) => m.domain === data.domain) || null;
						if (cache !== null) {

							let index = settings.modes.indexOf(cache);
							if (index !== -1) {
								settings.modes.splice(index, 1);
							}

							update({
								modes: settings.modes
							}, actions);

						}

					}

					done(result);

				});

			} else if (action === 'save') {

				service.save(data, (result) => {

					if (result === true) {

						let cache = settings.modes.find((m) => m.domain === data.domain) || null;
						if (cache !== null) {
							cache.mode.text  = data.mode.text  === true;
							cache.mode.image = data.mode.image === true;
							cache.mode.audio = data.mode.audio === true;
							cache.mode.video = data.mode.video === true;
							cache.mode.other = data.mode.other === true;
						} else {
							settings.modes.push(data);
						}

						update({
							modes: settings.modes
						}, actions);

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

	let search = ELEMENTS.search || null;
	if (search !== null) {

		search.on('change', () => {
			update(settings, actions);
		});

	}

	reset();

	update(settings, actions);

};

