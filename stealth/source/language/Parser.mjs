
import { console, isArray, isBuffer, isFunction, isNumber, isObject, isRegExp, isString } from '../../extern/base.mjs';



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

const nextToken = function() {

	if (this.__state.index < this.__state.buffer.length) {

		let chunk = this.__state.buffer.substr(this.__state.index);
		let found = null;

		for (let s = 0, sl = this.syntax.length; s < sl; s++) {

			let token = this.syntax[s];
			let match = toMatch(chunk, token.pattern);
			if (match !== null) {

				this.__state.index += match.length;

				if (token.type === null) {

					found = nextToken.call(this);

				} else if (token.type !== null) {

					found = {
						type:  token.type,
						value: match
					};

				}

			}

			if (found !== null) {
				break;
			}

		}


		// TODO: Refactor this!?
		if (found === null) {
			throw new SyntaxError('Unexpected Token "' + chunk[0] + '" at index "' + this.__state.index + '"');
		}


		if (found !== null) {

			this.token = found;

			return found;

		}

	}


	return null;

};

const seekToken = function(search, index) {

	search = isString(search) ? search : null;
	index  = isNumber(index)  ? index  : (this.__state.index);

	console.log(search, index, this.__state.buffer.length);


	if (index < this.__state.buffer.length) {

		let chunk = this.__state.buffer.substr(index);
		let found = null;

		console.log(chunk);

		for (let s = 0, sl = this.syntax.length; s < sl; s++) {

			let token = this.syntax[s];
			let match = toMatch(chunk, token.pattern);
			if (match !== null) {

				if (token.type === null) {

					found = seekToken.call(this, search, index + match.length);

				} else if (search !== null && token.type === search) {

					found = {
						type:  token.type,
						value: match
					};

				} else if (search === null) {

					found = {
						type:  token.type,
						value: match
					};

				}

			}

			if (found !== null) {
				break;
			}

		}


		if (found !== null) {
			return found;
		}

	}


	return null;


};

const toMatch = (chunk, pattern) => {

	if (isString(pattern) === true) {

		if (chunk.startsWith(pattern) === true) {
			return pattern;
		}

	} else if (isRegExp(pattern) === true) {

		let match = chunk.match(pattern);
		if (match !== null) {
			return match[0];
		}

	}


	return null;

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
				return found.call(this);
			}

		}


		return null;

	},

	next: function(type) {

		console.log('next()', type);

		type = isString(type) ? type : null;


		let token = this.token;

		// TODO: Refactor this!?
		if (token !== null && type !== null) {

			if (token.type !== type) {
				throw new SyntaxError('Unexpected Token "' + token.value + '" at index "' + this.__state.index + '", expected "' + type + '".');
			}

		} else if (token === null) {
			throw new SyntaxError('Unexpected End of File at index "' + this.__state.index + '", expected "' + type + '".');
		}

		this.token = nextToken.call(this);


		return token;

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

			this.token = nextToken.call(this);

			tree = this.exec('root');

		}

		return tree;

	},

	seek: function(type) {

		type = isString(type) ? type : null;


		let index = this.__state.index;

		if (this.token !== null) {
			index += this.token.value.length;
		}

		return seekToken.call(this, type, index);

	}

};


export { Parser };

