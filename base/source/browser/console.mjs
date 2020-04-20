
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


	const console = {
		blink: blink,
		clear: clear,
		debug: debug,
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

