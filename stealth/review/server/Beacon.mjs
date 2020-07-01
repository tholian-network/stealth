
import { isFunction                      } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { Beacon                          } from '../../../stealth/source/server/Beacon.mjs';
import { connect, disconnect             } from '../Server.mjs';



before(connect);

describe('new Beacon()', function(assert) {

	assert(this.server!== null);
	assert(this.server.services.beacon instanceof Beacon, true);

});

describe('Beacon.isBeacon()', function(assert) {

	assert(isFunction(Beacon.isBeacon), true);

	assert(Beacon.isBeacon(null), false);
	assert(Beacon.isBeacon({}),   false);

	assert(Beacon.isBeacon({
		domain: 'example.com',
		path:   '/index.html',
		beacons: [{
			label:  'article',
			select: [ '#article > p:nth-child(1)', '#article > p:nth-child(3)' ],
			mode:   [ 'text', 'image' ]
		}]
	}), true);

});

describe('Beacon.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.beacon.save), true);

	this.server.services.beacon.save({
		domain: 'example.com',
		path:   '/index.html',
		beacons: [{
			label:  'article',
			select: [ '#article > p:nth-child(1)', '#article > p:nth-child(3)' ],
			mode:   [ 'text', 'image' ]
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Beacon.prototype.read()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.beacon.read), true);

	this.server.services.beacon.read({
		domain: 'example.com',
		path:   '/index.html'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'read'
			},
			payload: {
				domain: 'example.com',
				path:   '/index.html',
				beacons: [{
					label:  'article',
					select: [ '#article > p:nth-child(1)', '#article > p:nth-child(3)' ],
					mode:   [ 'text', 'image' ]
				}]
			}
		});

	});

});

describe('Beacon.prototype.remove()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.beacon.remove), true);

	this.server.services.beacon.remove({
		domain: 'example.com',
		path:   '/index.html'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'remove'
			},
			payload: true
		});

	});

});

describe('Beacon.prototype.read()/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.beacon.read), true);

	this.server.services.beacon.read({
		domain: 'example.com',
		path:   '/index.html'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'read'
			},
			payload: null
		});

	});

});

describe('Beacon.prototype.save()/all', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.beacon.save), true);

	this.server.services.beacon.save({
		domain: 'example.com',
		path:   '/news/articles/awesome-topic.html',
		beacons: [{
			label:  'topic',
			select: [ 'h1#awesome-topic' ],
			mode:   [ 'text' ]
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'save'
			},
			payload: true
		});

	});

	this.server.services.beacon.save({
		domain: 'example.com',
		path:   '/news/articles/*',
		beacons: [{
			label:  'topic',
			select: [ 'h1' ],
			mode:   [ 'text' ]
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'save'
			},
			payload: true
		});

	});

	this.server.services.beacon.save({
		domain: 'news.example.com',
		path:   '*/articles/awesome-topic.html',
		beacons: [{
			label:  'topic',
			select: [ 'h1#awesome-topic' ],
			mode:   [ 'text' ]
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'save'
			},
			payload: true
		});

	});

	this.server.services.beacon.save({
		domain: 'tholian.network',
		path:   '/blog/*',
		beacons: [{
			label:  'topic',
			select: [ 'h3' ],
			mode:   [ 'text' ]
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Beacon.prototype.query()/domain/all', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.beacon.query), true);

	this.server.services.beacon.query({
		domain: '*',
		path:   '*'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'query'
			},
			payload: [{
				domain: 'example.com',
				path:   '/news/articles/*',
				beacons: [{
					label:  'topic',
					select: [ 'h1' ],
					mode:   [ 'text' ]
				}]
			}, {
				domain: 'example.com',
				path:   '/news/articles/awesome-topic.html',
				beacons: [{
					label:  'topic',
					select: [ 'h1#awesome-topic' ],
					mode:   [ 'text' ]
				}]
			}, {
				domain: 'news.example.com',
				path:   '*/articles/awesome-topic.html',
				beacons: [{
					label:  'topic',
					select: [ 'h1#awesome-topic' ],
					mode:   [ 'text' ]
				}]
			}, {
				domain: 'tholian.network',
				path:   '/blog/*',
				beacons: [{
					label:  'topic',
					select: [ 'h3' ],
					mode:   [ 'text' ]
				}]
			}]
		});

	});

});

describe('Beacon.prototype.query()/domain/prefix', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.beacon.query), true);

	this.server.services.beacon.query({
		domain: 'example*',
		path:   '*'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'query'
			},
			payload: [{
				domain: 'example.com',
				path:   '/news/articles/*',
				beacons: [{
					label:  'topic',
					select: [ 'h1' ],
					mode:   [ 'text' ]
				}]
			}, {
				domain: 'example.com',
				path:   '/news/articles/awesome-topic.html',
				beacons: [{
					label:  'topic',
					select: [ 'h1#awesome-topic' ],
					mode:   [ 'text' ]
				}]
			}]
		});

	});

});

describe('Beacon.prototype.query()/domain/suffix', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.beacon.query), true);

	this.server.services.beacon.query({
		domain: '*.com',
		path:   '*'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'query'
			},
			payload: [{
				domain: 'example.com',
				path:   '/news/articles/*',
				beacons: [{
					label:  'topic',
					select: [ 'h1' ],
					mode:   [ 'text' ]
				}]
			}, {
				domain: 'example.com',
				path:   '/news/articles/awesome-topic.html',
				beacons: [{
					label:  'topic',
					select: [ 'h1#awesome-topic' ],
					mode:   [ 'text' ]
				}]
			}, {
				domain: 'news.example.com',
				path:   '*/articles/awesome-topic.html',
				beacons: [{
					label:  'topic',
					select: [ 'h1#awesome-topic' ],
					mode:   [ 'text' ]
				}]
			}]
		});

	});

	this.server.services.beacon.query({
		domain: '*.network',
		path:   '*'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'query'
			},
			payload: [{
				domain: 'tholian.network',
				path:   '/blog/*',
				beacons: [{
					label:  'topic',
					select: [ 'h3' ],
					mode:   [ 'text' ]
				}]
			}]
		});

	});

});

describe('Beacon.prototype.query()/path/all', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.beacon.query), true);

	this.server.services.beacon.query({
		domain: 'example.com',
		path:   '*'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'query'
			},
			payload: [{
				domain: 'example.com',
				path:   '/news/articles/*',
				beacons: [{
					label:  'topic',
					select: [ 'h1' ],
					mode:   [ 'text' ]
				}]
			}, {
				domain: 'example.com',
				path:   '/news/articles/awesome-topic.html',
				beacons: [{
					label:  'topic',
					select: [ 'h1#awesome-topic' ],
					mode:   [ 'text' ]
				}]
			}]
		});

	});

});

describe('Beacon.prototype.query()/path/prefix', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.beacon.query), true);

	this.server.services.beacon.query({
		domain: 'example.com',
		path:   '/news/*'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'query'
			},
			payload: [{
				domain: 'example.com',
				path:   '/news/articles/*',
				beacons: [{
					label:  'topic',
					select: [ 'h1' ],
					mode:   [ 'text' ]
				}]
			}, {
				domain: 'example.com',
				path:   '/news/articles/awesome-topic.html',
				beacons: [{
					label:  'topic',
					select: [ 'h1#awesome-topic' ],
					mode:   [ 'text' ]
				}]
			}]
		});

	});

});

describe('Beacon.prototype.query()/path/suffix', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.beacon.query), true);

	this.server.services.beacon.query({
		domain: 'example.com',
		path:   '*/awesome-topic.html'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'query'
			},
			payload: [{
				domain: 'example.com',
				path:   '/news/articles/awesome-topic.html',
				beacons: [{
					label:  'topic',
					select: [ 'h1#awesome-topic' ],
					mode:   [ 'text' ]
				}]
			}]
		});

	});

});

after(disconnect);


export default finish('stealth/server/Beacon');

