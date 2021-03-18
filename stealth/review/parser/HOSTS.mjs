
import { Buffer, isArray, isString } from '../../../base/index.mjs';
import { describe, finish          } from '../../../covert/index.mjs';
import { IP                        } from '../../../stealth/source/parser/IP.mjs';
import { HOSTS                     } from '../../../stealth/source/parser/HOSTS.mjs';



const BLOCKLIST = Buffer.from([
	'#',
	'#   comment that should be ignored',
	'#   \t   ',
	'#      (1) site',
	'#\t\t    ',
	'Site',
	'malicious.example.com',
	'ad.example.com',
	'',
	'! another comment that should be ignored',
	'Category',
	'tracker.example.com',
	'#',
	'# comment that should be ignored',
	'#',
	'# ignored.com',
	'# 127.0.0.1 other.ignored.com',
	'#',
	'# END'
].join('\r\n'), 'utf8');

const HOSTSLIST = Buffer.from([
	'#',
	'# /etc/hosts: static lookup table for host names',
	'#',
	'',
	'#<ip-address>	<hostname.domain.org>	<hostname>',
	'127.0.0.1	localhost.localdomain	localhost',
	'::1		localhost.localdomain	localhost',
	'',
	'192.168.1.1  router router.localdomain # comment that should be filtered out',
	'192.168.1.2  machine',
	'',
	'',
	'',
	'#',
	'# TEMPORARY',
	'#',
	'',
	'',
	'93.184.216.34                           example.com',
	'2606:2800:0220:0001:0248:1893:25c8:1946 example.com',
	'',
	'93.184.216.34				      	www.example.com',
	'2606:2800:0220:0001:0248:1893:25c8:1946 www.example.com',
	'',
	'',
	'',
	'# End of file',
].join('\n'), 'utf8');



describe('HOSTS.isHost()', function(assert) {

	let host1 = { domain: 'example.com',         hosts: [] };
	let host2 = { domain: 'ad.example.com',      hosts: [ IP.parse('127.0.0.1') ] };
	let host3 = { domain: 'tracker.example.com', hosts: [ IP.parse('93.184.216.34') ] };
	let host4 = { domain: 'tracker.example.com', hosts: [ IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946') ] };
	let host5 = { domain: '192.168.0.1',         hosts: [ IP.parse('192.168.0.1') ] };
	let host6 = { domain: '192.168.0.1' };
	let host7 = { hosts: [] };
	let host8 = { hosts: [ IP.parse('127.0.0.1') ] };

	assert(HOSTS.isHost(host1), true);
	assert(HOSTS.isHost(host2), true);
	assert(HOSTS.isHost(host3), true);
	assert(HOSTS.isHost(host4), true);

	assert(HOSTS.isHost(host5), false);
	assert(HOSTS.isHost(host6), false);
	assert(HOSTS.isHost(host7), false);
	assert(HOSTS.isHost(host8), false);

});

describe('HOSTS.isHOSTS()', function(assert) {

	let host1 = { domain: 'example.com',         hosts: [] };
	let host2 = { domain: 'tracker.example.com', hosts: [ IP.parse('93.184.216.34') ] };
	let host3 = { domain: '192.168.0.1',         hosts: [ IP.parse('192.168.0.1') ] };
	let host4 = { hosts: [ IP.parse('127.0.0.1') ] };

	assert(HOSTS.isHOSTS([ host1, host2 ]), true);
	assert(HOSTS.isHOSTS([ host1, host3 ]), false);
	assert(HOSTS.isHOSTS([ host1, host4 ]), false);
	assert(HOSTS.isHOSTS([ host2, host3 ]), false);
	assert(HOSTS.isHOSTS([ host2, host4 ]), false);
	assert(HOSTS.isHOSTS([ host3, host4 ]), false);

});

describe('HOSTS.parse()/blocklist', function(assert) {

	let hosts = HOSTS.parse(BLOCKLIST);
	let host1 = hosts.find((h) => h.domain === 'Site')                  || null;
	let host2 = hosts.find((h) => h.domain === 'Category')              || null;
	let host3 = hosts.find((h) => h.domain === 'ignored.com')           || null;
	let host4 = hosts.find((h) => h.domain === 'other.ignored.com')     || null;
	let host5 = hosts.find((h) => h.domain === 'malicious.example.com') || null;
	let host6 = hosts.find((h) => h.domain === 'ad.example.com')        || null;
	let host7 = hosts.find((h) => h.domain === 'tracker.example.com')   || null;

	assert(HOSTS.isHOSTS(hosts), true);

	assert(host1, null);

	assert(host2, null);

	assert(host3, null);

	assert(host4, null);

	assert(host5, {
		domain: 'malicious.example.com',
		hosts: [
			IP.parse('127.0.0.1')
		]
	});

	assert(host6, {
		domain: 'ad.example.com',
		hosts: [
			IP.parse('127.0.0.1')
		]
	});

	assert(host7, {
		domain: 'tracker.example.com',
		hosts: [
			IP.parse('127.0.0.1')
		]
	});

});

describe('HOSTS.render()/blocklist', function(assert) {

	let hosts  = HOSTS.parse(BLOCKLIST);
	let string = HOSTS.render(hosts);

	assert(HOSTS.isHOSTS(hosts), true);

	assert(isString(string), true);

	assert(string, [
		'127.0.0.1\tmalicious.example.com',
		'127.0.0.1\tad.example.com',
		'127.0.0.1\ttracker.example.com'
	].join('\n'));

});

describe('HOSTS.sort()/blocklist', function(assert) {

	let hosts  = HOSTS.parse(BLOCKLIST);
	let sorted = HOSTS.sort(hosts);

	assert(isArray(sorted), true);

	assert(sorted, [{
		domain: 'ad.example.com',
		hosts: [
			IP.parse('127.0.0.1')
		]
	}, {
		domain: 'malicious.example.com',
		hosts: [
			IP.parse('127.0.0.1')
		]
	}, {
		domain: 'tracker.example.com',
		hosts: [
			IP.parse('127.0.0.1')
		]
	}]);

});

describe('HOSTS.parse()/hostslist', function(assert) {

	let hosts = HOSTS.parse(HOSTSLIST);
	let host1 = hosts.find((h) => h.domain === 'localhost')             || null;
	let host2 = hosts.find((h) => h.domain === 'localhost.localdomain') || null;
	let host3 = hosts.find((h) => h.domain === 'router')                || null;
	let host4 = hosts.find((h) => h.domain === 'router.localdomain')    || null;
	let host5 = hosts.find((h) => h.domain === 'machine')               || null;
	let host6 = hosts.find((h) => h.domain === 'example.com')           || null;
	let host7 = hosts.find((h) => h.domain === 'www.example.com')       || null;

	assert(HOSTS.isHOSTS(hosts), true);

	assert(host1, null);

	assert(host2, null);

	assert(host3, {
		domain: 'router',
		hosts: [
			IP.parse('192.168.1.1')
		]
	});

	assert(host4, {
		domain: 'router.localdomain',
		hosts: [
			IP.parse('192.168.1.1')
		]
	});

	assert(host5, {
		domain: 'machine',
		hosts: [
			IP.parse('192.168.1.2')
		]
	});

	assert(host6, {
		domain: 'example.com',
		hosts: [
			IP.parse('93.184.216.34'),
			IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
		]
	});

	assert(host7, {
		domain: 'www.example.com',
		hosts: [
			IP.parse('93.184.216.34'),
			IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
		]
	});

});

describe('HOSTS.render()/hostslist', function(assert) {

	let hosts  = HOSTS.parse(HOSTSLIST);
	let string = HOSTS.render(hosts);

	assert(HOSTS.isHOSTS(hosts), true);

	assert(isString(string), true);

	assert(string, [
		'192.168.1.1\trouter',
		'192.168.1.1\trouter.localdomain',
		'192.168.1.2\tmachine',
		'93.184.216.34\texample.com',
		'2606:2800:220:1:248:1893:25c8:1946\texample.com',
		'93.184.216.34\twww.example.com',
		'2606:2800:220:1:248:1893:25c8:1946\twww.example.com'
	].join('\n'));

});

describe('HOSTS.sort()/hostslist', function(assert) {

	let hosts  = HOSTS.parse(HOSTSLIST);
	let sorted = HOSTS.sort(hosts);

	assert(isArray(sorted), true);

	assert(sorted, [{
		domain: 'example.com',
		hosts: [
			IP.parse('93.184.216.34'),
			IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
		]
	}, {
		domain: 'www.example.com',
		hosts: [
			IP.parse('93.184.216.34'),
			IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
		]
	}, {
		domain: 'machine',
		hosts: [
			IP.parse('192.168.1.2')
		]
	}, {
		domain: 'router',
		hosts: [
			IP.parse('192.168.1.1')
		]
	}, {
		domain: 'router.localdomain',
		hosts: [
			IP.parse('192.168.1.1')
		]
	}]);

});


export default finish('stealth/parser/HOSTS', {
	internet: false,
	network:  false
});

