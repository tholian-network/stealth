
const SYNTAX = [

	// Ignored
	{ type: null, pattern: new RegExp('^\\s+')                 }, // whitespace
	{ type: null, pattern: new RegExp('^\\/\\*[\\s\\S]*?\\*/') }, // multi-line comment
	{ type: null, pattern: new RegExp('^(<!--.*-->)')          }, // multi-line comment

	// Symbols
	{ type: '@', pattern: '@' },
	{ type: '{', pattern: '{' },
	{ type: '}', pattern: '}' },
	{ type: '(', pattern: '(' },
	{ type: ')', pattern: ')' },
	{ type: ',', pattern: ',' },
	{ type: ':', pattern: ':' },
	{ type: ';', pattern: ';' },
	{ type: '!', pattern: '!' },

	// Operators
	{ type: '=',  pattern: '='  },
	{ type: '^=', pattern: '^=' },
	{ type: '*=', pattern: '*=' },
	{ type: '$=', pattern: '$=' },
	{ type: '~=', pattern: '~=' },
	{ type: '|=', pattern: '|=' },

	// Selectors
	{ type: '[', pattern: '[' },
	{ type: ']', pattern: ']' },
	{ type: '#', pattern: '#' },
	{ type: '.', pattern: '.' },
	{ type: '>', pattern: '>' },
	{ type: '+', pattern: '+' },
	{ type: '~', pattern: '~' },

	// Keywords
	{ type: 'media-type', pattern: new RegExp('^(all|print|screen|speech)') },

	// Percentage
	{ type: 'percentage', pattern: '%' },

	// Font-Relative Lengths
	{ type: 'length', pattern: 'em'  },
	{ type: 'length', pattern: 'ex'  },
	{ type: 'length', pattern: 'cap' },
	{ type: 'length', pattern: 'ch'  },
	{ type: 'length', pattern: 'ic'  },
	{ type: 'length', pattern: 'rem' },
	{ type: 'length', pattern: 'lh'  },
	{ type: 'length', pattern: 'rlh' },

	// Viewport-Percentage Lengths
	{ type: 'length', pattern: 'vw'   },
	{ type: 'length', pattern: 'vh'   },
	{ type: 'length', pattern: 'vi'   },
	{ type: 'length', pattern: 'vb'   },
	{ type: 'length', pattern: 'vmin' },
	{ type: 'length', pattern: 'vmax' },

	// Absolute Lengths
	{ type: 'length', pattern: 'cm' },
	{ type: 'length', pattern: 'in' },
	{ type: 'length', pattern: 'mm' },
	{ type: 'length', pattern: 'Q'  },
	{ type: 'length', pattern: 'pc' },
	{ type: 'length', pattern: 'pt' },
	{ type: 'length', pattern: 'px' },

	// Angle Units
	{ type: 'angle', pattern: 'deg'  },
	{ type: 'angle', pattern: 'grad' },
	{ type: 'angle', pattern: 'rad'  },
	{ type: 'angle', pattern: 'turn' },

	// Duration Units
	{ type: 'duration', pattern: 's'  },
	{ type: 'duration', pattern: 'ms' },

	// Frequency Units
	{ type: 'frequency', pattern: 'hz'  },
	{ type: 'frequency', pattern: 'khz' },

	// Resolution Units
	{ type: 'resolution', pattern: 'dpi'  },
	{ type: 'resolution', pattern: 'dpcm' },
	{ type: 'resolution', pattern: 'dppx' },

	// Literals
	{ type: 'hash',   pattern: new RegExp('^#[0-9A-Fa-f]{3}')     },
	{ type: 'hash',   pattern: new RegExp('^#[0-9A-Fa-f]{6}')     },
	{ type: 'hash',   pattern: new RegExp('^#[0-9A-Fa-f]{8}')     },
	{ type: 'url',    pattern: new RegExp('^url\\("[^"]*"\\)')    },
	{ type: 'url',    pattern: new RegExp('^url\\(\'[^\']*\'\\)') },
	{ type: 'number', pattern: new RegExp('^[0-9]+\\.[0-9]+')     },
	{ type: 'number', pattern: new RegExp('^[0-9]+')              },
	{ type: 'string', pattern: new RegExp('^"[^"]*"')             },
	{ type: 'string', pattern: new RegExp('^\'[^\']*\'')          },
	{ type: 'ident',  pattern: new RegExp('^[A-Za-z_-]+')         },

];


export { SYNTAX };

