
import { describe, finish } from '../../covert/index.mjs';
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

	assert(tab1.config.domain,     'example.com');
	assert(tab1.config.mode.text,  false);
	assert(tab1.config.mode.image, false);
	assert(tab1.config.mode.audio, false);
	assert(tab1.config.mode.video, false);
	assert(tab1.config.mode.other, false);
	assert(tab1.url,               'https://example.com/index.html');

	assert(tab1.history.length,               1);
	assert(tab1.history[0].url,               'https://example.com/index.html');
	assert(tab1.history[0].config.mode.text,  false);
	assert(tab1.history[0].config.mode.image, false);
	assert(tab1.history[0].config.mode.audio, false);
	assert(tab1.history[0].config.mode.video, false);
	assert(tab1.history[0].config.mode.other, false);

	assert(Tab.isTab(tab1), true);
	assert(isTab(tab1),     true);

	assert(tab2.config.domain,     'example.com');
	assert(tab2.config.mode.text,  true);
	assert(tab2.config.mode.image, false);
	assert(tab2.config.mode.audio, false);
	assert(tab2.config.mode.video, false);
	assert(tab2.config.mode.other, false);
	assert(tab2.url,               'https://example.com/second.html');

	assert(tab2.history.length,               1);
	assert(tab2.history[0].url,               'https://example.com/second.html');
	assert(tab2.history[0].config.mode.text,  true);
	assert(tab2.history[0].config.mode.image, false);
	assert(tab2.history[0].config.mode.audio, false);
	assert(tab2.history[0].config.mode.video, false);
	assert(tab2.history[0].config.mode.other, false);

	assert(Tab.isTab(tab2), true);
	assert(isTab(tab2),     true);

	assert(tab3.config.domain,     'example.com');
	assert(tab3.config.mode.text,  true);
	assert(tab3.config.mode.image, true);
	assert(tab3.config.mode.audio, false);
	assert(tab3.config.mode.video, false);
	assert(tab3.config.mode.other, false);
	assert(tab3.url,               'https://example.com/third.html');

	assert(tab3.history.length,               1);
	assert(tab3.history[0].url,               'https://example.com/third.html');
	assert(tab3.history[0].config.mode.text,  true);
	assert(tab3.history[0].config.mode.image, true);
	assert(tab3.history[0].config.mode.audio, false);
	assert(tab3.history[0].config.mode.video, false);
	assert(tab3.history[0].config.mode.other, false);

	assert(Tab.isTab(tab3), true);
	assert(isTab(tab3),     true);

	assert(tab4.config.domain,     'example.com');
	assert(tab4.config.mode.text,  true);
	assert(tab4.config.mode.image, true);
	assert(tab4.config.mode.audio, true);
	assert(tab4.config.mode.video, false);
	assert(tab4.config.mode.other, false);
	assert(tab4.url,               'https://example.com/fourth.html');

	assert(tab4.history.length,               1);
	assert(tab4.history[0].url,               'https://example.com/fourth.html');
	assert(tab4.history[0].config.mode.text,  true);
	assert(tab4.history[0].config.mode.image, true);
	assert(tab4.history[0].config.mode.audio, true);
	assert(tab4.history[0].config.mode.video, false);
	assert(tab4.history[0].config.mode.other, false);

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

	assert(tab.config.domain,     'welcome');
	assert(tab.config.mode.text,  false);
	assert(tab.config.mode.image, false);
	assert(tab.config.mode.audio, false);
	assert(tab.config.mode.video, false);
	assert(tab.config.mode.other, false);
	assert(tab.id,                '1337');
	assert(tab.url,               'stealth:welcome');

	assert(tab.history.length,               1);
	assert(tab.history[0].url,               'https://example.com/index.html');
	assert(tab.history[0].config.mode.text,  true);
	assert(tab.history[0].config.mode.image, false);
	assert(tab.history[0].config.mode.audio, false);
	assert(tab.history[0].config.mode.video, false);
	assert(tab.history[0].config.mode.other, true);

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

	assert(tab1.config.domain,     'welcome');
	assert(tab1.config.mode.text,  false);
	assert(tab1.config.mode.image, false);
	assert(tab1.config.mode.audio, false);
	assert(tab1.config.mode.video, false);
	assert(tab1.config.mode.other, false);
	assert(tab1.id,                '1337');
	assert(tab1.url,               'stealth:welcome');

	assert(tab1.history.length,               1);
	assert(tab1.history[0].url,               'https://example.com/index.html');
	assert(tab1.history[0].config.mode.text,  true);
	assert(tab1.history[0].config.mode.image, false);
	assert(tab1.history[0].config.mode.audio, false);
	assert(tab1.history[0].config.mode.video, false);
	assert(tab1.history[0].config.mode.other, true);

	assert(Tab.isTab(tab1), true);
	assert(isTab(tab1),     true);

});

describe('Tab.prototype.destroy()', function(assert) {

	let tab = new Tab({
		id: '1337',
		url: 'https://example.com/second.html',
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
	});

	assert(tab.config.domain,     'example.com');
	assert(tab.config.mode.text,  true);
	assert(tab.config.mode.image, false);
	assert(tab.config.mode.audio, false);
	assert(tab.config.mode.video, false);
	assert(tab.config.mode.other, true);
	assert(tab.url,               'https://example.com/second.html');
	assert(tab.history.length,    1);

	tab.destroy();

	assert(tab.config.domain,     'welcome');
	assert(tab.config.mode.text,  true);
	assert(tab.config.mode.image, true);
	assert(tab.config.mode.audio, true);
	assert(tab.config.mode.video, true);
	assert(tab.config.mode.other, true);
	assert(tab.url,               'stealth:welcome');
	assert(tab.history.length,    0);

});


export default finish('stealth/Tab');

