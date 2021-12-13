
import { Buffer, isFunction              } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { VERSION                         } from '../../../stealth/source/Stealth.mjs';
import { DNS                             } from '../../../stealth/source/connection/DNS.mjs';
import { IP                              } from '../../../stealth/source/parser/IP.mjs';
import { URL                             } from '../../../stealth/source/parser/URL.mjs';
import { connect, disconnect             } from '../../../stealth/review/Stealth.mjs';



before(connect);

describe('Peerer.prototype.can()', function(assert) {

	assert(isFunction(this.stealth.server.peerer.can), true);

	let packet1 = {
		headers: {
			'@type': 'request'
		},
		payload: {
			questions: [{
				domain: null,
				type:   'PTR',
				value:  '_stealth._wss.tholian.local'
			}, {
				domain: null,
				type:   'PTR',
				value:  '_stealth._ws.tholian.local'
			}],
			answers: []
		}
	};
	let packet2 = {
		headers: {
			'@type': 'response'
		},
		payload: {
			questions: [{
				domain: null,
				type:   'PTR',
				value:  '_stealth._wss.tholian.local'
			}, {
				domain: null,
				type:   'PTR',
				value:  '_stealth._ws.tholian.local'
			}],
			answers: [{
				domain: 'tinky',
				type:   'PTR',
				value:  '_stealth._ws.tholian.local'
			}, {
				domain: '_stealth._ws.tholian.local',
				type:   'SRV',
				value:  'tinky',
				port:   65432,
				weight: 0
			}, {
				domain: 'tinky',
				type:   'TXT',
				value:  [
					Buffer.from('version=' + VERSION, 'utf8')
				]
			}, {
				domain: 'tinky',
				type:   'TXT',
				value:  [
					Buffer.from('certificate=null', 'utf8')
				]
			}, {
				domain: 'tinky',
				type:   'TXT',
				value:  [
					Buffer.from('connection=broadband', 'utf8')
				]
			}]
		}
	};
	let packet3 = {
		// TODO: Packet with valid certificate hash
	};
	let packet4 = {
		// TODO: Packet with invalid certificate hash
	};
	let packet5 = {
		// TODO: Packet with invalid A/AAAA entries
	};

	assert(this.stealth.server.peerer.can(packet1), true);
	assert(this.stealth.server.peerer.can(packet2), true);
	assert(this.stealth.server.peerer.can(packet3), true);
	assert(this.stealth.server.peerer.can(packet4), false);
	assert(this.stealth.server.peerer.can(packet5), false);

});

describe('Peerer.prototype.receive()/DNS-SD-REQUEST', function(assert) {
});

describe('Peerer.prototype.receive()/DNS-SD-RESPONSE', function(assert) {
});

describe('Peerer.prototype.resolve()/tholian.local', function(assert) {
});

describe('Peerer.prototype.resolve()/tholian.network', function(assert) {
});

after(disconnect);


export default finish('stealth/server/Peerer', {
	internet: false,
	network:  true
});

