
import { Buffer, isArray, isString                } from '../../../base/index.mjs';
import { after, before, describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { HOSTS                                    } from '../../../stealth/source/parser/HOSTS.mjs';



const BLOCK = EXAMPLE.toSketch('hosts/block.txt');
const POSIX = EXAMPLE.toSketch('hosts/posix.txt');

const find_domain = (data, domain) => {

	let found = null;

	if (isArray(data) && isString(domain)) {
		found = data.find((ref) => ref.domain === domain) || null;
	}

	return found;

};



before('prepare', function(assert) {

	this.block = HOSTS.parse(BLOCK.payload);
	this.posix = HOSTS.parse(POSIX.payload);

	assert(this.block !== null);
	assert(this.posix !== null);

});

describe('HOSTS.isHost()/block', function(assert) {

	let domain1 = find_domain(this.block, 'malicious.example.com');
	let domain2 = find_domain(this.block, 'ad.example.com');
	let domain3 = find_domain(this.block, 'tracker.example.com');

	let result1 = HOSTS.isHost(domain1);
	let result2 = HOSTS.isHost(domain2);
	let result3 = HOSTS.isHost(domain3);

	assert(result1, true);
	assert(result2, true);
	assert(result3, true);

});

describe('HOSTS.isHOSTS()/block', function(assert) {

	let domain1 = find_domain(this.block, 'malicious.example.com');
	let domain2 = find_domain(this.block, 'ad.example.com');
	let domain3 = find_domain(this.block, 'tracker.example.com');

	let result1 = HOSTS.isHOSTS([ domain1 ]);
	let result2 = HOSTS.isHOSTS([ domain1, domain2 ]);
	let result3 = HOSTS.isHOSTS([ domain1, domain2, domain3 ]);

	assert(result1, true);
	assert(result2, true);
	assert(result3, true);

});

describe('HOSTS.parse()/block', function(assert) {

	let domain1 = find_domain(this.block, 'malicious.example.com');
	let domain2 = find_domain(this.block, 'ad.example.com');
	let domain3 = find_domain(this.block, 'tracker.example.com');

	assert(domain1, {
		domain: 'malicious.example.com',
		hosts: [{
			ip:    '127.0.0.1',
			scope: 'private',
			type:  'v4'
		}]
	});

	assert(domain2, {
		domain: 'ad.example.com',
		hosts: [{
			ip:    '127.0.0.1',
			scope: 'private',
			type:  'v4'
		}]
	});

	assert(domain3, {
		domain: 'tracker.example.com',
		hosts: [{
			ip:    '127.0.0.1',
			scope: 'private',
			type:  'v4'
		}]
	});

});

describe('HOSTS.render()/block', function(assert) {

	let hosts = HOSTS.render(this.block);
	let file  = [
		'127.0.0.1\tmalicious.example.com',
		'127.0.0.1\tad.example.com',
		'127.0.0.1\ttracker.example.com'
	].join('\n');

	assert(hosts, file);

});

describe('HOSTS.sort()/block', function(assert) {

	let sorted = HOSTS.sort([
		HOSTS.parse(Buffer.from('malicious.example.com', 'utf8'))[0],
		HOSTS.parse(Buffer.from('ad.example.com', 'utf8'))[0],
		HOSTS.parse(Buffer.from('tracker.example.com', 'utf8'))[0]
	]);

	assert(isArray(sorted), true);

	assert(sorted[0], {
		domain: 'ad.example.com',
		hosts:  [{
			ip:    '127.0.0.1',
			scope: 'private',
			type:  'v4'
		}]
	});

	assert(sorted[1], {
		domain: 'malicious.example.com',
		hosts:  [{
			ip:    '127.0.0.1',
			scope: 'private',
			type:  'v4'
		}]
	});

	assert(sorted[2], {
		domain: 'tracker.example.com',
		hosts:  [{
			ip:    '127.0.0.1',
			scope: 'private',
			type:  'v4'
		}]
	});

});

describe('HOSTS.isHost()/posix', function(assert) {

	let domain1 = find_domain(this.posix, 'router');
	let domain2 = find_domain(this.posix, 'router.localdomain');
	let domain3 = find_domain(this.posix, 'machine');

	let result1 = HOSTS.isHost(domain1);
	let result2 = HOSTS.isHost(domain2);
	let result3 = HOSTS.isHost(domain3);

	assert(result1, true);
	assert(result2, true);
	assert(result3, true);

});

describe('HOSTS.isHOSTS()/posix', function(assert) {

	let domain1 = find_domain(this.posix, 'router');
	let domain2 = find_domain(this.posix, 'router.localdomain');
	let domain3 = find_domain(this.posix, 'machine');

	let result1 = HOSTS.isHOSTS([ domain1 ]);
	let result2 = HOSTS.isHOSTS([ domain1, domain2 ]);
	let result3 = HOSTS.isHOSTS([ domain1, domain2, domain3 ]);

	assert(result1, true);
	assert(result2, true);
	assert(result3, true);

});

describe('HOSTS.parse()/posix', function(assert) {

	let domain1 = find_domain(this.posix, 'router');
	let domain2 = find_domain(this.posix, 'router.localdomain');
	let domain3 = find_domain(this.posix, 'machine');

	assert(domain1, {
		domain: 'router',
		hosts: [{
			ip:    '192.168.1.1',
			scope: 'private',
			type:  'v4'
		}]
	});

	assert(domain2, {
		domain: 'router.localdomain',
		hosts: [{
			ip:    '192.168.1.1',
			scope: 'private',
			type:  'v4'
		}]
	});

	assert(domain3, {
		domain: 'machine',
		hosts: [{
			ip:    '192.168.1.2',
			scope: 'private',
			type:  'v4'
		}]
	});

});

describe('HOSTS.render()/posix', function(assert) {

	let hosts = HOSTS.render(this.posix);
	let file  = [
		'192.168.1.1\trouter',
		'192.168.1.1\trouter.localdomain',
		'192.168.1.2\tmachine',
		'93.184.216.34\texample.com',
		'2606:2800:220:1:248:1893:25c8:1946\texample.com',
		'93.184.216.34\twww.example.com',
		'2606:2800:220:1:248:1893:25c8:1946\twww.example.com'
	].join('\n');

	assert(hosts, file);

});

describe('HOSTS.sort()/posix', function(assert) {

	let sorted = HOSTS.sort([
		HOSTS.parse(Buffer.from('192.168.1.1\trouter', 'utf8'))[0],
		HOSTS.parse(Buffer.from('192.168.1.1\trouter.localdomain', 'utf8'))[0],
		HOSTS.parse(Buffer.from('192.168.1.2\tmachine', 'utf8'))[0],
		HOSTS.parse(Buffer.from('93.184.216.34\texample.com', 'utf8'))[0],
		HOSTS.parse(Buffer.from('2606:2800:220:1:248:1893:25c8:1946\texample.com', 'utf8'))[0],
		HOSTS.parse(Buffer.from('93.184.216.34\twww.example.com', 'utf8'))[0],
		HOSTS.parse(Buffer.from('2606:2800:220:1:248:1893:25c8:1946\twww.example.com', 'utf8'))[0]
	]);

	assert(isArray(sorted), true);

	assert(sorted[0], {
		domain: 'example.com',
		hosts: [ EXAMPLE.ipv4 ]
	});

	assert(sorted[1], {
		domain: 'example.com',
		hosts: [ EXAMPLE.ipv6 ]
	});

	assert(sorted[2], {
		domain: 'www.example.com',
		hosts: [ EXAMPLE.ipv4 ]
	});

	assert(sorted[3], {
		domain: 'www.example.com',
		hosts: [ EXAMPLE.ipv6 ]
	});

	assert(sorted[4], {
		domain: 'machine',
		hosts: [{
			ip:    '192.168.1.2',
			scope: 'private',
			type:  'v4'
		}]
	});

	assert(sorted[5], {
		domain: 'router',
		hosts: [{
			ip:    '192.168.1.1',
			scope: 'private',
			type:  'v4'
		}]
	});

	assert(sorted[6], {
		domain: 'router.localdomain',
		hosts: [{
			ip:    '192.168.1.1',
			scope: 'private',
			type:  'v4'
		}]
	});

});

describe('HOSTS.parse()/remote', function(assert) {

	let domain1 = find_domain(this.posix, 'example.com');
	let domain2 = find_domain(this.posix, 'www.example.com');

	assert(domain1, {
		domain: 'example.com',
		hosts:  EXAMPLE.hosts
	});

	assert(domain2, {
		domain: 'www.example.com',
		hosts:  EXAMPLE.hosts
	});

});

after('cleanup', function(assert) {

	this.block = null;
	this.posix = null;

	assert(this.block, null);
	assert(this.posix, null);

});


export default finish('stealth/parser/HOSTS');

