
import { isFunction                                                   } from '../../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../../covert/index.mjs';
import { Beacon                                                       } from '../../../../stealth/source/client/service/Beacon.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../../../../stealth/review/Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../../../../stealth/review/Client.mjs';



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
		domain:  'example.com',
		beacons: [{
			path:   '/index.html',
			query:  null,
			select: 'body > article > h3',
			term:   'title'
		}]
	}, (response) => {

		assert(response, true);

	});

});

describe('Beacon.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.beacon.read), true);

	this.client.services.beacon.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			domain:  'example.com',
			beacons: [{
				path:   '/index.html',
				query:  null,
				select: 'body > article > h3',
				term:   'title'
			}]
		});

	});

});

describe('Beacon.prototype.remove()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.beacon.remove), true);

	this.client.services.beacon.remove({
		domain: 'example.com'
	}, (response) => {

		assert(response, true);

	});

});

describe('Beacon.prototype.read()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.beacon.read), true);

	this.client.services.beacon.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, null);

	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/service/Beacon', {
	internet: false,
	network:  true
});

