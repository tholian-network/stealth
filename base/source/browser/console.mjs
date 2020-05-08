
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

		let result = {
			start: '',
			end:   ''
		};

		for (let s = 0, sl = Math.max(str1.length, str2.length); s < sl; s++) {

			if (str1[s] === str2[s]) {
				result.start = result.start + str1[s];
			} else {
				break;
			}

		}

		for (let s = 0; s < Math.min(str2.length, str1.length); s++) {

			if (str1[str1.length - 1 - s] === str2[str2.length - 1 - s]) {
				result.end = str1[str1.length - 1 - s] + result.end;
			} else {
				break;
			}

		}

		return result;

	};

	const diff = function() {

		if (arguments.length === 2) {

			let obj_a  = JSON.stringify(arguments[0], null, '\t').split('\t').join(INDENT).split('\n');
			let obj_b  = JSON.stringify(arguments[1], null, '\t').split('\t').join(INDENT).split('\n');
			let result = [];

			if (obj_a.length > obj_b.length) {

				let new_b = new Array(obj_a.length).fill(null);
				let tmp_a = obj_a.slice();
				let div_a = 0;

				for (let a = 0; a < tmp_a.length; a++) {

					let line_a = tmp_a[tmp_a.length - 1 - a];
					let line_b = obj_b[obj_b.length - 1 - a];

					if (line_a === line_b) {
						new_b[new_b.length - 1 - a] = line_a;
					} else {
						div_a = obj_b.length - 1 - a;
						break;
					}

				}

				for (let a = 0; a <= div_a; a++) {
					new_b[a] = obj_b[a];
				}

				obj_b = new_b;

			} else if (obj_b.length > obj_a.length) {

				let new_a = new Array(obj_b.length).fill(null);
				let tmp_b = obj_b.slice();
				let div_b = 0;

				for (let b = 0; b < tmp_b.length; b++) {

					let line_a = obj_a[obj_a.length - 1 - b];
					let line_b = tmp_b[tmp_b.length - 1 - b];

					if (line_a === line_b) {
						new_a[new_a.length - 1 - b] = line_b;
					} else {
						div_b = obj_a.length - 1 - b;
						break;
					}

				}

				for (let b = 0; b <= div_b; b++) {
					new_a[b] = obj_a[b];
				}

				obj_a = new_a;

			}

			for (let l = 0, ll = Math.max(obj_a.length, obj_b.length); l < ll; l++) {

				let line_a = obj_a[l];
				let line_b = obj_b[l];

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
				let l_line = values[1];
				let r_line = values[2];
				let l_div  = WHITESPACE.substr(0, max - l_line.length);
				let r_div  = WHITESPACE.substr(0, max - r_line.length);

				if (op === '') {
					log('%c' + l_line + l_div + r_line + r_div, DIFF.normal);
				} else if (op === '+') {
					log(l_div + '%c' + r_line + '%c' + r_div, DIFF.insert, DIFF.normal);
				} else if (op === '-') {
					log('%c' + l_line + '%c' + l_div + r_div, DIFF.remove, DIFF.normal);
				} else if (op === '-+') {

					let same = compare(l_line, r_line);
					let temp = '';

					temp += '%c' + l_line.substr(0, same.start.length);
					temp += '%c' + l_line.substr(same.start.length, l_line.length - same.start.length - same.end.length);
					temp += '%c' + l_line.substr(l_line.length - same.end.length);
					temp += l_div;
					temp += r_line.substr(0, same.start.length);
					temp += '%c' + r_line.substr(same.start.length, r_line.length - same.start.length - same.end.length);
					temp += '%c' + r_line.substr(r_line.length - same.end.length);
					temp += r_div;

					log(
						temp,
						DIFF.normal,
						DIFF.remove,
						DIFF.normal,
						DIFF.insert,
						DIFF.normal
					);

				}

			});

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

