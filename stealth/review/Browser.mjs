
import { Browser                                                      } from '../../stealth/source/Browser.mjs';
import { after, before, describe, finish                              } from '../../covert/index.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from './Stealth.mjs';



before(connect_stealth);

export const connect = describe('browser.connect', function(assert) {

	this.browser = new Browser({
	});
	this.tab     = null;

	this.browser.once('connect', () => {
		assert(true);
	});

	this.browser.connect('127.0.0.1', (result) => {

		assert(result);

		this.tab = this.browser.open('https://cookie.engineer');

		assert(this.tab !== null);

	});

});

describe('browser.back', function(assert) {

	assert(this.browser !== null);
	assert(this.browser.tab === null);

	assert(this.browser.show(this.tab) === this.tab);
	assert(this.browser.navigate('https://tholian.net') === true);

	assert(this.browser.tab !== this.tab);
	assert(this.browser.tab.url === 'https://tholian.net');

});

describe('browser.download', function(assert) {
});

describe('browser.execute', function(assert) {

});

describe('browser.get', function(assert) {

});

describe('browser.kill', function(assert) {

});

describe('browser.navigate', function(assert) {

});

describe('browser.next', function(assert) {

});

describe('browser.open', function(assert) {

});

describe('browser.pause', function(assert) {

});

describe('browser.refresh', function(assert) {

});

describe('browser.set', function(assert) {

});

describe('browser.show', function(assert) {

});

after(disconnect_stealth);



export default finish('stealth/Browser');

