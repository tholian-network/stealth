
import { isFunction                      } from '../../../../base/index.mjs';
import { after, before, describe, finish } from '../../../../covert/index.mjs';
import { Beacon                          } from '../../../../stealth/source/server/service/Beacon.mjs';
import { connect, disconnect             } from '../../../../stealth/review/Server.mjs';



before(connect);

describe('new Beacon()', function(assert) {

	assert(this.server !== null);
	assert(this.server.services.beacon instanceof Beacon, true);

});

describe('Beacon.prototype.toJSON()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.beacon.toJSON), true);

	assert(this.server.services.beacon.toJSON(), {
		type: 'Beacon Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Beacon.isBeacon()', function(assert) {

	assert(isFunction(Beacon.isBeacon), true);

	assert(Beacon.isBeacon(null), false);
	assert(Beacon.isBeacon({}),   false);

	assert(Beacon.isBeacon({
		domain: 'example.com',
		beacons: [{
			path:   '/index.html',
			query:  null,
			select: 'body > article',
			term:   'article'
		}, {
			path:   '/index.html',
			query:  null,
			select: 'body > article > h3',
			term:   'title'
		}]
	}), true);

});

describe('Beacon.toBeacon()', function(assert) {

	assert(isFunction(Beacon.toBeacon), true);

	assert(Beacon.toBeacon(null), null);
	assert(Beacon.toBeacon({}),   null);

	assert(Beacon.toBeacon({
		domain:  'example.com',
		another: 'property',
		beacons: [{
			path:    '/index.html',
			query:   null,
			select:  'body > article > h3',
			term:    'title',
			another: 'property'
		}]
	}), {
		domain: 'example.com',
		beacons: [{
			path:   '/index.html',
			query:  null,
			select: 'body > article > h3',
			term:   'title'
		}]
	});

});

describe('Beacon.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.beacon.save), true);

	this.server.services.beacon.save({
		domain:  'example.com',
		beacons: [{
			path:   '/index.html',
			query:  null,
			select: 'body > article > h3',
			term:   'title'
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
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'beacon',
				event:   'read'
			},
			payload: {
				domain:  'example.com',
				beacons: [{
					path:   '/index.html',
					query:  null,
					select: 'body > article > h3',
					term:   'title'
				}]
			}
		});

	});

});

describe('Beacon.prototype.remove()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.beacon.remove), true);

	this.server.services.beacon.remove({
		domain: 'example.com'
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
		domain: 'example.com'
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

after(disconnect);


export default finish('stealth/server/service/Beacon', {
	internet: false,
	network:  true
});

