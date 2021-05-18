
import { isArray, isFunction } from '../../../base/index.mjs';
import { describe, finish    } from '../../../covert/index.mjs';
import { RESOLVER            } from '../../../stealth/source/server/RESOLVER.mjs';
import { URL                 } from '../../../stealth/source/parser/URL.mjs';



describe('RESOLVER.resolve()/tholian.network', function(assert) {

	assert(isFunction(RESOLVER.resolve), true);

	RESOLVER.resolve(URL.parse('https://tholian.network'), (hosts) => {

		assert(isArray(hosts), true);

		let host = hosts.find((h) => h.domain === 'tholian.network') || null;

		assert(host, {
			domain: 'tholian.network',
			hosts: [{
				ip:    '185.199.108.153',
				scope: 'public',
				type:  'v4'
			}, {
				ip:    '185.199.109.153',
				scope: 'public',
				type:  'v4'
			}, {
				ip:    '185.199.110.153',
				scope: 'public',
				type:  'v4'
			}, {
				ip:    '185.199.111.153',
				scope: 'public',
				type:  'v4'
			}]
		});

	});

});

describe('RESOLVER.resolve()/radar.tholian.network', function(assert) {

	assert(isFunction(RESOLVER.resolve), true);

	RESOLVER.resolve(URL.parse('https://tholian.network'), (hosts) => {

		assert(isArray(hosts), true);

		let host = hosts.find((h) => h.domain === 'radar.tholian.network') || null;

		assert(host, {
			domain: 'radar.tholian.network',
			hosts: [{
				ip:    '93.95.228.18',
				scope: 'public',
				type:  'v4'
			}]
		});

	});

});

// TODO: RESOLVER.resolve()/cookiengineer.tholian.network
// TODO: Statistical resolve method (that verifies outcome via multiple DNS providers)


export default finish('stealth/server/RESOLVER', {
	internet: true,
	network:  false
});

