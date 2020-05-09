
export const console = (function(global) {

	const _console = global.console;
	const clear    = _console.clear;
	const debug    = _console.debug;
	const error    = _console.error;
	const info     = _console.info;
	const log      = _console.log;
	const warn     = _console.warn;

	const BLINK = {
		colors:   [
			'#000000',
			'#00005f',
			'#000087',
			'#0000af',
			'#0000d7',
			'#0000ff',
			'#005fff',
			'#0087ff',
			'#00afff',
			'#00d7ff',
			'#00d7ff',
			'#00afff',
			'#0087ff',
			'#005fff',
			'#0000ff',
			'#0000d7',
			'#0000af',
			'#000087',
			'#00005f',
			'#000000'
		],
		index:    0,
		interval: null
	};

	const DIFF = {
		normal: 'font-family:monospace;color:#ffffff;background:#222222',
		insert: 'font-family:monospace;color:#ffffff;background:#4e9a06',
		remove: 'font-family:monospace;color:#ffffff;background:#cc0000'
	};

	const INDENT     = '    ';
	const WHITESPACE = new Array(512).fill(' ').join('');

	const isPrimitive = function(data) {

		if (
			data === null
			|| data === undefined
			|| typeof data === 'boolean'
			|| typeof data === 'number'
		) {
			return true;
		}


		return false;

	};

	const align = function(array, other) {

		let result = new Array(other.length).fill(null);
		let temp   = other.slice();
		let split  = 0;

		for (let t = 0; t < temp.length; t++) {

			let line_a = temp[temp.length - 1 - t];
			let line_b = array[array.length - 1 - t];

			if (line_a === line_b) {
				result[result.length - 1 - t] = line_a;
			} else {
				split = array.length - 1 - t;
				break;
			}

		}

		for (let s = 0; s <= split; s++) {
			result[s] = array[s];
		}

		return result;

	};

	const blink = function() {

		let al   = arguments.length;
		let args = [ '(!)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		if (BLINK.interval === null) {

			BLINK.interval = setInterval(() => {
				BLINK.index++;
			}, (1000 / BLINK.colors.length) * 2);

		}


		let color = BLINK.colors[BLINK.index % BLINK.colors.length] || null;
		if (color !== null) {

			let message = '%c';
			let style   = 'background: ' + color + '; color: #ffffff';

			for (let a = 0, al = args.length; a < al; a++) {

				if (a > 0) message += ',';

				if (typeof args[a] === 'string') {
					message += args[a];
				} else {
					message += (args[a]).toString();
				}

			}

			console.log(message, style);

		}

	};

	const compare = function(str1, str2) {

		let offset = [ -1, -1, -1 ];

		for (let s = 0, sl = Math.max(str1.length, str2.length); s < sl; s++) {

			if (str1[s] === str2[s]) {
				offset[0] = s;
			} else {
				offset[0] = s;
				break;
			}

		}

		if (offset[0] > 0) {

			let search = -1;

			for (let s = offset[0] + 1, sl = Math.max(str1.length, str2.length); s < sl; s++) {

				if (str1[s] !== str2[s]) {
					search = s;
				} else {
					search = s;
					break;
				}

			}

			if (search !== -1) {
				offset[1] = search;
				offset[2] = search;
			}

		}

		if (str1 === str2) {

			if (offset[0] === -1) {
				offset[0] = 0;
			}

			if (offset[1] === -1) {
				offset[1] = 0;
			}

			if (offset[2] === -1) {
				offset[2] = 0;
			}

		} else {

			if (offset[0] === -1) {
				offset[0] = 0;
			}

			if (offset[1] === -1) {
				offset[1] = str1.length;
			}

			if (offset[2] === -1) {
				offset[2] = str2.length;
			}

			if (str1.length !== str2.length) {
				offset[1] = str1.length;
				offset[2] = str2.length;
			}

		}

		return offset;

	};

	const diff = function() {

		if (arguments.length === 2) {

			let value_a = JSON.stringify(arguments[0], null, '\t');
			let value_b = JSON.stringify(arguments[1], null, '\t');

			if (isPrimitive(arguments[0]) === true && isPrimitive(arguments[1]) === true) {

				if (arguments[0] === arguments[1]) {

					let msg = '';

					msg += value_a;
					msg += ' ';
					msg += value_b;

					log(msg);

				} else {

					let msg = '';

					msg += '%c';
					msg += value_a;

					msg += '%c';
					msg += ' ';

					msg += '%c';
					msg += value_b;

					log(
						msg,
						DIFF.remove,
						DIFF.normal,
						DIFF.insert
					);

				}

			} else {

				let lines_a = value_a.split('\t').join(INDENT).split('\n');
				let lines_b = value_b.split('\t').join(INDENT).split('\n');
				let result  = [];

				if (lines_a.length > lines_b.length) {
					lines_b = align(lines_b, lines_a);
				} else if (lines_b.length > lines_a.length) {
					lines_a = align(lines_a, lines_b);
				}

				for (let l = 0, ll = Math.max(lines_a.length, lines_b.length); l < ll; l++) {

					let line_a = lines_a[l];
					let line_b = lines_b[l];

					if (line_a === null) {
						result.push([ '+', '', line_b ]);
					} else if (line_b === null) {
						result.push([ '-', line_a, '' ]);
					} else if (line_a === line_b) {
						result.push([ '', line_a, line_b ]);
					} else {
						result.push([ '-+', line_a, line_b ]);
					}

				}

				let max = 0;

				result.forEach((values) => {
					max = Math.max(max, values[1].length, values[2].length);
				});

				result.forEach((values) => {

					let op     = values[0];
					let line_a = values[1];
					let line_b = values[2];
					let div_a  = WHITESPACE.substr(0, max - line_a.length);
					let div_b  = WHITESPACE.substr(0, max - line_b.length);

					if (op === '') {

						let msg = '';

						msg += '%c';
						msg += line_a;

						msg += '%c';
						msg += div_a;

						msg += '%c';
						msg += ' ';

						msg += '%c';
						msg += line_b;

						msg += '%c';
						msg += div_b;

						log(
							msg,
							DIFF.normal,
							DIFF.normal,
							DIFF.normal,
							DIFF.normal,
							DIFF.normal
						);

					} else if (op === '+') {

						let msg = '';

						msg += '%c';
						msg += line_a;

						msg += '%c';
						msg += div_a;

						msg += '%c';
						msg += ' ';

						msg += '%c';
						msg += line_b;

						msg += '%c';
						msg += div_b;

						log(
							msg,
							DIFF.normal,
							DIFF.normal,
							DIFF.normal,
							DIFF.insert,
							DIFF.normal
						);

					} else if (op === '-') {

						let msg = '';

						msg += '%c';
						msg += line_a;

						msg += '%c';
						msg += div_a;

						msg += '%c';
						msg += ' ';

						msg += '%c';
						msg += line_b;

						msg += '%c';
						msg += div_b;

						log(
							msg,
							DIFF.remove,
							DIFF.normal,
							DIFF.normal,
							DIFF.normal,
							DIFF.normal
						);

					} else if (op === '-+') {

						let msg    = '';
						let offset = compare(line_a, line_b);

						if (offset[0] !== -1 && offset[1] !== -1 && offset[2] !== -1) {

							msg += '%c';
							msg += line_a.substr(0, offset[0]);
							msg += '%c';
							msg += line_a.substr(offset[0], offset[1] - offset[0]);
							msg += '%c';
							msg += line_a.substr(offset[1]);

							msg += '%c';
							msg += div_a;

							msg += '%c';
							msg += ' ';

							msg += '%c';
							msg += line_b.substr(0, offset[0]);
							msg += '%c';
							msg += line_b.substr(offset[0], offset[2] - offset[0]);
							msg += '%c';
							msg += line_b.substr(offset[2]);

							msg += '%c';
							msg += div_b;

							log(
								msg,
								DIFF.normal,
								DIFF.remove,
								DIFF.normal,
								DIFF.normal,
								DIFF.normal,
								DIFF.normal,
								DIFF.insert,
								DIFF.normal,
								DIFF.normal
							);

						} else {

							msg += '%c';
							msg += line_a;

							msg += '%c';
							msg += div_a;

							msg += '%c';
							msg += ' ';

							msg += '%c';
							msg += line_b;

							msg += '%c';
							msg += div_b;

							log(
								msg,
								DIFF.remove,
								DIFF.normal,
								DIFF.normal,
								DIFF.insert,
								DIFF.normal
							);

						}

					}

				});

			}

		}

	};



	const console = {
		blink: blink,
		clear: clear,
		debug: debug,
		diff:  diff,
		error: error,
		info:  info,
		log:   log,
		warn:  warn
	};

	if (typeof global.console === 'undefined') {
		global.console = console;
	}

	return console;

})(typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this));

