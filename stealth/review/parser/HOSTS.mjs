
import { isArray, isString               } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { sketch, HOSTS as EXAMPLE_HOSTS  } from '../../../covert/EXAMPLE.mjs';
import { HOSTS                           } from '../../../stealth/source/parser/HOSTS.mjs';



const BLOCK = sketch('hosts/block.txt');
const POSIX = sketch('hosts/posix.txt');

const find_domain = (data, domain) => {

	let found = null;

	if (isArray(data) && isString(domain)) {
		found = data.find((ref) => ref.domain === domain) || null;
	}

	return found;

};



before('prepare', function(assert) {

	this.block = HOSTS.parse(BLOCK.payload.toString('utf8'));
	this.posix = HOSTS.parse(POSIX.payload.toString('utf8'));

	assert(this.block !== null);
	assert(this.posix !== null);

});

describe('HOSTS.isHost/block', function(assert) {

	let domain1 = find_domain(this.block, 'malicious.example.com');
	let domain2 = find_domain(this.block, 'ad.example.com');
	let domain3 = find_domain(this.block, 'tracker.example.com');

	let result1 = HOSTS.isHost(domain1);
	let result2 = HOSTS.isHost(domain2);
	let result3 = HOSTS.isHost(domain3);

	assert(domain1 !== null && domain1.hosts.length === 1);
	assert(domain2 !== null && domain2.hosts.length === 1);
	assert(domain3 !== null && domain3.hosts.length === 1);

	assert(result1 === true);
	assert(result2 === true);
	assert(result3 === true);

});

describe('HOSTS.isHosts/block', function(assert) {

	let domain1 = find_domain(this.block, 'malicious.example.com');
	let domain2 = find_domain(this.block, 'ad.example.com');
	let domain3 = find_domain(this.block, 'tracker.example.com');
	let result1 = HOSTS.isHosts([ domain1 ]);
	let result2 = HOSTS.isHosts([ domain1, domain2 ]);
	let result3 = HOSTS.isHosts([ domain1, domain2, domain3 ]);

	assert(domain1 !== null && domain1.hosts.length === 1);
	assert(domain2 !== null && domain2.hosts.length === 1);
	assert(domain3 !== null && domain3.hosts.length === 1);

	assert(result1 === true);
	assert(result2 === true);
	assert(result3 === true);

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

describe('HOSTS.render/block', function(assert) {

	let hosts1 = HOSTS.render(this.block);

	assert(hosts1 !== null && hosts1.length > 0);
	assert(hosts1 !== null && hosts1.includes('127.0.0.1\tmalicious.example.com'));
	assert(hosts1 !== null && hosts1.includes('127.0.0.1\tad.example.com'));
	assert(hosts1 !== null && hosts1.includes('127.0.0.1\ttracker.example.com'));

});

describe('HOSTS.sort/block', function(assert) {

	let sorted = HOSTS.sort([
		HOSTS.parse('malicious.example.com')[0],
		HOSTS.parse('ad.example.com')[0],
		HOSTS.parse('tracker.example.com')[0]
	]);

	assert(sorted[0].domain === 'ad.example.com');
	assert(sorted[1].domain === 'malicious.example.com');
	assert(sorted[2].domain === 'tracker.example.com');

	assert(sorted[0].hosts[0].ip === '127.0.0.1');
	assert(sorted[1].hosts[0].ip === '127.0.0.1');
	assert(sorted[2].hosts[0].ip === '127.0.0.1');

});

describe('HOSTS.isHost/posix', function(assert) {

	let domain1 = find_domain(this.posix, 'router');
	let domain2 = find_domain(this.posix, 'router.localdomain');
	let domain3 = find_domain(this.posix, 'machine');

	let result1 = HOSTS.isHost(domain1);
	let result2 = HOSTS.isHost(domain2);
	let result3 = HOSTS.isHost(domain3);

	assert(domain1 !== null && domain1.hosts.length === 1);
	assert(domain2 !== null && domain2.hosts.length === 1);
	assert(domain3 !== null && domain3.hosts.length === 1);

	assert(result1 === true);
	assert(result2 === true);
	assert(result3 === true);

});

describe('HOSTS.isHosts/posix', function(assert) {

	let domain1 = find_domain(this.posix, 'router');
	let domain2 = find_domain(this.posix, 'router.localdomain');
	let domain3 = find_domain(this.posix, 'machine');
	let result1 = HOSTS.isHosts([ domain1 ]);
	let result2 = HOSTS.isHosts([ domain1, domain2 ]);
	let result3 = HOSTS.isHosts([ domain1, domain2, domain3 ]);

	assert(domain1 !== null && domain1.hosts.length === 1);
	assert(domain2 !== null && domain2.hosts.length === 1);
	assert(domain3 !== null && domain3.hosts.length === 1);

	assert(result1 === true);
	assert(result2 === true);
	assert(result3 === true);

});

describe('HOSTS.parse/posix', function(assert) {

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

describe('HOSTS.render/posix', function(assert) {

	let hosts1 = HOSTS.render(this.posix);

	assert(hosts1 !== null && hosts1.length > 0);
	assert(hosts1 !== null && hosts1.includes('192.168.1.1\trouter'));
	assert(hosts1 !== null && hosts1.includes('192.168.1.1\trouter.localdomain'));
	assert(hosts1 !== null && hosts1.includes('192.168.1.2\tmachine'));

	assert(hosts1 !== null && hosts1.includes('93.184.216.34\texample.com'));
	assert(hosts1 !== null && hosts1.includes('2606:2800:220:1:248:1893:25c8:1946\texample.com'));
	assert(hosts1 !== null && hosts1.includes('93.184.216.34\twww.example.com'));
	assert(hosts1 !== null && hosts1.includes('2606:2800:220:1:248:1893:25c8:1946\twww.example.com'));

});

describe('HOSTS.sort/posix', function(assert) {

	let sorted = HOSTS.sort([
		HOSTS.parse('192.168.1.1\trouter')[0],
		HOSTS.parse('192.168.1.1\trouter.localdomain')[0],
		HOSTS.parse('192.168.1.2\tmachine')[0],
		HOSTS.parse('93.184.216.34\texample.com')[0],
		HOSTS.parse('2606:2800:220:1:248:1893:25c8:1946\texample.com')[0],
		HOSTS.parse('93.184.216.34\twww.example.com')[0],
		HOSTS.parse('2606:2800:220:1:248:1893:25c8:1946\twww.example.com')[0]
	]);

	assert(sorted[0].domain === 'example.com');
	assert(sorted[1].domain === 'example.com');
	assert(sorted[2].domain === 'www.example.com');
	assert(sorted[3].domain === 'www.example.com');
	assert(sorted[4].domain === 'machine');
	assert(sorted[5].domain === 'router');
	assert(sorted[6].domain === 'router.localdomain');

	assert(sorted[0].hosts[0].ip === '93.184.216.34');
	assert(sorted[1].hosts[0].ip === '2606:2800:0220:0001:0248:1893:25c8:1946');
	assert(sorted[2].hosts[0].ip === '93.184.216.34');
	assert(sorted[3].hosts[0].ip === '2606:2800:0220:0001:0248:1893:25c8:1946');
	assert(sorted[4].hosts[0].ip === '192.168.1.2');
	assert(sorted[5].hosts[0].ip === '192.168.1.1');
	assert(sorted[6].hosts[0].ip === '192.168.1.1');

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

after('cleanup', function(assert) {

	this.block = null;
	this.posix = null;

	assert(this.block === null);
	assert(this.posix === null);

});


export default finish('stealth/parser/HOSTS');

