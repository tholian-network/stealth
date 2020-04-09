
import { create                          } from '../../covert/EXAMPLE.mjs';
import { after, before, describe, finish } from '../../covert/index.mjs';
import { connect, disconnect             } from './Server.mjs';
import { Request                         } from '../source/Request.mjs';



before(connect);

describe('request', function(assert) {

	this.request = new Request({
		ref:    create('https://example.com/index.html').ref,
		config: create('https://example.com/index.html').config
	}, this.stealth);

	this.request.once('init', () => {
		assert(true);
	});

	this.request.once('cache', () => {
		assert(true);
	});

	this.request.once('stash', () => {
		assert(true);
	});

	this.request.once('block', () => {
		assert(true);
	});

	this.request.once('mode', () => {
		assert(true);
	});

	this.request.once('filter', () => {
		assert(true);
	});

	this.request.once('connect', () => {
		assert(true);
	});

	this.request.once('download', () => {
		assert(true);
	});

	this.request.once('optimize', () => {
		assert(true);
	});

	this.request.once('response', () => {
		assert(true);
	});

	this.request.init();

});

describe('request/kill', function(assert) {

	if (this.request !== null && this.request !== undefined) {
		this.request.kill();
	}

	this.request = null;

	assert(this.request === null);

});

describe('request/cache', function(assert) {

	this.request = new Request({
		ref:    create('https://example.com/index.html').ref,
		config: create('https://example.com/index.html').config
	}, this.stealth);


	let events = {
		cache:    false,
		stash:    false,
		connect:  false,
		download: false
	};

	this.request.once('cache', () => {
		events.cache = true;
	});

	this.request.once('stash', () => {
		events.stash = true;
	});

	this.request.once('connect', () => {
		events.connect = true;
	});

	this.request.once('download', () => {
		events.download = true;
	});

	this.request.once('response', () => {

		assert(events.cache === true);
		assert(events.stash === false);
		assert(events.connect === false);
		assert(events.download === false);

		assert(this.request.timeline.cache !== null);
		assert(this.request.timeline.stash === null);
		assert(this.request.timeline.connect === null);
		assert(this.request.timeline.download === null);

	});

	this.request.init();

});

describe('request/kill', function(assert) {

	if (this.request !== null && this.request !== undefined) {
		this.request.kill();
	}

	this.request = null;

	assert(this.request === null);

});

describe('server.services.redirect.save', function(assert) {

	this.stealth.server.services.redirect.save({
		domain:   'example.com',
		path:     '/redirect',
		location: 'https://example.com/index.html'
	}, (response) => {
		assert(response !== null && response.payload === true);
	});

});

describe('request/redirect', function(assert) {

	this.request = new Request({
		ref:    create('https://example.com/redirect').ref,
		config: create('https://example.com/redirect').config
	}, this.stealth);


	this.request.once('redirect', (response) => {

		assert(response !== null && response.headers !== null);
		assert(response !== null && response.headers.location === 'https://example.com/index.html');
		assert(response !== null && response.payload === null);

	});

	this.request.init();

});

describe('request/kill', function(assert) {

	if (this.request !== null && this.request !== undefined) {
		this.request.kill();
	}

	this.request = null;

	assert(this.request === null);

});

after(disconnect);


export default finish('stealth/Request', {
	internet: true
});

