
import { isBuffer, isFunction, isObject                               } from '../../base/index.mjs';
import { after, before, describe, finish                              } from '../../covert/index.mjs';
import { Browser, isBrowser, isMode                                   } from '../../stealth/source/Browser.mjs';
import { Request                                                      } from '../../stealth/source/Request.mjs';
import { isTab                                                        } from '../../stealth/source/Tab.mjs';
import { URL                                                          } from '../../stealth/source/parser/URL.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../../stealth/review/Stealth.mjs';



before(connect_stealth);

export const connect = before('Browser.prototype.connect()', function(assert) {

	this.browser = new Browser({
		host: '127.0.0.1'
	});


	this.tab = null;

	this.browser.once('connect', () => {

		this.browser.setMode({
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		});

		assert(this.browser.getMode('https://example.com'), {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		});

		this.tab = this.browser.open('https://example.com');

		assert(isTab(this.tab),             true);
		assert(this.browser.show(this.tab), this.tab);
		assert(isTab(this.browser.tab),     true);

	});

	setTimeout(() => {
		this.browser.connect();
	}, 0);

});

describe('new Browser()', function(assert) {

	let browser = new Browser({
		host: '127.0.0.3'
	});

	assert(browser._settings.host,  '127.0.0.3');
	assert(browser._settings.debug, false);

	assert(Browser.isBrowser(browser), true);
	assert(isBrowser(browser),         true);

});

describe('Browser.from()', function(assert) {

	assert(isFunction(Browser.from), true);

	let browser = Browser.from({
		type: 'Browser',
		data: {
			debug: true,
			host:  '127.0.0.3'
		}
	});

	assert(browser._settings.host,  '127.0.0.3');
	assert(browser._settings.debug, true);

});

describe('Browser.isBrowser()', function(assert) {

	assert(isFunction(Browser.isBrowser), true);

	assert(Browser.isBrowser(this.browser), true);

});

describe('isBrowser()', function(assert) {

	assert(isFunction(isBrowser), true);

	assert(isBrowser(this.browser), true);

});

describe('Browser.prototype.toJSON()', function(assert) {

	let browser = Browser.from({
		type: 'Browser',
		data: {
			debug: true,
			host:  '127.0.0.3'
		}
	});

	let json = browser.toJSON();

	assert(json.type, 'Browser');
	assert(json.data, {
		client: browser.client.toJSON(),
		events: [
			'connect'
		],
		journal: [],
		settings: {
			debug: true,
			host: '127.0.0.3'
		},
		state: {
			connected: false,
			reconnect: 0
		}
	});

});

describe('Browser.isMode()', function(assert) {

	assert(isFunction(Browser.isMode), true);

	let mode1 = {
		domain: null
	};

	let mode2 = {
		domain: 'example.com',
		mode: {
			text: false
		}
	};

	let mode3 = {
		domain: null,
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};

	let mode4 = {
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};

	assert(Browser.isMode(mode1), false);
	assert(Browser.isMode(mode2), false);
	assert(Browser.isMode(mode3), true);
	assert(Browser.isMode(mode4), true);

});

describe('isMode()', function(assert) {

	assert(isFunction(isMode), true);

	let mode1 = {
		domain: null
	};

	let mode2 = {
		domain: 'example.com',
		mode: {
			text: false
		}
	};

	let mode3 = {
		domain: null,
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};

	let mode4 = {
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};

	assert(isMode(mode1), false);
	assert(isMode(mode2), false);
	assert(isMode(mode3), true);
	assert(isMode(mode4), true);

});

describe('Browser.prototype.back()', function(assert) {

	assert(this.browser !== null);
	assert(this.browser.tab,            this.tab);
	assert(this.browser.show(this.tab), this.tab);

	this.browser.setMode({
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	});

	assert(this.browser.getMode('https://example.com'), {
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	});

	assert(this.browser.navigate('https://two.example.com/'),   true);
	assert(this.browser.navigate('https://three.example.com/'), true);

	assert(this.browser.back(),          true);
	assert(this.browser.tab.url,         URL.parse('https://two.example.com/'));
	assert(this.browser.tab.mode.domain, 'example.com');

	assert(this.browser.back(),          true);
	assert(this.browser.tab.url,         URL.parse('https://example.com/'));
	assert(this.browser.tab.mode.domain, 'example.com');

	assert(this.browser.back(),          false);
	assert(this.browser.tab.url,         URL.parse('https://example.com/'));
	assert(this.browser.tab.mode.domain, 'example.com');

	assert(this.browser.tab.navigate('https://example.com'), false);
	assert(this.browser.tab.forget('stealth'),               true);

});

describe('Browser.prototype.close()', function(assert) {

	assert(this.browser.tab,                     this.tab);
	assert(this.browser.tabs.length,             1);
	assert(this.browser.close(this.browser.tab), true);
	assert(this.browser.tab.url,                 URL.parse('stealth:welcome'));
	assert(this.browser.tabs.length,             1);

	let tab1 = this.browser.open('https://example.com/one.html');

	assert(this.browser.show(tab1),  tab1);
	assert(this.browser.tab,         tab1);
	assert(this.browser.tabs.length, 2);

	assert(this.browser.navigate('https://example.com/two.html'), true);
	assert(this.browser.tabs.length,                              2);
	assert(this.browser.close(this.browser.tab),                  true);

	let tab2 = this.browser.tab;

	assert(this.browser.tab,         tab2);
	assert(this.browser.tab.url,     URL.parse('stealth:welcome'));
	assert(this.browser.tabs.length, 1);

	assert(this.browser.show(this.tab), this.tab);
	assert(this.browser.close(tab2),    true);
	assert(this.browser.tab,            this.tab);
	assert(this.browser.tabs.length,    1);

	assert(this.browser.tab.navigate('https://example.com'), true);
	assert(this.browser.tab.forget('stealth'),               true);

});

describe('Browser.prototype.destroy()', function(assert) {

	let browser = new Browser({
		host: '127.0.0.1'
	});

	browser.once('connect', () => {
		assert(true);
	});

	browser.once('disconnect', () => {
		assert(true);
	});

	assert(browser.connect(), true);

	setTimeout(() => {
		assert(browser.destroy(), true);
	}, 100);

});

describe('Browser.prototype.disconnect()', function(assert) {

	let browser = new Browser({
		host: '127.0.0.1'
	});

	browser.once('connect', () => {
		assert(true);
	});

	browser.once('disconnect', () => {
		assert(true);
	});

	assert(browser.connect(), true);

	setTimeout(() => {
		assert(browser.disconnect(), true);
	}, 100);

});

describe('Browser.prototype.download()', function(assert) {

	let browser = new Browser({
		host: '127.0.0.1'
	});

	browser.once('download', (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isBuffer(response.payload), true);

		assert(response.payload.toString('utf8').includes('<html>'));
		assert(response.payload.toString('utf8').includes('<title>Example Domain</title>'));
		assert(response.payload.toString('utf8').includes('</html>'));

		assert(browser.disconnect(), true);

	});

	browser.once('connect', () => {
		assert(browser.download('https://example.com/index.html'), true);
	});

	assert(browser.connect(), true);

});

describe('Browser.prototype.getMode()', function(assert) {

	this.browser.settings.modes = [{
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	}];

	let mode1 = this.browser.getMode('https://cookie.engineer');
	let mode2 = this.browser.getMode('https://tholian.network');
	let mode3 = this.browser.getMode('https://example.com');

	assert(mode1.domain,     'cookie.engineer');
	assert(mode1.mode.text,  false);
	assert(mode1.mode.image, false);
	assert(mode1.mode.audio, false);
	assert(mode1.mode.video, false);
	assert(mode1.mode.other, false);

	assert(mode2.domain,     'tholian.network');
	assert(mode2.mode.text,  false);
	assert(mode2.mode.image, false);
	assert(mode2.mode.audio, false);
	assert(mode2.mode.video, false);
	assert(mode2.mode.other, false);

	assert(mode3.domain,     'example.com');
	assert(mode3.mode.text,  true);
	assert(mode3.mode.image, false);
	assert(mode3.mode.audio, false);
	assert(mode3.mode.video, false);
	assert(mode3.mode.other, false);

	assert(this.browser.settings.modes.includes(mode3), true);

});

describe('Browser.prototype.is()', function(assert) {

	assert(this.browser.is('connected'), true);

});

describe('Browser.prototype.navigate()', function(assert) {

	assert(this.browser.tab,         this.tab);
	assert(this.browser.tabs.length, 1);

	assert(this.browser.navigate('https://example.com/'), true);

	this.browser.setMode({
		domain: 'example.com',
		mode: {
			text:  true,
			image: true,
			audio: false,
			video: false,
			other: false
		}
	});

	assert(this.browser.navigate('https://two.example.com/second.html'), true);

	assert(this.browser.tab.mode, {
		domain: 'example.com',
		mode: {
			text:  true,
			image: true,
			audio: false,
			video: false,
			other: false
		}
	});

	this.browser.setMode({
		domain: 'two.example.com',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: false,
			other: false
		}
	});

	assert(this.browser.getMode('https://two.example.com'), {
		domain: 'two.example.com',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: false,
			other: false
		}
	});

	assert(this.browser.navigate('https://two.example.com/third.html'), true);

	assert(this.browser.tab.mode, {
		domain: 'two.example.com',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: false,
			other: false
		}
	});

	this.browser.settings.modes = [{
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	}];

	assert(this.browser.navigate('https://example.com/'), true);
	assert(this.browser.tab.forget('stealth'),            true);

});

describe('Browser.prototype.next()', function(assert, console) {

	assert(this.browser !== null);
	assert(this.browser.tab,            this.tab);
	assert(this.browser.show(this.tab), this.tab);

	this.browser.settings.modes = [];

	this.browser.setMode({
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	});

	assert(this.browser.getMode('https://example.com'), {
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	});

	assert(this.browser.navigate('https://two.example.com/second.html'),  true);
	assert(this.browser.navigate('https://three.example.com/third.html'), true);

	assert(this.browser.back(),          true);
	assert(this.browser.tab.url,         URL.parse('https://two.example.com/second.html'));
	assert(this.browser.tab.mode.domain, 'example.com');

	assert(this.browser.back(),          true);
	assert(this.browser.tab.url,         URL.parse('https://example.com/'));
	assert(this.browser.tab.mode.domain, 'example.com');

	assert(this.browser.back(),          false);

	// TODO: This is wrong, should not be third!?!?
	console.log(this.browser.tab.url);


	assert(this.browser.tab.url,         URL.parse('https://example.com/'));
	assert(this.browser.tab.mode.domain, 'example.com');

	assert(this.browser.next(),          true);
	assert(this.browser.tab.url,         URL.parse('https://two.example.com/second.html'));
	assert(this.browser.tab.mode.domain, 'example.com');

	assert(this.browser.next(),          true);
	assert(this.browser.tab.url,         URL.parse('https://three.example.com/third.html'));
	assert(this.browser.tab.mode.domain, 'example.com');

	assert(this.browser.next(),          false);
	assert(this.browser.tab.url,         URL.parse('https://three.example.com/third.html'));
	assert(this.browser.tab.mode.domain, 'example.com');

	assert(this.browser.tab.navigate('https://example.com'), true);
	assert(this.browser.tab.forget('stealth'),               true);

});

describe('Browser.prototype.open()', function(assert) {

	assert(this.browser.tab,         this.tab);
	assert(this.browser.tabs.length, 1);

	assert(this.browser.navigate('https://example.com/'), true);

	let tab1 = this.browser.open(null);

	assert(isTab(tab1), false);
	assert(this.browser.tabs.length, 1);

	let tab2 = this.browser.open('ftps://covert.localdomain');

	assert(isTab(tab2), true);
	assert(this.browser.tabs.length, 2);

	let tab3 = this.browser.open('http://covert.localdomain');

	assert(isTab(tab3), true);
	assert(this.browser.tabs.length, 3);

	let tab4 = this.browser.open('stealth:settings');

	assert(isTab(tab4), true);
	assert(this.browser.tabs.length, 4);

	assert(this.browser.close(tab1), false);
	assert(this.browser.close(tab2), true);
	assert(this.browser.close(tab3), true);
	assert(this.browser.close(tab4), true);

	assert(this.browser.tab.navigate('https://example.com'), false);
	assert(this.browser.tab.forget('stealth'),               true);

});

describe('Browser.prototype.pause()', function(assert) {

	assert(this.browser.tab,         this.tab);
	assert(this.browser.tabs.length, 1);

	assert(this.browser.show(null),  this.tab);
	assert(this.browser.tab,         this.tab);
	assert(this.browser.pause(),     false);

	assert(this.browser.show(this.tab), this.tab);
	assert(this.browser.tab,            this.tab);

	let request = new Request({
		mode: {
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

	assert(this.browser.tab.track(request), true);
	assert(request.start(),                 true);

	setTimeout(() => {

		this.browser.once('pause', (tab) => {
			assert(request.stop(), false);
			assert(tab, this.tab);
		});

		assert(this.browser.pause(), true);

	}, 0);

	setTimeout(() => {

		assert(this.browser.tab,         this.tab);
		assert(this.browser.tabs.length, 1);

		assert(this.browser.tab.navigate('https://example.com'), false);
		assert(this.browser.tab.forget('stealth'),               true);

	}, 200);

});

describe('Browser.prototype.refresh()', function(assert) {

	assert(this.browser.tab,         this.tab);
	assert(this.browser.tabs.length, 1);

	assert(this.browser.show(null),  this.tab);
	assert(this.browser.tab,         this.tab);
	assert(this.browser.refresh(),   true);

	assert(this.browser.show(this.tab), this.tab);
	assert(this.browser.tab,            this.tab);

	this.browser.once('refresh', (tab) => {
		assert(tab, this.tab);
	});

	assert(this.browser.refresh(), true);

	let tab = this.browser.open('stealth:settings');

	assert(this.browser.show(tab), tab);
	assert(this.browser.tab,       tab);

	this.browser.once('refresh', (other) => {
		assert(other, tab);
	});

	assert(this.browser.refresh(),  true);
	assert(this.browser.close(tab), true);

	assert(this.browser.tab,         this.tab);
	assert(this.browser.tabs.length, 1);

	assert(this.browser.tab.navigate('https://example.com'), false);
	assert(this.browser.tab.forget('stealth'),               true);

});

describe('Browser.prototype.setMode()', function(assert) {

	this.browser.settings.modes = [{
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	}];

	let mode1 = this.browser.getMode('https://cookie.engineer');
	let mode2 = this.browser.getMode('https://tholian.network');
	let mode3 = this.browser.getMode('https://example.com');

	assert(mode1.domain,     'cookie.engineer');
	assert(mode1.mode.text,  false);
	assert(mode1.mode.image, false);
	assert(mode1.mode.audio, false);
	assert(mode1.mode.video, false);
	assert(mode1.mode.other, false);

	assert(mode2.domain,     'tholian.network');
	assert(mode2.mode.text,  false);
	assert(mode2.mode.image, false);
	assert(mode2.mode.audio, false);
	assert(mode2.mode.video, false);
	assert(mode2.mode.other, false);

	assert(mode3.domain,     'example.com');
	assert(mode3.mode.text,  true);
	assert(mode3.mode.image, false);
	assert(mode3.mode.audio, false);
	assert(mode3.mode.video, false);
	assert(mode3.mode.other, false);

	assert(this.browser.setMode(mode1), true);
	assert(this.browser.setMode(mode2), true);
	assert(this.browser.setMode(mode3), true);

	assert(this.browser.getMode('https://cookie.engineer'), mode1);
	assert(this.browser.getMode('https://tholian.network'), mode2);
	assert(this.browser.getMode('https://example.com'),     mode3);

	assert(this.browser.settings.modes.includes(mode1), true);
	assert(this.browser.settings.modes.includes(mode2), true);
	assert(this.browser.settings.modes.includes(mode3), true);

});

describe('Browser.prototype.show()', function(assert) {

	assert(this.browser.tab,         this.tab);
	assert(this.browser.tabs.length, 1);

	assert(this.browser.navigate('https://example.com/'), true);

	let tab1 = this.browser.open(null);
	let tab2 = this.browser.open('ftps://covert.localdomain');
	let tab3 = this.browser.open('http://covert.localdomain');
	let tab4 = this.browser.open('stealth:settings');

	assert(this.browser.show(tab1), tab4);
	assert(this.browser.tab,        tab4);

	assert(this.browser.show(tab2), tab2);
	assert(this.browser.tab,        tab2);

	assert(this.browser.show(tab3), tab3);
	assert(this.browser.tab,        tab3);

	assert(this.browser.show(tab4), tab4);
	assert(this.browser.tab,        tab4);

	assert(this.browser.tabs.length, 4);
	assert(this.browser.close(tab4), true);
	assert(this.browser.tabs.length, 3);
	assert(this.browser.close(tab3), true);
	assert(this.browser.tabs.length, 2);
	assert(this.browser.close(tab2), true);
	assert(this.browser.tabs.length, 1);

	assert(this.browser.tab.navigate('https://example.com'), false);
	assert(this.browser.tab.forget('stealth'),               true);

});

after(disconnect_stealth);


export default finish('stealth/Browser', {
	internet: true,
	network:  true
});

