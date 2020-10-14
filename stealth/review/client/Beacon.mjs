
import { isFunction                                                   } from '../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { Beacon                                                       } from '../../../stealth/source/client/Beacon.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Beacon()', function(assert) {

	assert(this.client !== null);
	assert(this.client.services.beacon instanceof Beacon, true);

});

describe('Beacon.prototype.toJSON()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.beacon.toJSON), true);

	assert(this.client.services.beacon.toJSON(), {
		type: 'Beacon Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Beacon.prototype.save()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.beacon.save), true);

	this.client.services.beacon.save({
		domain: 'example.com',
		path:   '/index.html',
		beacons: [{
			label:  'article',
			select: [ '#article > p:nth-child(1)', '#article > p:nth-child(3)' ],
			mode:   {
				text:  true,
				image: true,
				audio: false,
				video: false,
				other: false
			}
		}]
	}, (response) => {

		assert(response, true);

	});

});

describe('Beacon.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.beacon.read), true);

	this.client.services.beacon.read({
		domain: 'example.com',
		path:   '/index.html'
	}, (response) => {

		assert(response, {
			domain: 'example.com',
			path:   '/index.html',
			beacons: [{
				label:  'article',
				select: [ '#article > p:nth-child(1)', '#article > p:nth-child(3)' ],
				mode:   {
					text:  true,
					image: true,
					audio: false,
					video: false,
					other: false
				}
			}]
		});

	});

});

describe('Beacon.prototype.remove()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.beacon.remove), true);

	this.client.services.beacon.remove({
		domain: 'example.com',
		path:   '/index.html'
	}, (response) => {

		assert(response, true);

	});

});

describe('Beacon.prototype.read()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.beacon.read), true);

	this.client.services.beacon.read({
		domain: 'example.com',
		path:   '/index.html'
	}, (response) => {

		assert(response, null);

	});

});

describe('Beacon.prototype.save()/all', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.beacon.save), true);

	this.client.services.beacon.save({
		domain: 'example.com',
		path:   '/news/articles/awesome-topic.html',
		beacons: [{
			label:  'topic',
			select: [ 'h1#awesome-topic' ],
			mode:   {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		}]
	}, (response) => {

		assert(response, true);

	});

	this.client.services.beacon.save({
		domain: 'example.com',
		path:   '/news/articles/*',
		beacons: [{
			label:  'topic',
			select: [ 'h1' ],
			mode:   {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		}]
	}, (response) => {

		assert(response, true);

	});

	this.client.services.beacon.save({
		domain: 'news.example.com',
		path:   '*/articles/awesome-topic.html',
		beacons: [{
			label:  'topic',
			select: [ 'h1#awesome-topic' ],
			mode:   {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		}]
	}, (response) => {

		assert(response, true);

	});

	this.client.services.beacon.save({
		domain: 'tholian.network',
		path:   '/blog/*',
		beacons: [{
			label:  'topic',
			select: [ 'h3' ],
			mode:   {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		}]
	}, (response) => {

		assert(response, true);

	});

});

describe('Beacon.prototype.query()/domain/all', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.beacon.query), true);

	this.client.services.beacon.query({
		domain: '*',
		path:   '*'
	}, (response) => {

		assert(response, [{
			domain: 'example.com',
			path:   '/news/articles/*',
			beacons: [{
				label:  'topic',
				select: [ 'h1' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		}, {
			domain: 'example.com',
			path:   '/news/articles/awesome-topic.html',
			beacons: [{
				label:  'topic',
				select: [ 'h1#awesome-topic' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		}, {
			domain: 'news.example.com',
			path:   '*/articles/awesome-topic.html',
			beacons: [{
				label:  'topic',
				select: [ 'h1#awesome-topic' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		}, {
			domain: 'tholian.network',
			path:   '/blog/*',
			beacons: [{
				label:  'topic',
				select: [ 'h3' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		}]);

	});

});

describe('Beacon.prototype.query()/domain/prefix', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.beacon.query), true);

	this.client.services.beacon.query({
		domain: 'example*',
		path:   '*'
	}, (response) => {

		assert(response, [{
			domain: 'example.com',
			path:   '/news/articles/*',
			beacons: [{
				label:  'topic',
				select: [ 'h1' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		}, {
			domain: 'example.com',
			path:   '/news/articles/awesome-topic.html',
			beacons: [{
				label:  'topic',
				select: [ 'h1#awesome-topic' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		}]);

	});

});

describe('Beacon.prototype.query()/domain/suffix', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.beacon.query), true);

	this.client.services.beacon.query({
		domain: '*.com',
		path:   '*'
	}, (response) => {

		assert(response, [{
			domain: 'example.com',
			path:   '/news/articles/*',
			beacons: [{
				label:  'topic',
				select: [ 'h1' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		}, {
			domain: 'example.com',
			path:   '/news/articles/awesome-topic.html',
			beacons: [{
				label:  'topic',
				select: [ 'h1#awesome-topic' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		}, {
			domain: 'news.example.com',
			path:   '*/articles/awesome-topic.html',
			beacons: [{
				label:  'topic',
				select: [ 'h1#awesome-topic' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		}]);

	});

	this.client.services.beacon.query({
		domain: '*.network',
		path:   '*'
	}, (response) => {

		assert(response, [{
			domain: 'tholian.network',
			path:   '/blog/*',
			beacons: [{
				label:  'topic',
				select: [ 'h3' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		}]);

	});

});

describe('Beacon.prototype.query()/path/all', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.beacon.query), true);

	this.client.services.beacon.query({
		domain: 'example.com',
		path:   '*'
	}, (response) => {

		assert(response, [{
			domain: 'example.com',
			path:   '/news/articles/*',
			beacons: [{
				label:  'topic',
				select: [ 'h1' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		}, {
			domain: 'example.com',
			path:   '/news/articles/awesome-topic.html',
			beacons: [{
				label:  'topic',
				select: [ 'h1#awesome-topic' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		}]);

	});

});

describe('Beacon.prototype.query()/path/prefix', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.beacon.query), true);

	this.client.services.beacon.query({
		domain: 'example.com',
		path:   '/news/*'
	}, (response) => {

		assert(response, [{
			domain: 'example.com',
			path:   '/news/articles/*',
			beacons: [{
				label:  'topic',
				select: [ 'h1' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		}, {
			domain: 'example.com',
			path:   '/news/articles/awesome-topic.html',
			beacons: [{
				label:  'topic',
				select: [ 'h1#awesome-topic' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		}]);

	});

});

describe('Beacon.prototype.query()/path/suffix', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.beacon.query), true);

	this.client.services.beacon.query({
		domain: 'example.com',
		path:   '*/awesome-topic.html'
	}, (response) => {

		assert(response, [{
			domain: 'example.com',
			path:   '/news/articles/awesome-topic.html',
			beacons: [{
				label:  'topic',
				select: [ 'h1#awesome-topic' ],
				mode:   {
					text:  true,
					image: false,
					audio: false,
					video: false,
					other: false
				}
			}]
		}]);

	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Beacon');

