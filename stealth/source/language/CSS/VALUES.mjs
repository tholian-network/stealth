
// TODO: Support initial, inherit, unset, none


const SHORTHANDS = {

	'background': function(tokens) {

		let declaration = {
			'background-color': 'none',
			'background-image': 'none',
			'background-position': 'none',
			// etc.
		};

		declaration['background-color'] = this.next('background-color', tokens);

		if (this.is('background-color', tokens)) {
			// XXX: How to do tokens.slice() correctly?
			// Do this in VALUES.parse() method???
		}

		// TODO: background-color
		// TODO: background-image
		// TODO: background-position
		// TODO: background-repeat
		// TODO: background-attachment
		// TODO: background-clip
		// TODO: background-origin
		// TODO: (optional) background-color

		console.log('background', tokens);

	}

};

const PROPERTIES = {

	'background-attachment': (tokens) => {
	},

	'background-color': (tokens) => {
		return PROPERTIES['color'](tokens);
	}

};


const SYNTAX = [{
	type: 'background-color',
	tokens: [{
		type: 'hash'
	}],
	value: 0
}, {
	type: 'background-color',
	tokens: [{
		type: 'ident',
		value: 'rgba'
	}, {
		type: '('
	}, {
		type: 'number'
	}, {
		type: ','
	}, {
		type: 'number'
	}, {
		type: ','
	}, {
		type: 'number'
	}, {
		type: ')'
	}],
	value: [ 2, 4, 6 ]
},

	// XXX: Continue here. This needs to be implemented in a helper function


	// { type: 'background-attachment', tokens: [ { type: 'ident', pattern: new RegExp('^(scroll|fixed|local)$') } ] },
	// { type: 'background-position',   tokens: [ { type: 'ident', pattern: new RegExp('^(left|center|right|top|bottom)$') } ] },
	// { type: 'background-position',   tokens: [ { type: 'number' }, { type: 'percentage' } ] },

	// TODO: rgb() color
	// TODO: rgba() color
	// TODO: hsla() color

];

const match = (syntax, tokens) => {

	// TODO: Return match of syntax array to tokens
	// If tokens[0].type === ... etc comparison
	// Compare tokens in a loop, longest match is returned

	return {
		match:  'color',
		value:  {},
		length: 2
	};

};

const toMatches = (tokens, syntax) => {

	let matches = [];

	syntax.filter((combinator) => {
		return combinator.length < tokens.length;
	}).forEach((combinator) => {

		let valid = true;

		for (let t = 0, tl = combinator.tokens.length; t < tl; t++) {

			let pattern = combinator.tokens[t];

			let type  = combinator.tokens[t].type  || null;
			let value = combinator.tokens[t].value || null;

			if (
				(tokens[t].type === type || type === null)
				&& (tokens[t].value === value || value === null)
			) {
				// continue?
			} else {
				valid = false;
				break;
			}

		}

		if (valid === true) {

			let value = null;

			// TODO: Notation format for value -> array of indexes!?
			// How to convert values? is conversion necessary?

			matches.push({
				type:   combinator.type,
				value:  value,
				length: combinator.tokens.length
			});

			// TODO: Push to matches
		}


	});


	if (matches.length > 1) {

		matches.sort((a, b) => {
			if (a.length > b.length) return -1;
			if (b.length > a.length) return  1;
			return 0;
		});

	}

	return matches;

};



const VALUES = {

	next: function(types, tokens) {

		types = isArray(types) ? types : [];


		if (types.length > 0) {

			let matches = toMatches(tokens, this.syntax.filter((token) => {
				return types.includes(token.type) || token.type === null;
			}));

			if (matches.length > 0) {

				let token = matches[0];
				if (token.type !== null) {
					// TODO: splice out token length of tokens[]
					// TODO: return token
				}

			} else {
				// TODO: throw SyntaxError for Unexpected Token
			}

		} else {
		}

		SYNTAX.forEach((syntax) => {

			// TODO: Match!?

		});

	},

	parse: function(name, tokens) {

		let shorthand = SHORTHANDS[name] || null;
		let property  = PROPERTIES[name] || null;

		if (shorthand !== null) {

			return shorthand.call(VALUES, tokens);

		} else if (property !== null) {

			return property.call(VALUES, tokens);

		} else {

			console.warn('Unknown property', name);

		}

		return null;

	},

	render: function(token) {
	}

};


export { VALUES };

