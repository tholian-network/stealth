
export const console = (function(global) {

	const CONSOLE = global.console;

	if (typeof global.parent !== 'undefined') {

		if (global !== global.parent) {
			global = global.parent;
		}

	}

	if (typeof global[Symbol.for('base-console')] !== 'undefined') {
		return global[Symbol.for('base-console')];
	}

	const PALETTE = {
		'Boolean':  '#03a8cd',
		'Global':   '#d68786',
		'Keyword':  '#d25f7b',
		'Literal':  '#d68786',
		'Number':   '#ff094b',
		'RegExp':   '#ff094b',
		'Scope':    '#03a8cd',
		'String':   '#55d759',
		'Type':     '#d68786'
	};

	const PALETTE_DIFF = {
		insert: '#005f00',
		normal: '#2e3436',
		remove: '#870000'
	};

	const SYNTAX = {

		'console':    'Global',
		'global':     'Global',
		'this':       'Scope',
		'window':     'Global',
		'process':    'Global',

		'setTimeout':    'Global',
		'clearTimeout':  'Global',
		'setInterval':   'Global',
		'clearInterval': 'Global',

		'function':   'Literal',
		'const':      'Keyword',
		'let':        'Scope',
		'new':        'Scope',
		'for':        'Keyword',
		'while':      'Keyword',
		'if':         'Keyword',
		'else if':    'Keyword',
		'else':       'Keyword',
		'switch':     'Keyword',
		'case':       'Keyword',
		'typeof':     'Scope',
		'instanceof': 'Scope',

		'[':          'Literal',
		']':          'Literal',
		'(':          'Literal',
		')':          'Literal',
		'{':          'Literal',
		'}':          'Literal',

		'null':       'Keyword',
		'undefined':  'Keyword',
		'false':      'Boolean',
		'true':       'Boolean',
		'Infinity':   'Keyword',
		'NaN':        'Number',

		'Array':      'Keyword',
		'Boolean':    'Keyword',
		'Buffer':     'Keyword',
		'Date':       'Keyword',
		'Emitter':    'Keyword',
		'Function':   'Keyword',
		'Number':     'Keyword',
		'Object':     'Keyword',
		'RegExp':     'Keyword',
		'String':     'Keyword',

		'isArray':    'Keyword',
		'isBoolean':  'Keyword',
		'isBuffer':   'Keyword',
		'isDate':     'Keyword',
		'isEmitter':  'Keyword',
		'isFunction': 'Keyword',
		'isNumber':   'Keyword',
		'isObject':   'Keyword',
		'isRegExp':   'Keyword',
		'isString':   'Keyword'

	};

	const write_console = (() => {

		let element = global.document.querySelector('base-console');
		if (element === null) {

			let elements = {
				console: global.document.createElement('base-console'),
				style:   global.document.createElement('style')
			};


			let style = [
				'base-console {',
				'\tall: unset;',
				'\tdisplay: block;',
				'\tposition: fixed;',
				'\ttop: 0px;',
				'\tright: 0px;',
				'\tbottom: 0px;',
				'\tleft: 0px;',
				'\tbox-sizing: border-box;',
				'\tbackground: #2e3436;',
				'\ttransition: 200ms transform ease-out;',
				'\ttransform: translate(-100%, 0%);',
				'\tz-index: 2048;',
				'\toverflow-y: auto;',
				'}',
				'base-console.active {',
				'\ttransition: 200ms transform ease-out;',
				'\ttransform: translate(0%, 0%);',
				'}',
				'base-console base-console-line {',
				'\tdisplay: block;',
				'\tposition: relative;',
				'\twhite-space: pre;',
				'\tcolor: #ffffff;',
				'\tfont-family: monospace;',
				'\toverflow-x: auto;',
				'}',
				'base-console base-console-line i {',
				'\tfont-style: normal;',
				'}',
				'base-console base-console-line.blink {',
				'\tbackground: #000000;',
				'\tanimation: base_console_blink 1s linear infinite;',
				'}',
				'base-console base-console-line.error {',
				'\tbackground: #cc0000;',
				'}',
				'base-console base-console-line.info {',
				'\tbackground: #4e9a06;',
				'}',
				'base-console base-console-line.log {',
				'\tbackground: transparent;',
				'}',
				'base-console base-console-line.warn {',
				'\tbackground: #ffcc00;',
				'}',
				'@keyframes base_console_blink {',
				'\t0%   { background: #000000; }',
				'\t50%  { background: #00d7ff; }',
				'\t100% { background: #000000; }',
				'}'
			];

			Object.keys(PALETTE).forEach((keyword) => {
				style.push('base-console base-console-line i.' + keyword.toLowerCase() + '{');
				style.push('\tcolor: ' + PALETTE[keyword] + ';');
				style.push('}');
			});

			Object.keys(PALETTE_DIFF).forEach((keyword) => {
				style.push('base-console base-console-line.diff i.' + keyword.toLowerCase() + '{');
				style.push('\tbackground: ' + PALETTE_DIFF[keyword] + ';');
				style.push('}');
			});


			elements.style.appendChild(global.document.createTextNode(style.join('\n')));

			if (global.document.head !== null && global.document.body !== null) {

				global.document.head.appendChild(elements.style);
				global.document.body.appendChild(elements.console);

			} else {

				global.document.addEventListener('DOMContentLoaded', () => {
					global.document.head.appendChild(elements.style);
					global.document.body.appendChild(elements.console);
				}, true);

			}

			element = elements.console;

		}


		return (message, type) => {

			let line = global.document.createElement('base-console-line');

			line.innerHTML = message;
			line.setAttribute('class',    type);
			line.setAttribute('data-val', line.innerText);

			element.appendChild(line);

		};

	})();

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

	const highlight = function(str, type) {

		let color = PALETTE[type] || null;
		if (color !== null) {
			return '<i class="' + type.toLowerCase() + '">' + str + '</i>';
		} else {
			return str;
		}

	};

	const highlight_diff = function(str, type) {

		let color = PALETTE_DIFF[type] || null;
		if (color !== null) {
			return '<i class="' + type.toLowerCase() + '">' + str + '</i>';
		} else {
			return str;
		}

	};

	const highlight_split = function(chunk, split) {

		let index = chunk.indexOf(split);
		if (index !== -1) {

			let temp1 = chunk.substr(0, index).split(' ').map((ch) => highlight_chunk(ch)).join(' ');
			let temp2 = chunk.substr(index + 1).split(' ').map((ch) => highlight_chunk(ch)).join(' ');

			if (SYNTAX[split] !== undefined) {
				chunk = temp1 + highlight(split, SYNTAX[split]) + temp2;
			} else {
				chunk = temp1 + split + temp2;
			}

		}

		return chunk;

	};

	const highlight_chunk = function(chunk) {

		let prefix = '';
		let suffix = '';

		if (chunk.startsWith('\t') === true) {

			let index = Array.from(chunk).findIndex((val) => val !== '\t');
			if (index !== -1) {
				prefix = chunk.substr(0, index);
				chunk  = chunk.substr(index);
			}

		}

		if (chunk.endsWith(';') === true || chunk.endsWith(',') === true) {
			suffix = chunk.substr(chunk.length - 1, 1);
			chunk  = chunk.substr(0, chunk.length - 1);
		}

		if (SYNTAX[chunk] !== undefined) {

			chunk = highlight(chunk, SYNTAX[chunk]);

		} else if (chunk.includes(':') === true) {

			chunk = highlight_split(chunk, ':');

		} else if (chunk.includes('(') === true) {

			chunk = highlight_split(chunk, '(');

		} else if (chunk.includes(')') === true) {

			chunk = highlight_split(chunk, ')');

		} else if (chunk.includes('{') === true) {

			chunk = highlight_split(chunk, '{');

		} else if (chunk.includes('}') === true) {

			chunk = highlight_split(chunk, '}');

		} else if (chunk.includes(' ') === true) {

			chunk = highlight_split(chunk, ' ');

		} else if ((/^([0-9.]*)$/g).test(chunk) === true) {

			if (chunk.includes('.') === true) {

				let num = parseFloat(chunk);
				if (Number.isNaN(num) === false && (num).toString() === chunk) {
					chunk = highlight(chunk, 'Number');
				}

			} else {

				let num = parseInt(chunk, 10);
				if (Number.isNaN(num) === false && (num).toString() === chunk) {
					chunk = highlight(chunk, 'Number');
				}

			}

		} else if (chunk.includes('.') === true) {

			chunk = chunk.split('.').map((ch) => highlight_chunk(ch)).join('.');

		}

		return prefix + chunk + suffix;

	};

	const highlight_line = function(line) {

		if (line.includes('"') === true) {

			let index1 = line.indexOf('"');
			let index2 = line.indexOf('"', index1 + 1);
			if (index1 !== -1 && index2 !== -1) {

				let str = '';

				str += line.substr(0, index1).split(' ').map((chunk) => highlight_chunk(chunk)).join(' ');
				str += highlight(line.substr(index1, index2 - index1 + 1), 'String');
				str += line.substr(index2 + 1).split(' ').map((chunk) => highlight_chunk(chunk)).join(' ');

				line = str;

			}

		} else if (line.includes('\'') === true) {

			let index1 = line.indexOf('\'');
			let index2 = line.indexOf('\'', index1 + 1);
			if (index1 !== -1 && index2 !== -1) {

				let str = '';

				str += line.substr(0, index1).split(' ').map((chunk) => highlight_chunk(chunk)).join(' ');
				str += highlight(line.substr(index1, index2 - index1 + 1), 'String');
				str += line.substr(index2 + 1).split(' ').map((chunk) => highlight_chunk(chunk)).join(' ');

				line = str;

			}

		} else {

			line = highlight_chunk(line);

		}


		return line;

	};

	const isArray = function(arr) {
		return Object.prototype.toString.call(arr) === '[object Array]';
	};

	const isBuffer = function(buffer) {

		if (buffer instanceof Buffer) {
			return true;
		} else if (Object.prototype.toString.call(buffer) === '[object Buffer]') {
			return true;
		}


		return false;

	};

	const isDate = function(dat) {
		return Object.prototype.toString.call(dat) === '[object Date]';
	};

	const isError = function(obj) {
		return Object.prototype.toString.call(obj).includes('Error') === true;
	};

	const isFunction = function(fun) {
		return Object.prototype.toString.call(fun) === '[object Function]';
	};

	const isMatrix = function(obj) {

		if (isArray(obj) === true && obj.length > 4) {

			let check = obj.filter((v) => isNumber(v) === true);
			if (check.length === obj.length) {

				let dim = Math.floor(Math.sqrt(obj.length));
				if (dim * dim === obj.length) {
					return true;
				}

			}

		}

		return false;

	};

	const isNumber = function(num) {
		return Object.prototype.toString.call(num) === '[object Number]';
	};

	const isObject = function(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]';
	};

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

	const isRegExp = function(obj) {
		return Object.prototype.toString.call(obj) === '[object RegExp]';
	};

	const isString = function(str) {
		return Object.prototype.toString.call(str) === '[object String]';
	};

	const isUint8Array = function(array) {

		if (Object.prototype.toString.call(array) === '[object Uint8Array]') {
			return true;
		}


		return false;

	};

	const INDENT       = '    ';
	const WHITESPACE   = new Array(512).fill(' ').join('');
	const format_date2 = (n) => {

		if (n < 10) {
			return '0' + n;
		}

		return '' + n;

	};

	const format_date3 = (n) => {

		if (n < 10) {
			return '00' + n;
		} else if (n < 100) {
			return '0' + n;
		}

		return '' + n;

	};

	const format_hex = (n) => {

		let str = (n).toString(16);
		if (str.length % 2 === 1) {
			str = '0' + str;
		}

		return str;

	};

	const cleanify = function(raw) {

		let str = '';

		for (let r = 0, rl = raw.length; r < rl; r++) {

			let code = raw.charCodeAt(r);
			if (code === 9) {
				str += '\\t';
			} else if (code === 10) {
				str += '\\n';
			} else if (code === 13) {
				str += '\\r';
			} else if (code === 27) {

				if (raw[r + 1] === '[') {

					let index = raw.indexOf('m', r + 2);
					if (index !== -1) {
						r = index;
					}

				}

			} else if (code >= 32 && code <= 127) {
				str += raw.charAt(r);
			}

		}

		str = str.split('\r').join('\\r');
		str = str.split('\n').join('\\n');

		return str;

	};

	const stringify = function(data, indent) {

		indent = isString(indent) ? indent : '';


		let str = '';

		if (
			typeof data === 'boolean'
			|| data === null
			|| data === undefined
			|| (
				typeof data === 'number'
				&& (
					data === Infinity
					|| data === -Infinity
					|| Number.isNaN(data) === true
				)
			)
		) {

			if (data === null) {
				str = indent + highlight('null', 'Keyword');
			} else if (data === undefined) {
				str = indent + highlight('undefined', 'Keyword');
			} else if (data === false) {
				str = indent + highlight('false', 'Boolean');
			} else if (data === true) {
				str = indent + highlight('true', 'Boolean');
			} else if (data === Infinity) {
				str = indent + highlight('Infinity', 'Keyword');
			} else if (data === -Infinity) {
				str = indent + highlight('-Infinity', 'Keyword');
			} else if (Number.isNaN(data) === true) {
				str = indent + highlight('NaN', 'Number');
			}

		} else if (isError(data) === true) {

			let type = Object.prototype.toString.call(data);
			if (type.startsWith('[object') === true && type.endsWith(']') === true) {
				type = type.substr(7, type.length - 8).trim();
			}

			let msg = (data.message || '').trim();
			if (msg.length > 0) {
				str = indent + highlight(type, 'Keyword') + ': ' + highlight('"' + msg + '"', 'String') + '\n';
			} else {
				str = indent + highlight(type, 'Keyword') + ':\n';
			}


			let stack = (data.stack || '').trim().split('\n');
			if (stack.length > 0) {

				let origin = null;

				for (let s = 0, sl = stack.length; s < sl; s++) {

					let line = stack[s].trim();
					if (line.includes('(https://') === true && line.includes(')') === true) {

						let tmp = line.split('(https://')[1].split(')').shift().trim();
						if (tmp.includes('.mjs') === true || tmp.includes('.html') === true) {
							origin = 'https://' + tmp;
							break;
						}

					} else if (line.includes('(http://') === true && line.includes(')') === true) {

						let tmp = line.split('(http://')[1].split(')').shift().trim();
						if (tmp.includes('.mjs') === true || tmp.includes('.html') === true) {
							origin = 'http://' + tmp;
							break;
						}

					} else if (line.includes('https://') === true) {

						let tmp = line.split('https://')[1].trim();
						if (tmp.includes('.mjs') === true || tmp.includes('.html') === true) {
							origin = 'https://' + tmp;
							break;
						}

					} else if (line.includes('http://') === true) {

						let tmp = line.split('http://')[1].trim();
						if (tmp.includes('.mjs') === true || tmp.includes('.html') === true) {
							origin = 'http://' + tmp;
							break;
						}

					}

				}

				if (origin !== null) {
					str += origin;
				}

			}

		} else if (isNumber(data) === true) {

			str = indent + highlight(data.toString(), 'Number');

		} else if (isRegExp(data) === true) {

			str = indent + highlight(data.toString(), 'RegExp');

		} else if (isString(data) === true) {

			str = indent + highlight('"' + cleanify(data).split('"').join('\\"') + '"', 'String');

		} else if (isFunction(data) === true) {

			str = '';

			let lines = data.toString().split('\n');
			if (lines.length > 1) {

				let offset = '';

				let tmp = lines.find((line) => {
					return line.startsWith('\t') === true && line.trim() !== '';
				}) || null;
				if (tmp !== null) {
					offset = tmp.substr(0, tmp.length - tmp.trim().length);
				}

				if (
					lines[0].startsWith('\t') === false
					&& lines[lines.length - 1].startsWith('\t') === false
				) {
					lines[0]                = offset + lines[0];
					lines[lines.length - 1] = offset + lines[lines.length - 1];
				}

				lines = lines.map((line) => {
					return highlight_line(line);
				});


				let first_line = lines[0];
				if (first_line.includes('function(') === true || first_line.includes('{') === true) {

					if (indent.length > 0) {
						str += indent.substr(0, indent.length - 1) + '\t' + first_line.trim();
					} else {
						str += first_line.trim();
					}

				}

				str += '\n';

				for (let l = 1, ll = lines.length; l < ll - 1; l++) {

					if (lines[l].startsWith(offset) === true) {
						str += indent + '\t' + lines[l].substr(offset.length).trimRight();
					} else {
						str += indent + '\t' + lines[l].trim();
					}

					str += '\n';

				}

				let last_line = lines[lines.length - 1];
				if (last_line.includes('}') === true) {

					if (indent.length > 0) {
						str += indent.substr(0, indent.length - 1) + '\t' + last_line.trim();
					} else {
						str += last_line.trim();
					}

				}

				str += '\n';

			} else {

				str += indent + highlight_line(lines[0]);

			}

			str += '\n';

		} else if (isArray(data) === true) {

			if (data.length === 0) {

				str = indent + highlight('[]', 'Literal');

			} else if (isMatrix(data) === true) {

				str  = indent;
				str += highlight('[', 'Literal') + '\n';

				let line = Math.floor(Math.sqrt(data.length));
				let max  = data.reduce((a, b) => Math.max((' ' + a).length, ('' + b).length), '');

				for (let d = 0, dl = data.length; d < dl; d++) {

					let margin = (max - ('' + data[d]).length);

					if (d % line === 0) {

						if (d > 0) {
							str += '\n';
						}

						str += stringify(data[d], '\t' + indent + WHITESPACE.substr(0, margin));

					} else {

						str += WHITESPACE.substr(0, margin);
						str += stringify(data[d]);

					}

					if (d < dl - 1) {
						str += ', ';
					} else {
						str += '  ';
					}

				}

				str += '\n' + indent + highlight(']', 'Literal');

			} else {

				str  = indent;
				str += highlight('[', 'Literal') + '\n';

				for (let d = 0, dl = data.length; d < dl; d++) {

					str += stringify(data[d], '\t' + indent);

					if (d < dl - 1) {
						str += ',';
					}

					str += '\n';

				}

				str += indent + highlight(']', 'Literal');

			}

		} else if (isBuffer(data) === true) {

			str = indent;

			let tmp = cleanify(data.toString('utf8'));
			if (tmp.length >= data.length) {

				str += highlight('Buffer', 'Type') + '.from(';
				str += highlight('"' + tmp + '"', 'String');
				str += ', ';
				str += highlight('"utf8"', 'String') + ')';

			} else if (data.length > 0) {

				str += highlight('Buffer', 'Type') + '.from(';
				str += highlight('[', 'Literal');

				for (let d = 0, dl = data.length; d < dl; d++) {

					str += highlight('0x' + format_hex(data[d]), 'Number');

					if (d < dl - 1) {
						str += ',';
					}

				}

				str += highlight(']', 'Literal');
				str += ')';

			} else {

				str += highlight('Buffer', 'Type') + '.from(';
				str += highlight('[', 'Literal');
				str += highlight(']', 'Literal');
				str += ')';

			}

		} else if (isUint8Array(data) === true) {

			str = indent;

			if (data.length > 0) {

				str += highlight('Uint8Array', 'Type') + '.from(';
				str += highlight('[', 'Literal');

				for (let d = 0, dl = data.byteLength; d < dl; d++) {

					str += highlight(data[d], 'Number');

					if (d < dl - 1) {
						str += ',';
					}

				}

				str += highlight(']', 'Literal');
				str += ')';

			} else {

				str += highlight('Uint8Array', 'Type') + '.from(';
				str += highlight('[', 'Literal');
				str += highlight(']', 'Literal');
				str += ')';

			}

		} else if (isDate(data) === true) {

			str  = indent;
			str += highlight(data.getUTCFullYear(), 'Number');
			str += highlight('-', 'Keyword');
			str += highlight(format_date2(data.getUTCMonth() + 1), 'Number');
			str += highlight('-', 'Keyword');
			str += highlight(format_date2(data.getUTCDate()), 'Number');
			str += highlight('T', 'Keyword');
			str += highlight(format_date2(data.getUTCHours()), 'Number');
			str += highlight(':', 'Keyword');
			str += highlight(format_date2(data.getUTCMinutes()), 'Number');
			str += highlight(':', 'Keyword');
			str += highlight(format_date2(data.getUTCSeconds()), 'Number');

			if (data.getUTCMilliseconds() !== 0) {
				str += highlight('.', 'Keyword');
				str += highlight(format_date3(data.getUTCMilliseconds()), 'Number');
			}

			str += highlight('Z', 'Keyword');

		} else if (data[Symbol.toStringTag] !== undefined && typeof data.toJSON === 'function') {

			let json = data.toJSON();
			if (
				isObject(json) === true
				&& isString(json.type) === true
				&& isObject(json.data) === true
			) {

				str  = indent;
				str += highlight(json.type, 'Type') + '.from(' + highlight('{', 'Literal') + '\n';

				let keys = Object.keys(json);
				for (let k = 0, kl = keys.length; k < kl; k++) {

					let key = keys[k];

					str += '\t' + indent + highlight('"' + key + '"', 'String') + ': ';
					str += stringify(json[key], '\t' + indent).trim();

					if (k < kl - 1) {
						str += ',';
					}

					str += '\n';

				}

				str += indent + highlight('}', 'Literal') + ')';

			} else {

				let keys = Object.keys(data);
				if (keys.length === 0) {

					str = indent + highlight('{}', 'Literal');

				} else {

					str  = indent;
					str += highlight('{', 'Literal') + '\n';

					for (let k = 0, kl = keys.length; k < kl; k++) {

						let key = keys[k];

						str += '\t' + indent + highlight('"' + key + '"', 'String') + ': ';
						str += stringify(data[key], '\t' + indent).trim();

						if (k < kl - 1) {
							str += ',';
						}

						str += '\n';

					}

					str += indent + highlight('}', 'Literal');

				}

			}

		} else if (isObject(data) === true || data[Symbol.toStringTag] !== undefined) {

			let keys = Object.keys(data);
			if (keys.length === 0) {

				str = indent + highlight('{}', 'Literal');

			} else {

				str  = indent;

				if (data[Symbol.toStringTag] !== undefined) {
					str += '(' + highlight(data[Symbol.toStringTag] + 'Type') + ') ';
				}

				str += highlight('{', 'Literal') + '\n';

				for (let k = 0, kl = keys.length; k < kl; k++) {

					let key = keys[k];

					str += '\t' + indent + highlight('"' + key + '"', 'String') + ': ';
					str += stringify(data[key], '\t' + indent).trim();

					if (k < kl - 1) {
						str += ',';
					}

					str += '\n';

				}

				str += indent + highlight('}', 'Literal');

			}

		}


		return str;

	};

	const stringify_arguments = function(args) {

		if (args.length === 2 && isString(args[1]) === true) {

			return args[0] + ' ' + args[1];

		} else {

			let chunks    = args.slice(1).map((value) => stringify(value));
			let multiline = chunks.find((value) => {
				return value.includes('\n') === true;
			}) !== undefined;
			if (multiline === true) {

				let lines = [
					args[0]
				];

				chunks.forEach((raw) => {

					raw.split('\n').forEach((line) => {

						if (line.includes('\t') === true) {
							line = line.split('\t').join(INDENT);
						}

						if (line.includes('\r') === true) {
							line = line.split('\r').join('\\r');
						}

						lines.push(line);

					});

				});

				return lines.join('\n');

			} else {

				return args[0] + ' ' + chunks.join(', ');

			}

		}

	};

	const blink = function() {

		let al   = arguments.length;
		let args = [ '(!)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		write_console(stringify_arguments(args), 'blink');
		CONSOLE.log.apply(CONSOLE, arguments);

	};

	const clear = function(partial) {

		partial = typeof partial === 'boolean' ? partial : false;


		if (partial === true) {

			let element = global.document.querySelector('base-console');
			if (element !== null) {

				let line = Array.from(element.querySelectorAll('base-console-line')).pop() || null;
				if (line !== null) {
					line.parentNode.removeChild(line);
				}

			}

			CONSOLE.clear();

		} else {

			let element = global.document.querySelector('base-console');
			if (element !== null) {

				Array.from(element.querySelectorAll('base-console-line')).forEach((line) => {
					line.parentNode.removeChild(line);
				});

			}

			CONSOLE.clear();

		}

	};

	const debug = function() {

		let al   = arguments.length;
		let args = [ '(E)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		write_console(stringify_arguments(args), 'error');
		CONSOLE.debug.apply(CONSOLE, arguments);

	};

	const offset_color = function(index) {

		let min = this.lastIndexOf('<i', index);
		let max = this.indexOf('>', index) + 1;

		if (min !== -1 && max !== -1) {

			let check = this.substr(min, max - min);
			if (
				check.startsWith('<i class="#') === true
				&& check.endsWith('">') === true
				&& check.substr(1).includes('<') === false
				&& check.substr(0, check.length - 1).includes('>') === false
			) {
				return [ min, max ];
			}

		}

		return null;

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

		let range01 = offset_color.call(str1, offset[0]);
		let range02 = offset_color.call(str2, offset[0]);

		if (range01 !== null && range02 !== null) {
			offset[0] = Math.min(range01[0], range02[0]);
		} else if (range01 !== null) {
			offset[0] = range01[0];
		} else if (range02 !== null) {
			offset[0] = range02[0];
		}

		let range1 = offset_color.call(str1, offset[1]);
		if (range1 !== null) {
			offset[1] = range1[1];
		}

		let range2 = offset_color.call(str2, offset[2]);
		if (range2 !== null) {
			offset[2] = range2[1];
		}

		return offset;

	};

	const diff = function() {

		if (arguments.length === 2) {

			let value_a = stringify(arguments[0]);
			let value_b = stringify(arguments[1]);

			if (isPrimitive(arguments[0]) === true && isPrimitive(arguments[1]) === true) {

				if (arguments[0] === arguments[1]) {

					let msg = '';

					msg += highlight_diff(value_a, 'normal');
					msg += highlight_diff(' ',     'normal');
					msg += highlight_diff(value_b, 'normal');
					msg += highlight_diff(' ',     'normal');
					msg += '\n';

					write_console(msg, 'diff');

				} else {

					let msg = '';

					msg += highlight_diff(value_a, 'remove');
					msg += highlight_diff(' ',     'normal');
					msg += highlight_diff(value_b, 'insert');
					msg += highlight_diff(' ',     'normal');
					msg += '\n';

					write_console(msg, 'diff');

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
					max = Math.max(max, cleanify(values[1]).length, cleanify(values[2]).length);
				});

				result.forEach((values) => {

					let op     = values[0];
					let line_a = values[1];
					let line_b = values[2];
					let div_a  = WHITESPACE.substr(0, max - cleanify(line_a).length);
					let div_b  = WHITESPACE.substr(0, max - cleanify(line_b).length);

					if (op === '') {

						let msg = '';

						msg += highlight_diff(line_a, 'normal');
						msg += highlight_diff(div_a,  'normal');
						msg += highlight_diff(' ',    'normal');
						msg += highlight_diff(line_b, 'normal');
						msg += highlight_diff(div_b,  'normal');
						msg += highlight_diff(' ',    'normal');
						msg += '\n';

						write_console(msg, 'diff');

					} else if (op === '+') {

						let msg = '';

						msg += highlight_diff(line_a, 'normal');
						msg += highlight_diff(div_a,  'normal');
						msg += highlight_diff(' ',    'normal');
						msg += highlight_diff(line_b, 'insert');
						msg += highlight_diff(div_b,  'normal');
						msg += highlight_diff(' ',    'normal');
						msg += '\n';

						write_console(msg, 'diff');

					} else if (op === '-') {

						let msg = '';

						msg += highlight_diff(line_a, 'remove');
						msg += highlight_diff(div_a,  'normal');
						msg += highlight_diff(' ',    'normal');
						msg += highlight_diff(line_b, 'normal');
						msg += highlight_diff(div_b,  'normal');
						msg += highlight_diff(' ',    'normal');
						msg += '\n';

						write_console(msg, 'diff');

					} else if (op === '-+') {

						let msg    = '';
						let offset = compare(line_a, line_b);

						if (offset[0] !== -1 && offset[1] !== -1 && offset[2] !== -1) {

							msg += highlight_diff(line_a.substr(0, offset[0]),                     'normal');
							msg += highlight_diff(line_a.substr(offset[0], offset[1] - offset[0]), 'remove');
							msg += highlight_diff(line_a.substr(offset[1]),                        'normal');
							msg += highlight_diff(div_a,                                           'normal');
							msg += highlight_diff(' ',                                             'normal');
							msg += highlight_diff(line_b.substr(0, offset[0]),                     'normal');
							msg += highlight_diff(line_b.substr(offset[0], offset[2] - offset[0]), 'insert');
							msg += highlight_diff(line_b.substr(offset[2]),                        'normal');
							msg += highlight_diff(div_b,                                           'normal');
							msg += highlight_diff(' ',                                             'normal');
							msg += '\n';

							write_console(msg, 'diff');

						} else {

							msg += highlight_diff(line_a, 'remove');
							msg += highlight_diff(div_a,  'normal');
							msg += highlight_diff(' ',    'normal');
							msg += highlight_diff(line_b, 'insert');
							msg += highlight_diff(div_b,  'normal');
							msg += highlight_diff(' ',    'normal');
							msg += '\n';

							write_console(msg, 'diff');

						}

					}

				});

			}

		}

	};

	const error = function() {

		let al   = arguments.length;
		let args = [ '(E)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		write_console(stringify_arguments(args), 'error');
		CONSOLE.error.apply(CONSOLE, arguments);

	};

	const info = function() {

		let al   = arguments.length;
		let args = [ '(I)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		write_console(stringify_arguments(args), 'info');
		CONSOLE.info.apply(CONSOLE, arguments);

	};

	const log = function() {

		let al   = arguments.length;
		let args = [ '(L)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		write_console(stringify_arguments(args), 'log');
		CONSOLE.log.apply(CONSOLE, arguments);

	};

	const warn = function() {

		let al   = arguments.length;
		let args = [ '(W)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		write_console(stringify_arguments(args), 'warn');
		CONSOLE.warn.apply(CONSOLE, arguments);

	};



	const console = global[Symbol.for('base-console')] = {
		blink: blink,
		clear: clear,
		debug: debug,
		diff:  diff,
		error: error,
		info:  info,
		log:   log,
		warn:  warn
	};


	return console;

})(typeof window !== 'undefined' ? window : this);

