
import { after, before, describe, finish                      } from '../source/Review.mjs';
import { connect as srv_connect, disconnect as srv_disconnect } from './Server.mjs';
import { Browser                                              } from '../../browser/source/Browser.mjs';



before(srv_connect);

export const connect = describe('browser.connect', function(assert) {

	this.browser = new Browser();
	this.tab     = null;

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

	// TODO: Test browser.download method

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

after(srv_disconnect);



export default finish('Browser');

