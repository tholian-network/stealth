
import { Element  } from '../Element.mjs';
import { Widget   } from '../Widget.mjs';
import { isString } from '../../extern/base.mjs';



const KEYMAP = [{
	'key':      'f1',
	'content':  'Visit earlier Site',
	'title':    'or use [Alt] + [Arrow Left] or use [Ctrl] + [[]'
}, {
	'key':      'f2',
	'content':  'Visit later Site',
	'title':    'or use [Alt] + [Arrow Right] or use [Ctrl] + []]'
}, {
	'key':      'f3',
	'content':  'Reload current Tab',
	'title':    'or use [Ctrl] + [R]'
}, {
	'key':      'f4',
	'content':  'Open new Tab',
	'title':    'or use [Ctrl] + [T]'
}, {
	'key':      'f5',
	'content':  'Edit current Tab URL',
	'title':    'or use [Ctrl] + [E]'
}, {
	'key':      'f6',
	'content':  'Show previous Tab',
	'title':    'or use [Ctrl] + [Page Up]'
}, {
	'key':      'f7',
	'content':  'Kill current Tab',
	'title':    'or use [Ctrl] + [W]'
}, {
	'key':      'f8',
	'content':  'Show next Tab',
	'title':    'or use [Ctrl] + [Page Down]'
}, {
	'key':      'f9',
	'content':  'Toggle through Site Modes',
	'title':    null
}, {
	'key':      'f10',
	'content':  'Toggle Site Settings',
	'title':    null
}, {
	'key':      'f11',
	'content':  'Toggle Session Settings',
	'title':    null
}, {
	'key':      'f12',
	'content':  'Open Browser Settings',
	'title':    null
}];

const select = function(key) {

	key = isString(key) ? key : null;


	if (key !== null) {

		let button = this.header.query('button[data-key="' + key + '"]');
		if (button !== null) {

			if (button.state() !== 'disabled') {
				button.state('active');
			}

		}

		let row = this.article.query('tr[data-key="' + key + '"]');
		if (row !== null) {
			row.state('active');
		}

	} else {

		Object.values(this.buttons).forEach((button) => {
			button.state('');
		});

		this.article.query('tr[data-key]', true).forEach((row) => {
			row.state('');
		});

	}

};

const update = function() {

	this.article.area({ x: null });

	if (this.__state.mobile === true) {

		this.buttons['f1'].state('disabled');
		this.buttons['f2'].state('disabled');
		this.buttons['f3'].state('disabled');
		this.buttons['f4'].state('disabled');

		let address = Widget.query('browser-appbar-address');
		if (address !== null) {

			this.buttons['f5'].state('enabled');
			this.buttons['f5'].area(address.input.area());

		} else {

			this.buttons['f5'].state('disabled');

		}

		this.buttons['f6'].state('disabled');
		this.buttons['f7'].state('disabled');
		this.buttons['f8'].state('disabled');
		this.buttons['f9'].state('disabled');
		this.buttons['f10'].state('disabled');
		this.buttons['f11'].state('disabled');
		this.buttons['f12'].state('disabled');

	} else {

		let history = Widget.query('browser-appbar-history');
		if (history !== null) {

			this.buttons['f1'].state('enabled');
			this.buttons['f2'].state('enabled');
			this.buttons['f3'].state('enabled');
			this.buttons['f4'].state('enabled');

			this.buttons['f1'].area(history.buttons.back.area());
			this.buttons['f2'].area(history.buttons.next.area());
			this.buttons['f3'].area(history.buttons.reload.area());
			this.buttons['f4'].area(history.buttons.open.area());

		} else {

			this.buttons['f1'].state('disabled');
			this.buttons['f2'].state('disabled');
			this.buttons['f3'].state('disabled');
			this.buttons['f4'].state('disabled');

		}

		let address = Widget.query('browser-appbar-address');
		if (address !== null) {

			this.buttons['f5'].state('enabled');
			this.buttons['f5'].area(address.input.area());

		} else {

			this.buttons['f5'].state('disabled');

		}

		let tabs = Widget.query('browser-backdrop-tabs');
		if (tabs !== null) {

			if (tabs.state() === 'active') {

				if (tabs.prev !== null) {
					this.buttons['f6'].state('enabled');
					this.buttons['f6'].area(tabs.prev.area());
				} else {
					this.buttons['f6'].state('disabled');
				}

				if (tabs.curr !== null) {
					this.buttons['f7'].state('enabled');
					this.buttons['f7'].area(tabs.curr.area());
				} else {
					this.buttons['f7'].state('disabled');
				}

				if (tabs.next !== null) {
					this.buttons['f8'].state('enabled');
					this.buttons['f8'].area(tabs.next.area());
				} else {
					this.buttons['f8'].state('disabled');
				}

			} else {

				this.buttons['f6'].state('disabled');
				this.buttons['f7'].state('disabled');
				this.buttons['f8'].state('disabled');

			}

		} else {

			this.buttons['f6'].state('disabled');
			this.buttons['f7'].state('disabled');
			this.buttons['f8'].state('disabled');

		}

		let mode = Widget.query('browser-appbar-mode');
		if (mode !== null) {

			this.buttons['f9'].state('enabled');
			this.buttons['f9'].area(mode.element.area());

		} else {

			this.buttons['f9'].state('disabled');

		}

		let settings = Widget.query('browser-appbar-settings');
		if (settings !== null) {

			this.buttons['f10'].state('enabled');
			this.buttons['f11'].state('enabled');
			this.buttons['f12'].state('enabled');

			this.buttons['f10'].area(settings.buttons.site.area());
			this.buttons['f11'].area(settings.buttons.session.area());
			this.buttons['f12'].area(settings.buttons.browser.area());

		} else {

			this.buttons['f10'].state('disabled');
			this.buttons['f11'].state('disabled');
			this.buttons['f12'].state('disabled');

		}

	}

};



const Help = function(/* browser */) {

	this.buttons = {};
	this.header  = new Element('browser-menu-help-header', KEYMAP.map((entry) => {

		let button = new Element('button', entry['key'].toUpperCase());

		button.attr('data-key', entry['key']);

		if (entry['title'] !== null) {
			button.attr('title', entry['title']);
		}

		this.buttons[entry['key']] = button;

		return button;

	}));

	this.article = new Element('browser-menu-help-article', [
		'<h3>Keyboard Shortcuts</h3>',
		'<p>Keyboard Shortcuts are mapped in the graphical order in which the Widgets appear on the App Bar, from left to right, with exceptions to the shortcuts for Tab interaction.</p>',
		'<p>Convenience shortcuts from other Browsers are also integrated, for people with a too strong muscle memory.</p>',
		'<table>',
		'<thead>',
		'<tr><th>Key</th><th>Behaviour</th></tr>',
		'</thead>',
		'<tbody>',
		'<tr data-key="escape"><td><code>[Esc]</code></td><td>Quit Help</td></tr>',
		...KEYMAP.map((entry) => {
			return [
				'<tr data-key="' + entry['key'] + '">',
				'<td' + (entry['title'] !== null ? ' title="' + entry['title'] + '"' : '') + '><code>[' + entry['key'].toUpperCase() + ']</code></td>',
				'<td>' + entry['content'] + '</td>',
				'</tr>'
			].join('');
		}),
		'</tbody>',
		'</table>'
	]);

	this.element = new Element('browser-menu-help', [
		this.header,
		this.article
	]);

	this.__state = {
		escapes: 0
	};


	this.header.query('button[data-key]', true).forEach((button) => {

		button.on('click', (e) => {

			select.call(this, null);
			select.call(this, button.attr('data-key'));

			e.preventDefault();
			e.stopPropagation();

		});

		button.on('mouseover', (e) => {

			select.call(this, null);
			select.call(this, button.attr('data-key'));

			e.preventDefault();
			e.stopPropagation();

		});

	});

	this.article.query('tr[data-key]', true).forEach((row) => {

		row.on('click', (e) => {

			select.call(this, null);
			select.call(this, row.attr('data-key'));

			e.preventDefault();
			e.stopPropagation();

		});

		row.on('mouseover', (e) => {

			select.call(this, null);
			select.call(this, row.attr('data-key'));

			e.preventDefault();
			e.stopPropagation();

		});

	});

	this.header.on('click', (e) => {

		let target = Element.toElement(e.target);
		if (target === this.header) {
			select.call(this, null);
			this.element.emit('hide');
		}

	});

	this.element.on('hide', () => {

		this.article.area({ x: null });
		this.element.state('');

	});

	this.element.on('key', (key) => {

		if (this.state() === 'active') {

			this.__state.escapes = 0;

			if (key.name === 'escape') {

				this.element.emit('hide');

			} else {

				select.call(this, null);
				select.call(this, key.name);

			}

		} else {

			if (key.name === 'escape') {
				this.__state.escapes++;
			}

			if (this.__state.escapes >= 3) {
				this.element.emit('show');
				this.__state.escapes = 0;
			}

		}

	});

	this.element.on('resize', (width /*, height */) => {

		if (width < 640) {
			this.__state.mobile = true;
		} else {
			this.__state.mobile = false;
		}

		update.call(this);

	});

	this.element.on('show', () => {

		this.element.state('active');

		setTimeout(() => {
			update.call(this);
		}, 0);

	});


	setTimeout(() => {
		update.call(this);
	}, 0);

	Widget.call(this);

};


Help.prototype = Object.assign({}, Widget.prototype);


export { Help };

