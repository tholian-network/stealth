
import { CONFIG as EXAMPLE_CONFIG, URL as EXAMPLE_URL } from '../EXAMPLE.mjs';
import { after, before, describe, finish } from '../source/Review.mjs';
import { connect, disconnect             } from './Server.mjs';

import { Request } from '../../stealth/source/Request.mjs';



before(connect);


describe('request', function(assert) {

	this.request = new Request({
		ref:    EXAMPLE_URL,
		config: EXAMPLE_CONFIG
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

	this.request.kill();
	this.request = null;

	assert(this.request === null);

});

describe('request/cache', function(assert) {

	this.request = new Request({
		ref:    EXAMPLE_URL,
		config: EXAMPLE_CONFIG
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
		events.connect= true;
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

	this.request.kill();
	this.request = null;

	assert(this.request === null);

});

// describe('request/redirect', function(assert) {
//
// 	// TODO:
// 	// - Save redirect via redirect service
// 	// - Test redirect on request
// 	// request.on('redirect', () => {
// 	// 	assert(true);
// 	// });
//
// 	assert(false);
//
// });


after(disconnect);


export default finish('Request');


// [x] request/init
// [x] request/cache
// [ ] request/stash
// [ ] request/block
// [ ] request/mode
// [ ] request/filter
// [ ] request/connect
// [ ] request/download
// [ ] request/optimize

// request/redirect
// request/response

