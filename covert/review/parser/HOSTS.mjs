
import { sketch, HOSTS as EXAMPLE_HOSTS } from '../../EXAMPLE.mjs';
import { isArray, isString } from '../../source/POLYFILLS.mjs';

import { after, before, describe, finish } from '../../source/Review.mjs';

import { HOSTS } from '../../../stealth/source/parser/HOSTS.mjs';

const PAYLOAD_POSIX = sketch('hosts/posix.txt');
const PAYLOAD_BLOCK = sketch('hosts/block.txt');

const find_domain = (data, domain) => {

	let found = null;

	if (isArray(data) && isString(domain)) {
		found = data.find((ref) => ref.domain === domain) || null;
	}

	return found;

};



before('prepare', function(assert) {

	this.block = HOSTS.parse(PAYLOAD_BLOCK);
	this.posix = HOSTS.parse(PAYLOAD_POSIX);

	assert(this.block !== null);
	assert(this.posix !== null);

});

describe('HOSTS.parse/local', function(assert) {

	let domain1 = find_domain(this.posix, 'router');
	let domain2 = find_domain(this.posix, 'router.localdomain');
	let domain3 = find_domain(this.posix, 'machine');

	assert(domain1 !== null && domain1.hosts.length === 1);
	assert(domain2 !== null && domain2.hosts.length === 1);
	assert(domain3 !== null && domain3.hosts.length === 1);

	assert(domain1.hosts[0].ip === '192.168.1.1');
	assert(domain2.hosts[0].ip === '192.168.1.1');
	assert(domain3.hosts[0].ip === '192.168.1.2');

	assert(domain1.hosts[0].type === 'v4');
	assert(domain2.hosts[0].type === 'v4');
	assert(domain3.hosts[0].type === 'v4');

});

describe('HOSTS.parse/remote', function(assert) {

	let domain1 = find_domain(this.posix, 'example.com');
	let domain2 = find_domain(this.posix, 'www.example.com');

	assert(domain1 !== null && domain1.hosts.length === 2);
	assert(domain2 !== null && domain2.hosts.length === 2);

	assert(domain1.hosts[0].ip === EXAMPLE_HOSTS[0].ip);
	assert(domain1.hosts[1].ip === EXAMPLE_HOSTS[1].ip);
	assert(domain2.hosts[0].ip === EXAMPLE_HOSTS[0].ip);
	assert(domain2.hosts[1].ip === EXAMPLE_HOSTS[1].ip);

	assert(domain1.hosts[0].type === 'v4');
	assert(domain1.hosts[1].type === 'v6');
	assert(domain2.hosts[0].type === 'v4');
	assert(domain2.hosts[1].type === 'v6');

});

describe('HOSTS.parse/block', function(assert) {

	let domain1 = find_domain(this.block, 'malicious.example.com');
	let domain2 = find_domain(this.block, 'ad.example.com');
	let domain3 = find_domain(this.block, 'tracker.example.com');

	assert(domain1 !== null && domain1.hosts.length === 1);
	assert(domain2 !== null && domain2.hosts.length === 1);
	assert(domain3 !== null && domain3.hosts.length === 1);

	assert(domain1.hosts[0].ip === '127.0.0.1');
	assert(domain2.hosts[0].ip === '127.0.0.1');
	assert(domain3.hosts[0].ip === '127.0.0.1');

});

after('cleanup', function(assert) {

	this.block = null;
	this.posix = null;

	assert(this.block === null);
	assert(this.posix === null);

});



export default finish('parser/HOSTS');

