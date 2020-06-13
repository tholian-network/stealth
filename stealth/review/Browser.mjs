
import { isBuffer, isObject                                           } from '../../base/index.mjs';
import { after, before, describe, finish                              } from '../../covert/index.mjs';
import { Browser, isBrowser, isConfig                                 } from '../../stealth/source/Browser.mjs';
import { Request                                                      } from '../../stealth/source/Request.mjs';
import { isTab                                                        } from '../../stealth/source/Tab.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from './Stealth.mjs';



before(connect_stealth);

export const connect = describe('Browser.prototype.connect()', function(assert) {

	this.browser = new Browser({
		host: '127.0.0.1'
	});


	this.tab = null;

	this.browser.once('connect', () => {

		this.browser.set({
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		});

		assert(this.browser.get('example.com'), {
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

	this.browser.connect();

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

describe('Browser.isBrowser()', function(assert) {

	assert(typeof Browser.isBrowser, 'function');

	assert(Browser.isBrowser(this.browser), true);

});

describe('isBrowser()', function(assert) {

	assert(typeof isBrowser, 'function');

	assert(isBrowser(this.browser), true);

});

describe('Browser.isConfig()', function(assert) {

	let cfg1 = {
		domain: null
	};

	let cfg2 = {
		domain: 'example.com',
		mode: {
			text: false
		}
	};

	let cfg3 = {
		domain: null,
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};

	let cfg4 = {
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};

	assert(typeof Browser.isConfig, 'function');

	assert(Browser.isConfig(cfg1), false);
	assert(Browser.isConfig(cfg2), false);
	assert(Browser.isConfig(cfg3), true);
	assert(Browser.isConfig(cfg4), true);

});

describe('isConfig()', function(assert) {

	let cfg1 = {
		domain: null
	};

	let cfg2 = {
		domain: 'example.com',
		mode: {
			text: false
		}
	};

	let cfg3 = {
		domain: null,
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};

	let cfg4 = {
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};

	assert(typeof isConfig, 'function');

	assert(isConfig(cfg1), false);
	assert(isConfig(cfg2), false);
	assert(isConfig(cfg3), true);
	assert(isConfig(cfg4), true);

});

describe('Browser.prototype.back()', function(assert) {

	assert(this.browser !== null);
	assert(this.browser.tab,            this.tab);
	assert(this.browser.show(this.tab), this.tab);

	this.browser.set({
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	});

	assert(this.browser.get('example.com'), {
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

	assert(this.browser.back(),            true);
	assert(this.browser.tab.url,           'https://two.example.com/');
	assert(this.browser.tab.config.domain, 'example.com');

	assert(this.browser.back(),            true);
	assert(this.browser.tab.url,           'https://example.com/');
	assert(this.browser.tab.config.domain, 'example.com');

	assert(this.browser.back(),            false);
	assert(this.browser.tab.url,           'https://example.com/');
	assert(this.browser.tab.config.domain, 'example.com');

	assert(this.browser.tab.navigate('https://example.com'), true);
	assert(this.browser.tab.forget('stealth'),               true);

});

describe('Browser.prototype.close()', function(assert) {

	assert(this.browser.tab,                     this.tab);
	assert(this.browser.tabs.length,             1);
	assert(this.browser.close(this.browser.tab), true);
	assert(this.browser.tab.url,                 'stealth:welcome');
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
	assert(this.browser.tab.url,     'stealth:welcome');
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

		assert(response !== null);
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

describe('Browser.prototype.get()', function(assert) {

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

	let cfg1 = this.browser.get('cookie.engineer');
	let cfg2 = this.browser.get('tholian.network');
	let cfg3 = this.browser.get('example.com');

	assert(cfg1.domain,     'cookie.engineer');
	assert(cfg1.mode.text,  false);
	assert(cfg1.mode.image, false);
	assert(cfg1.mode.audio, false);
	assert(cfg1.mode.video, false);
	assert(cfg1.mode.other, false);

	assert(cfg2.domain,     'tholian.network');
	assert(cfg2.mode.text,  false);
	assert(cfg2.mode.image, false);
	assert(cfg2.mode.audio, false);
	assert(cfg2.mode.video, false);
	assert(cfg2.mode.other, false);

	assert(cfg3.domain,     'example.com');
	assert(cfg3.mode.text,  true);
	assert(cfg3.mode.image, false);
	assert(cfg3.mode.audio, false);
	assert(cfg3.mode.video, false);
	assert(cfg3.mode.other, false);

	assert(this.browser.settings.modes.includes(cfg3), true);

});

describe('Browser.prototype.is()', function(assert) {

	assert(this.browser.is('connected'), true);

});

describe('Browser.prototype.navigate()', function(assert) {

	assert(this.browser.tab,         this.tab);
	assert(this.browser.tabs.length, 1);

	assert(this.browser.navigate('https://example.com/'), true);

	this.browser.set({
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

	assert(this.browser.tab.config, {
		domain: 'example.com',
		mode: {
			text:  true,
			image: true,
			audio: false,
			video: false,
			other: false
		}
	});

	this.browser.set({
		domain: 'two.example.com',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: false,
			other: false
		}
	});

	assert(this.browser.get('two.example.com'), {
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

	assert(this.browser.tab.config, {
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

describe('Browser.prototype.next()', function(assert) {

	assert(this.browser !== null);
	assert(this.browser.tab,            this.tab);
	assert(this.browser.show(this.tab), this.tab);

	this.browser.settings.modes = [];

	this.browser.set({
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	});

	assert(this.browser.get('example.com'), {
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

	assert(this.browser.back(),            true);
	assert(this.browser.tab.url,           'https://two.example.com/second.html');
	assert(this.browser.tab.config.domain, 'example.com');

	assert(this.browser.back(),            true);
	assert(this.browser.tab.url,           'https://example.com/');
	assert(this.browser.tab.config.domain, 'example.com');

	assert(this.browser.back(),            false);
	assert(this.browser.tab.url,           'https://example.com/');
	assert(this.browser.tab.config.domain, 'example.com');

	assert(this.browser.next(),            true);
	assert(this.browser.tab.url,           'https://two.example.com/second.html');
	assert(this.browser.tab.config.domain, 'example.com');

	assert(this.browser.next(),            true);
	assert(this.browser.tab.url,           'https://three.example.com/third.html');
	assert(this.browser.tab.config.domain, 'example.com');

	assert(this.browser.next(),            false);
	assert(this.browser.tab.url,           'https://three.example.com/third.html');
	assert(this.browser.tab.config.domain, 'example.com');

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

	assert(this.browser.tab.navigate('https://example.com'), true);
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

		assert(this.browser.tab.navigate('https://example.com'), true);
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

	assert(this.browser.tab.navigate('https://example.com'), true);
	assert(this.browser.tab.forget('stealth'),               true);

});

describe('Browser.prototype.set()', function(assert) {

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

	let cfg1 = this.browser.get('cookie.engineer');
	let cfg2 = this.browser.get('tholian.network');
	let cfg3 = this.browser.get('example.com');

	assert(cfg1.domain,     'cookie.engineer');
	assert(cfg1.mode.text,  false);
	assert(cfg1.mode.image, false);
	assert(cfg1.mode.audio, false);
	assert(cfg1.mode.video, false);
	assert(cfg1.mode.other, false);

	assert(cfg2.domain,     'tholian.network');
	assert(cfg2.mode.text,  false);
	assert(cfg2.mode.image, false);
	assert(cfg2.mode.audio, false);
	assert(cfg2.mode.video, false);
	assert(cfg2.mode.other, false);

	assert(cfg3.domain,     'example.com');
	assert(cfg3.mode.text,  true);
	assert(cfg3.mode.image, false);
	assert(cfg3.mode.audio, false);
	assert(cfg3.mode.video, false);
	assert(cfg3.mode.other, false);

	assert(this.browser.set(cfg1), true);
	assert(this.browser.set(cfg2), true);
	assert(this.browser.set(cfg3), true);

	assert(this.browser.get('cookie.engineer'), cfg1);
	assert(this.browser.get('tholian.network'), cfg2);
	assert(this.browser.get('example.com'),     cfg3);

	assert(this.browser.settings.modes.includes(cfg1), true);
	assert(this.browser.settings.modes.includes(cfg2), true);
	assert(this.browser.settings.modes.includes(cfg3), true);

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

	assert(this.browser.tab.navigate('https://example.com'), true);
	assert(this.browser.tab.forget('stealth'),               true);

});

after(disconnect_stealth);


export default finish('stealth/Browser', {
	internet: true
});

