
import { describe, finish } from '../../covert/index.mjs';
import { Request          } from '../../stealth/source/Request.mjs';
import { Tab, isTab       } from '../../stealth/source/Tab.mjs';
import { URL              } from '../../stealth/source/parser/URL.mjs';



describe('new Tab()', function(assert) {

	let tab1 = new Tab({
		url: 'https://example.com/index.html'
	});

	let tab2 = new Tab({
		config: {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		},
		url: 'https://example.com/second.html'
	});

	let tab3 = new Tab({
		config: {
			domain: 'example.com',
			mode: {
				text:  true,
				image: true,
				audio: false,
				video: false,
				other: false
			}
		},
		ref: URL.parse('https://example.com/third.html')
	});

	let tab4 = new Tab({
		config: {
			domain: null,
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: false,
				other: false
			}
		},
		ref: URL.parse('https://example.com/fourth.html')
	});

	assert(tab1.url,    'https://example.com/index.html');
	assert(tab1.config, {
		domain: 'example.com',
		mode: {
			text:  false,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	});

	assert(tab1.history.length,    1);
	assert(tab1.history[0].url,    'https://example.com/index.html');
	assert(tab1.history[0].config, {
		domain: 'example.com',
		mode: {
			text:  false,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	});

	assert(Tab.isTab(tab1), true);
	assert(isTab(tab1),     true);

	assert(tab2.url,    'https://example.com/second.html');
	assert(tab2.config, {
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	});

	assert(tab2.history.length,    1);
	assert(tab2.history[0].url,    'https://example.com/second.html');
	assert(tab2.history[0].config, {
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	});

	assert(Tab.isTab(tab2), true);
	assert(isTab(tab2),     true);

	assert(tab3.url,    'https://example.com/third.html');
	assert(tab3.config, {
		domain: 'example.com',
		mode: {
			text:  true,
			image: true,
			audio: false,
			video: false,
			other: false
		}
	});

	assert(tab3.history.length,    1);
	assert(tab3.history[0].url,    'https://example.com/third.html');
	assert(tab3.history[0].config, {
		domain: 'example.com',
		mode: {
			text:  true,
			image: true,
			audio: false,
			video: false,
			other: false
		}
	});

	assert(Tab.isTab(tab3), true);
	assert(isTab(tab3),     true);

	assert(tab4.url,    'https://example.com/fourth.html');
	assert(tab4.config, {
		domain: 'example.com',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: false,
			other: false
		}
	});

	assert(tab4.history.length,    1);
	assert(tab4.history[0].url,    'https://example.com/fourth.html');
	assert(tab4.history[0].config, {
		domain: 'example.com',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: false,
			other: false
		}
	});

	assert(Tab.isTab(tab4), true);
	assert(isTab(tab4),     true);

});

describe('Tab.from()', function(assert) {

	let tab = Tab.from({
		type: 'Tab',
		data: {
			id: '1337',
			history: [{
				config: {
					domain: 'example.com',
					mode: {
						text:  true,
						image: false,
						audio: false,
						video: false,
						other: true
					}
				},
				time: Date.now(),
				url: 'https://example.com/index.html'
			}]
		}
	});

	assert(tab.id,     '1337');
	assert(tab.url,    'stealth:welcome');
	assert(tab.config, {
		domain: 'welcome',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: true,
			other: true
		}
	});

	assert(tab.history.length,    1);
	assert(tab.history[0].url,    'https://example.com/index.html');
	assert(tab.history[0].config, {
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: true
		}
	});

	assert(Tab.isTab(tab), true);
	assert(isTab(tab),     true);

});

describe('Tab.isTab()', function(assert) {

	let tab = new Tab({ url: 'https://example.com/index.html' });

	assert(typeof Tab.isTab, 'function');

	assert(Tab.isTab(tab), true);

});

describe('isTab()', function(assert) {

	let tab = new Tab({ url: 'https://example.com/index.html' });

	assert(typeof isTab, 'function');

	assert(isTab(tab), true);

});

describe('Tab.merge()', function(assert) {

	let tab1 = new Tab();
	let tab2 = Tab.from({
		type: 'Tab',
		data: {
			id: '1337',
			history: [{
				config: {
					domain: 'example.com',
					mode: {
						text:  true,
						image: false,
						audio: false,
						video: false,
						other: true
					}
				},
				time: Date.now(),
				url: 'https://example.com/index.html'
			}]
		}
	});

	Tab.merge(tab1, tab2);

	assert(tab1.id,     '1337');
	assert(tab1.url,    'stealth:welcome');
	assert(tab1.config, {
		domain: 'welcome',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: true,
			other: true
		}
	});

	assert(tab1.history.length,    1);
	assert(tab1.history[0].url,    'https://example.com/index.html');
	assert(tab1.history[0].config, {
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: true
		}
	});

	assert(Tab.isTab(tab1), true);
	assert(isTab(tab1),     true);

});

describe('Tab.prototype.back()', function(assert) {

	let tab = new Tab({
		id: '1337',
		url: 'https://example.com/index.html',
		config: {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: true
			}
		}
	});

	assert(tab.navigate('https://two.example.com/'),   true);
	assert(tab.navigate('https://three.example.com/'), true);

	assert(tab.back(), true);
	assert(tab.url,    'https://two.example.com/');
	assert(tab.config, {
		domain: 'two.example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: true
		}
	});

	assert(tab.back(), true);
	assert(tab.url,    'https://example.com/index.html');
	assert(tab.config, {
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: true
		}
	});

	assert(tab.back(), false);
	assert(tab.url,    'https://example.com/index.html');
	assert(tab.config, {
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: true
		}
	});

});

describe('Tab.prototype.can()', function(assert) {

	let tab = new Tab({
		id: '1337',
		url: 'https://example.com/index.html',
		config: {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: true
			}
		}
	});

	assert(tab.can('back'),  false);
	assert(tab.can('next'),  false);
	assert(tab.can('pause'), false);

	assert(tab.navigate('https://two.example.com/'), true);
	assert(tab.can('back'),  true);
	assert(tab.can('next'),  false);
	assert(tab.can('pause'), false);

	assert(tab.navigate('https://three.example.com/'), true);
	assert(tab.can('back'),  true);
	assert(tab.can('next'),  false);
	assert(tab.can('pause'), false);

	assert(tab.back(),       true);
	assert(tab.can('back'),  true);
	assert(tab.can('next'),  true);
	assert(tab.can('pause'), false);

	assert(tab.back(),       true);
	assert(tab.can('back'),  false);
	assert(tab.can('next'),  true);
	assert(tab.can('pause'), false);

	assert(tab.back(),       false);
	assert(tab.can('back'),  false);
	assert(tab.can('next'),  true);
	assert(tab.can('pause'), false);

	let request = new Request({
		blockers: [],
		config:   {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		},
		url: 'https://example.com/not-yet-downloaded.html'
	});

	assert(tab.track(request),   true);
	assert(request.start(),      true);
	assert(tab.can('back'),      false);
	assert(tab.can('next'),      true);
	assert(tab.can('pause'),     true);
	assert(request.stop(),       true);
	assert(tab.untrack(request), true);

});

describe('Tab.prototype.destroy()', function(assert) {

	let tab = new Tab({
		id: '1337',
		url: 'https://example.com/index.html',
		config: {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: true
			}
		}
	});

	assert(tab.url,            'https://example.com/index.html');
	assert(tab.history.length, 1);
	assert(tab.history[0].url, 'https://example.com/index.html');

	assert(tab.navigate('https://example.com/second.html'), true);
	assert(tab.navigate('https://example.com/third.html'),  true);

	assert(tab.url,            'https://example.com/third.html');
	assert(tab.history.length, 3);
	assert(tab.history[0].url, 'https://example.com/index.html');
	assert(tab.history[1].url, 'https://example.com/second.html');
	assert(tab.history[2].url, 'https://example.com/third.html');

	tab.destroy();

	assert(tab.url,    'stealth:welcome');
	assert(tab.config, {
		domain: 'welcome',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: true,
			other: true
		}
	});
	assert(tab.history.length, 1);
	assert(tab.history[0].url, 'stealth:welcome');

});

describe('Tab.prototype.includes()', function(assert) {

	let tab     = new Tab({ url: 'https://example.com' });
	let request = new Request({
		blockers: [],
		config:   {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		},
		url: 'https://example.com/not-yet-downloaded.html'
	});

	assert(tab.includes(request), false);
	assert(tab.track(request),    true);
	assert(tab.includes(request), true);
	assert(tab.untrack(request),  true);
	assert(tab.includes(request), false);

});

describe('Tab.prototype.navigate()', function(assert, console) {

	let tab1 = new Tab({
		id: '1337',
		url: 'https://example.com/index.html',
		config: {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: true
			}
		}
	});
	let tab2 = new Tab();

	assert(tab1.navigate('https://two.example.com/second.html'), true);
	assert(tab1.url,    'https://two.example.com/second.html');
	assert(tab1.config, {
		domain: 'two.example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: true
		}
	});

	assert(tab1.navigate('https://three.example.com/third.html', null), true);
	assert(tab1.url,    'https://three.example.com/third.html');
	assert(tab1.config, {
		domain: 'three.example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: true
		}
	});

	assert(tab2.navigate('stealth:settings', null), true);
	assert(tab2.url,    'stealth:settings');
	assert(tab2.config, {
		domain: 'settings',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: true,
			other: true
		}
	});

	assert(tab2.navigate('stealth:welcome', null), true);
	assert(tab2.url,    'stealth:welcome');
	assert(tab2.config, {
		domain: 'welcome',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: true,
			other: true
		}
	});

	assert(tab2.navigate('http://1.3.3.7/index.html', null), true);
	assert(tab2.url,    'http://1.3.3.7/index.html');
	assert(tab2.config, {
		domain: '1.3.3.7',
		mode: {
			text:  false,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	});

});


export default finish('stealth/Tab', {
	internet: true
});

