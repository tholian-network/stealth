
export const STYLES = {
	'align-content': {
		'val': [
			'normal', 'baseline',
			'start', 'center', 'end',
			'flex-start', 'flex-end',
			'space-around', 'space-between', 'space-evenly',
			'stretch', 'safe', 'unsafe'
		]
	},
	'align-items': {
		'val': [
			'normal', 'baseline',
			'start', 'center', 'end',
			'flex-start', 'flex-end',
			'self-start', 'self-end',
			'space-around', 'space-between', 'space-evenly',
			'stretch', 'safe', 'unsafe'
		]
	},
	'align-self': {
		'val': [
			'auto', 'normal', 'baseline',
			'center',
			'flex-start', 'flex-end',
			'self-start', 'self-end',
			'stretch', 'safe', 'unsafe'
		]
	},
	'animation-delay': {
		'typ': [ 'time' ]
	},
	'animation-direction': {
		'val': [ 'alternate', 'alternate-reverse', 'normal', 'reverse' ]
	},
	'animation-duration': {
		'typ': [ 'time' ]
	},
	'animation-fill-mode': {
		'val': [ 'backwards', 'both', 'forwards', 'none' ]
	},
	'animation-iteration-count': {
		'val': [ 'infinite' ],
		'typ': [ 'number' ]
	},
	'animation-name': {
		'typ': [ 'other', 'string' ]
	},
	'animation-timing-function': {
		'val': [
			'ease', 'ease-in', 'ease-out', 'ease-in-out',
			'linear', 'step-start', 'step-end'
		]
	},
	'animation-play-state': {
		'val': [ 'paused', 'running' ]
	},
	'backface-visibility': {
		'val': [ 'hidden', 'visible' ]
	},
	'background-attachment': {
		'val': [ 'scroll', 'fixed', 'local' ]
	},
	'background-clip': {
		'val': [ 'border-box', 'content-box', 'padding-box' ]
	},
	'background-color': {
		'typ': [ 'color' ]
	},
	'background-image': {
		'typ': [ 'url', 'gradient' ]
	},
	'background-origin': {
		'val': [ 'border-box', 'content-box', 'padding-box' ]
	},
	'background-position': {
		'val': [ 'top', 'right', 'bottom', 'left', 'center' ],
		'typ': [ 'length', 'percentage' ]
	},
	'background-repeat': {
		'val': [ 'no-repeat', 'repeat', 'repeat-x', 'repeat-y', 'round', 'space' ]
	},
	'background-size': {
		'val': [ 'contain', 'cover', 'auto' ],
		'typ': [ 'length', 'percentage' ]
	},
	'block-size': {
		'val': [ 'auto', 'available', 'border-box', 'content-box', 'fill', 'min-content', 'fit-content', 'max-content' ],
		'typ': [ 'length', 'percentage' ]
	},
	'border-collapse': {
		'val': [ 'collapse', 'separate' ]
	},
	'border-color': {
		'typ': [ 'color' ]
	},
	'border-radius': {
		'typ': [ 'length', 'percentage' ]
	},
	'border-spacing': {
		'typ': [ 'length' ]
	},
	'border-style': {
		'val': [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ]
	},
	'border-width': {
		'val': [ 'thin', 'medium', 'thick' ],
		'typ': [ 'length' ]
	},
	'bottom': {
		'val': [ 'auto' ],
		'typ': [ 'length', 'percentage' ]
	},
	'box-sizing': {
		'val': [ 'border-box', 'content-box' ]
	},
	'break-after': {
		'val': [
			'all', 'always', 'auto',
			'avoid', 'avoid-column', 'avoid-page', 'avoid-region',
			'column', 'page', 'region',
			'left', 'right', 'recto', 'verso'
		]
	},
	'break-before': {
		'val': [
			'all', 'always', 'auto',
			'avoid', 'avoid-column', 'avoid-page', 'avoid-region',
			'column', 'page', 'region',
			'left', 'right', 'recto', 'verso'
		]
	},
	'break-inside': {
		'val': [ 'auto', 'avoid', 'avoid-column', 'avoid-page', 'avoid-region' ]
	},
	'color': {
		'typ': [ 'color' ]
	},
	'column-count': {
		'val': [ 'auto' ],
		'typ': [ 'number' ]
	},
	'column-fill': {
		'val': [ 'auto', 'balance', 'balance-all' ]
	},
	'column-gap': {
		'val': [ 'normal' ],
		'typ': [ 'length', 'percentage' ]
	},
	'column-span': {
		'val': [ 'all', 'none' ]
	},
	'column-width': {
		'val': [ 'auto' ],
		'typ': [ 'length' ]
	},
	'flex-basis': {
		'val': [ 'auto', 'content', 'fit-content', 'max-content', 'min-content' ],
		'typ': [ 'length', 'percentage' ]
	},
	'flex-direction': {
		'val': [ 'column', 'column-reverse', 'row', 'row-reverse' ]
	},
	'flex-grow': {
		'typ': [ 'number' ]
	},
	'flex-shrink': {
		'typ': [ 'number' ]
	},
	'flex-wrap': {
		'val': [ 'nowrap', 'wrap', 'wrap-reverse' ]
	},
	'font-family': {
		'val': [ 'cursive', 'emoji', 'fangsong', 'fantasy', 'math', 'monospace', 'sans-serif', 'serif', 'system-ui' ],
		'typ': [ 'string' ]
	},
	'font-size': {
		'val': [
			'xx-small', 'x-small', 'small',
			'smaller', 'medium', 'larger',
			'large', 'x-large', 'xx-large',
		],
		'typ': [ 'length', 'percentage' ]
	},
	'font-size-adjust': {
		'val': [ 'none' ],
		'typ': [ 'number' ]
	},
	'font-stretch': {
		'val': [
			'normal',
			'semi-condensed', 'condensed', 'extra-condensed', 'ultra-condensed',
			'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded'
		],
		'typ': [ 'percentage' ]
	},
	'font-style': {
		'val': [ 'italic', 'normal', 'oblique' ]
	},
	'font-weight': {
		'val': [ 'normal', 'bold', 'bolder', 'lighter' ],
		'typ': [ 'number' ]
	},
	'height': {
		'val': [ 'auto', 'available', 'border-box', 'content-box', 'fill', 'min-content', 'fit-content', 'max-content' ],
		'typ': [ 'length', 'percentage' ]
	},
	'justify-content': {
		'val': [
			'normal', 'baseline', 'left', 'right',
			'start', 'center', 'end',
			'flex-start', 'flex-end',
			'space-around', 'space-between', 'space-evenly',
			'stretch', 'safe', 'unsafe'
		]
	},
	'justify-items': {
		'val': [
			'auto', 'normal', 'baseline', 'left', 'right',
			'start', 'center', 'end',
			'flex-start', 'flex-end',
			'self-start', 'self-end',
			'space-around', 'space-between', 'space-evenly',
			'stretch', 'safe', 'unsafe'
		]
	},
	'justify-self': {
		'val': [
			'auto', 'normal', 'baseline', 'left', 'right',
			'start', 'center', 'end',
			'flex-start', 'flex-end',
			'self-start', 'self-end',
			'space-around', 'space-between', 'space-evenly',
			'stretch', 'safe', 'unsafe'
		]
	},
	'left': {
		'val': [ 'auto' ],
		'typ': [ 'length', 'percentage' ]
	},
	'letter-spacing': {
		'val': [ 'normal' ],
		'typ': [ 'length' ]
	},
	'line-height': {
		'val': [ 'normal' ],
		'typ': [ 'number', 'length', 'percentage' ]
	},
	'list-style-image': {
		'typ': [ 'url', 'gradient' ]
	},
	'list-style-position': {
		'val': [ 'inside', 'outside' ]
	},
	'list-style-type': {
		'val': [
			'circle', 'decimal', 'decimal-leading-zero', 'disc', 'square',
			'lower-alpha', 'lower-greek', 'lower-latin', 'lower-roman',
			'upper-alpha', 'upper-greek', 'upper-latin', 'upper-roman'
		]
	},
	'margin': {
		'val': [ 'auto' ],
		'typ': [ 'length', 'percentage' ]
	},
	'max-height': {
		'val': [ 'auto', 'min-content', 'fit-content', 'max-content', 'fill-available' ],
		'typ': [ 'length', 'percentage' ]
	},
	'max-width': {
		'val': [ 'auto', 'min-content', 'fit-content', 'max-content', 'fill-available' ],
		'typ': [ 'length', 'percentage' ]
	},
	'min-height': {
		'val': [ 'auto', 'min-content', 'fit-content', 'max-content', 'fill-available' ],
		'typ': [ 'length', 'percentage' ]
	},
	'min-width': {
		'val': [ 'auto', 'min-content', 'fit-content', 'max-content', 'fill-available' ],
		'typ': [ 'length', 'percentage' ]
	},
	'opacity': {
		'typ': [ 'number' ]
	},
	'order': {
		'typ': [ 'number' ]
	},
	'outline-color': {
		'typ': [ 'color' ]
	},
	'outline-offset': {
		'typ': [ 'length' ]
	},
	'outline-style': {
		'val': [ 'auto', 'none', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ]
	},
	'outline-width': {
		'val': [ 'thin', 'medium', 'thick' ],
		'typ': [ 'length' ]
	},
	'overflow': {
		'val': [ 'auto', 'clip', 'hidden', 'scroll', 'visible' ]
	},
	'padding': {
		'typ': [ 'length', 'percentage' ]
	},
	'right': {
		'val': [ 'auto' ],
		'typ': [ 'length', 'percentage' ]
	},
	'tab-size': {
		'typ': [ 'length', 'number' ]
	},
	'text-decoration-color': {
		'typ': [ 'color' ]
	},
	'text-decoration-line': {
		'val': [ 'line-through', 'none', 'overline', 'underline' ]
	},
	'text-decoration-style': {
		'val': [ 'dashed', 'dotted', 'double', 'solid', 'wavy' ]
	},
	'text-emphasis-color': {
		'typ': [ 'color' ]
	},
	'text-emphasis-style': {
		'val': [ 'circle', 'dot', 'double-circle', 'filled', 'none', 'open', 'sesame', 'triangle' ],
		'typ': [ 'string' ]
	},
	'text-indent': {
		'typ': [ 'length', 'percentage' ]
	},
	'top': {
		'val': [ 'auto' ],
		'typ': [ 'length', 'percentage' ]
	},
	'transition-delay': {
		'typ': [ 'time' ]
	},
	'transition-duration': {
		'typ': [ 'time' ]
	},
	'transition-timing-function': {
		'val': [
			'ease', 'ease-in', 'ease-out', 'ease-in-out',
			'linear', 'step-start', 'step-end'
		]
	},
	'transition-property': {
		'val': [
			'all', 'none',
			'background', 'background-color', 'background-position', 'background-size',
			'border', 'border-color', 'border-radius', 'border-width',
			'border-top', 'border-top-color', 'border-top-left-radius', 'border-top-right-radius', 'border-top-width',
			'border-right', 'border-right-color', 'border-right-width',
			'border-bottom', 'border-bottom-color', 'border-bottom-left-radius', 'border-bottom-right-radius', 'border-bottom-width',
			'border-left', 'border-left-color', 'border-left-width',
			'top', 'right', 'bottom', 'left',
			'color', 'width', 'height',
			'column-count', 'column-gap', 'column-rule', 'column-rule-color', 'column-rule-width', 'column-width', 'columns',
			'flex', 'flex-basis', 'flex-grow', 'flex-shrink',
			'font', 'font-size', 'font-size-adjust', 'font-stretch', 'font-weight',
			'letter-spacing', 'line-height',
			'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
			'min-width', 'max-width', 'min-height', 'max-height',
			'opacity', 'order',
			'outline', 'outline-color', 'outline-offset', 'outline-width',
			'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
			'tab-size',
			'text-decoration', 'text-decoration-color',
			'text-emphasis', 'text-emphasis-color', 'text-indent',
			'visibility',
			'word-spacing',
			'z-index',
			'zoom'
		]
	},
	'visibility': {
		'val': [ 'collapse', 'hidden', 'visible' ]
	},
	'width': {
		'val': [ 'auto', 'available', 'border-box', 'content-box', 'fill', 'min-content', 'fit-content', 'max-content' ],
		'typ': [ 'length', 'percentage' ]
	},
	'word-spacing': {
		'val': [ 'normal' ],
		'typ': [ 'length', 'percentage' ]
	},
	'z-index': {
		'val': [ 'auto' ],
		'typ': [ 'number' ]
	},
	'zoom': {
		'val': [ 'normal', 'reset' ],
		'typ': [ 'number', 'percentage' ]
	}
};



export default { STYLES };

