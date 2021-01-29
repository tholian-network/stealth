
import { isArray, isBuffer, isFunction, isObject, isRegExp, isString } from '../../extern/base.mjs';



const isGrammar = function(grammar) {

	if (isObject(grammar) === true) {

		let check = true;

		for (let name in grammar) {

			if (isFunction(grammar[name]) === false) {
				check = false;
				break;
			}

		}

		return check;

	}

	return false;


};

const isSyntax = function(syntax) {

	if (isArray(syntax) === true) {

		let check = syntax.filter((token) => {

			if (
				(isString(token.type) === true || token.type === null)
				&& (isRegExp(token.pattern) === true || isString(token.pattern) === true)
			) {
				return true;
			}

			return false;

		});

		if (check.length === syntax.length) {
			return true;
		}

	}


	return false;

};

const toMatches = (chunk, syntax) => {

	let matches = [];

	syntax.forEach((token) => {

		let match = null;

		if (isString(token.pattern) === true) {

			if (chunk.startsWith(token.pattern) === true) {
				match = token.pattern;
			}

		} else if (isRegExp(token.pattern) === true) {

			let tmp = chunk.match(token.pattern);
			if (tmp !== null) {
				match = tmp[0];
			}

		}


		if (match !== null) {

			matches.push({
				type:  token.type,
				value: match
			});

		}

	});

	if (matches.length > 1) {

		matches.sort((a, b) => {
			if (a.value.length > b.value.length) return -1;
			if (b.value.length > a.value.length) return  1;
			return 0;
		});

	}

	return matches;

};



const Parser = function(settings) {

	settings = isObject(settings) ? settings : {};


	settings = Object.freeze(Object.assign({
		grammar: {},
		syntax:  []
	}, settings));


	if (isGrammar(settings.grammar) === true) {
		this.grammar = settings.grammar;
	} else {
		this.grammar = {};
	}

	if (isSyntax(settings.syntax) === true) {
		this.syntax = settings.syntax;
	} else {
		this.syntax = [];
	}


	this.token = null;

	this.__state = {
		buffer: '',
		index:  0
	};

};


Parser.prototype = {

	exec: function(name) {

		let found = this.grammar[name] || null;
		if (found !== null) {

			if (isFunction(found) === true) {

				let token = found.call(this);

				if (isObject(token) === true) {
					return token;
				}

			}

		}


		return {
			type:  null,
			value: null
		};

	},

	expect: function(types) {

		types = isArray(types) ? types : [];


		if (types.length > 0) {

			let valid = false;

			for (let t = 0, tl = types.length; t < tl; t++) {

				if (this.token.type === types[t]) {
					valid = true;
					break;
				}

			}

			if (valid === false) {
				throw new SyntaxError('Unexpected Token "' + this.token.value + '" at index "' + this.__state.index + '", expected "' + types.join('", "') + '".');
			}

			if (valid === true) {
				return this.token;
			}

		}

		return {
			type:  null,
			value: null
		};

	},

	next: function(types) {

		types = isArray(types) ? types : [];


		if (this.__state.index < this.__state.buffer.length) {

			if (types.length > 0) {

				let chunk   = this.__state.buffer.substr(this.__state.index);
				let matches = toMatches(chunk, this.syntax.filter((token) => {
					return types.includes(token.type) || token.type === null;
				}));

				if (matches.length > 0) {

					let token = matches[0];
					if (token.type !== null) {

						this.__state.index += token.value.length;
						this.token = token;

						return this.token;

					} else if (token.type === null) {

						this.__state.index += token.value.length;
						this.token = token;

						return this.next(types);

					}

				} else {

					throw new SyntaxError('Unexpected Token "' + chunk[0] + '" at index ' + this.__state.index + '. Expected either of [ "' + types.join('", "') + '" ].');

				}

			} else {

				let chunk   = this.__state.buffer.substr(this.__state.index);
				let matches = toMatches(chunk, this.syntax);

				if (matches.length > 0) {

					let token = matches[0];
					if (token.type !== null) {

						this.__state.index += token.value.length;
						this.token = token;

						return this.token;

					} else if (token.type === null) {

						this.__state.index += token.value.length;
						this.token = token;

						return this.next(types);

					}

				} else {

					throw new SyntaxError('Unexpected Token "' + chunk[0] + '" at index ' + this.__state.index);

				}

			}

		} else {

			this.token = {
				type:  null,
				value: null
			};

		}


		return this.token;

	},

	parse: function(buf_or_str) {

		let raw = null;

		if (isBuffer(buf_or_str) === true) {
			raw = buf_or_str.toString('utf8');
		} else if (isString(buf_or_str) === true) {
			raw = buf_or_str;
		}


		let tree = null;

		if (raw !== null) {

			this.__state.buffer = raw;
			this.__state.index  = 0;

			this.next();

			tree = this.exec('root');

		}

		return tree;

	},

	range: function(types) {

		types = isArray(types) ? types : [];


		if (types.length > 0) {

			let found  = false;
			let offset = 0;
			let tokens = [];


			while (this.__state.index + offset < this.__state.buffer.length) {

				let chunk   = this.__state.buffer.substr(this.__state.index + offset);
				let matches = toMatches(chunk, this.syntax);

				if (matches.length > 0) {

					let token = matches[0];
					if (token.type !== null) {
						tokens.push(token);
					}

					offset += token.value.length;

					if (types.includes(token.type) === true) {
						found = true;
						break;
					}

				} else {
					break;
				}

			}


			if (tokens.length > 0 && found === true) {

				this.__state.index += offset;
				this.token = tokens[tokens.length - 1];

				return tokens;

			}

		}


		return [];

	}

};


export { Parser };

