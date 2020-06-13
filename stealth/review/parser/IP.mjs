
import { isString         } from '../../../base/index.mjs';
import { describe, finish } from '../../../covert/index.mjs';
import { IP               } from '../../../stealth/source/parser/IP.mjs';



describe('IP.isIP()/v4', function(assert) {

	let ip1 = IP.parse('127.0.0.1');
	let ip2 = IP.parse('10.1.2.3');
	let ip3 = IP.parse('172.25.1.2');
	let ip4 = IP.parse('192.168.0.1');
	let ip5 = IP.parse('199.0.0.254');
	let ip6 = IP.parse('192.89.99.123');
	let ip7 = IP.parse('169.255.123.123');
	let ip8 = IP.parse('100.129.0.254');

	assert(IP.isIP(ip1), true);
	assert(IP.isIP(ip2), true);
	assert(IP.isIP(ip3), true);
	assert(IP.isIP(ip4), true);
	assert(IP.isIP(ip5), true);
	assert(IP.isIP(ip6), true);
	assert(IP.isIP(ip7), true);
	assert(IP.isIP(ip8), true);

});

describe('IP.parse()/v4/private', function(assert) {

	let ip1 = IP.parse('127.0.0.1');
	let ip2 = IP.parse('10.1.2.3');
	let ip3 = IP.parse('172.25.1.2');
	let ip4 = IP.parse('192.168.0.1');
	let ip5 = IP.parse('198.128.254.254');
	let ip6 = IP.parse('192.88.99.123');
	let ip7 = IP.parse('169.254.123.123');
	let ip8 = IP.parse('100.128.0.254');

	assert(isString(ip1.ip), true);
	assert(ip1.scope,        'private');
	assert(ip1.type,         'v4');

	assert(isString(ip2.ip), true);
	assert(ip2.scope,        'private');
	assert(ip2.type,         'v4');

	assert(isString(ip3.ip), true);
	assert(ip3.scope,        'private');
	assert(ip3.type,         'v4');

	assert(isString(ip4.ip), true);
	assert(ip4.scope,        'private');
	assert(ip4.type,         'v4');

	assert(isString(ip5.ip), true);
	assert(ip5.scope,       'private');
	assert(ip5.type,        'v4');

	assert(isString(ip6.ip), true);
	assert(ip6.scope,        'private');
	assert(ip6.type,         'v4');

	assert(isString(ip7.ip), true);
	assert(ip7.scope,        'private');
	assert(ip7.type,         'v4');

	assert(isString(ip8.ip), true);
	assert(ip8.scope,        'private');
	assert(ip8.type,         'v4');

});

describe('IP.parse()/v4/public', function(assert) {

	let ip1 = IP.parse('128.1.2.3');
	let ip2 = IP.parse('11.1.2.3');
	let ip3 = IP.parse('172.32.1.2');
	let ip4 = IP.parse('192.169.0.1');
	let ip5 = IP.parse('199.0.0.254');
	let ip6 = IP.parse('192.89.99.123');
	let ip7 = IP.parse('169.255.123.123');
	let ip8 = IP.parse('100.129.0.254');

	assert(isString(ip1.ip), true);
	assert(ip1.scope,        'public');
	assert(ip1.type,         'v4');

	assert(isString(ip2.ip), true);
	assert(ip2.scope,        'public');
	assert(ip2.type,         'v4');

	assert(isString(ip3.ip), true);
	assert(ip3.scope,        'public');
	assert(ip3.type,         'v4');

	assert(isString(ip4.ip), true);
	assert(ip4.scope,        'public');
	assert(ip4.type,         'v4');

	assert(isString(ip5.ip), true);
	assert(ip5.scope,        'public');
	assert(ip5.type,         'v4');

	assert(isString(ip6.ip), true);
	assert(ip6.scope,        'public');
	assert(ip6.type,         'v4');

	assert(isString(ip7.ip), true);
	assert(ip7.scope,        'public');
	assert(ip7.type,         'v4');

	assert(isString(ip8.ip), true);
	assert(ip8.scope,        'public');
	assert(ip8.type,         'v4');

});

describe('IP.render()/v4', function(assert) {

	let ip1 = IP.parse('127.0.0.1');
	let ip2 = IP.parse('10.1.2.3');
	let ip3 = IP.parse('172.25.1.2');
	let ip4 = IP.parse('192.168.0.1');
	let ip5 = IP.parse('199.0.0.254');
	let ip6 = IP.parse('192.89.99.123');
	let ip7 = IP.parse('169.255.123.123');
	let ip8 = IP.parse('100.129.0.254');

	assert(IP.render(ip1), '127.0.0.1');
	assert(IP.render(ip2), '10.1.2.3');
	assert(IP.render(ip3), '172.25.1.2');
	assert(IP.render(ip4), '192.168.0.1');
	assert(IP.render(ip5), '199.0.0.254');
	assert(IP.render(ip6), '192.89.99.123');
	assert(IP.render(ip7), '169.255.123.123');
	assert(IP.render(ip8), '100.129.0.254');

});

describe('IP.sort()/v4', function(assert) {

	let sorted = IP.sort([
		IP.parse('127.0.0.1'),
		IP.parse('10.1.2.3'),
		IP.parse('172.25.1.2'),
		IP.parse('192.168.0.1'),
		IP.parse('199.0.0.254'),
		IP.parse('192.89.99.123'),
		IP.parse('169.255.123.123'),
		IP.parse('100.129.0.254')
	]);

	assert(sorted[0].ip,    '10.1.2.3');
	assert(sorted[1].ip,    '127.0.0.1');
	assert(sorted[2].ip,    '172.25.1.2');
	assert(sorted[3].ip,    '192.168.0.1');
	assert(sorted[0].scope, 'private');
	assert(sorted[1].scope, 'private');
	assert(sorted[2].scope, 'private');
	assert(sorted[3].scope, 'private');

	assert(sorted[4].ip,    '100.129.0.254');
	assert(sorted[5].ip,    '169.255.123.123');
	assert(sorted[6].ip,    '192.89.99.123');
	assert(sorted[7].ip,    '199.0.0.254');
	assert(sorted[4].scope, 'public');
	assert(sorted[5].scope, 'public');
	assert(sorted[6].scope, 'public');
	assert(sorted[7].scope, 'public');

});

describe('IP.isIP()/v6', function(assert) {

	let ip1 = IP.parse('::1');
	let ip2 = IP.parse('fe80::1234');
	let ip3 = IP.parse('fe80::1234:abcd');
	let ip4 = IP.parse('fe80::1234:1234:abcd:abcd');
	let ip5 = IP.parse('13::37');
	let ip6 = IP.parse('1:3::3:7');
	let ip7 = IP.parse('12:34::ab:cd');
	let ip8 = IP.parse('abcd:1234::abcd:1234');

	assert(IP.isIP(ip1), true);
	assert(IP.isIP(ip2), true);
	assert(IP.isIP(ip3), true);
	assert(IP.isIP(ip4), true);
	assert(IP.isIP(ip5), true);
	assert(IP.isIP(ip6), true);
	assert(IP.isIP(ip7), true);
	assert(IP.isIP(ip8), true);

});

describe('IP.parse()/v6/private', function(assert) {

	let ip1 = IP.parse('::1');
	let ip2 = IP.parse('fe80::1234');
	let ip3 = IP.parse('fe80::1234:abcd');
	let ip4 = IP.parse('fe80::1234:1234:abcd:abcd');

	assert(isString(ip1.ip), true);
	assert(ip1.scope,        'private');
	assert(ip1.type,         'v6');

	assert(isString(ip2.ip), true);
	assert(ip2.scope,        'private');
	assert(ip2.type,         'v6');

	assert(isString(ip3.ip), true);
	assert(ip3.scope,        'private');
	assert(ip3.type,         'v6');

	assert(isString(ip4.ip), true);
	assert(ip4.scope,        'private');
	assert(ip4.type,         'v6');

});

describe('IP.parse()/v6/public', function(assert) {

	let ip1 = IP.parse('13::37');
	let ip2 = IP.parse('1:3::3:7');
	let ip3 = IP.parse('12:34::ab:cd');
	let ip4 = IP.parse('abcd:1234::abcd:1234');

	assert(isString(ip1.ip), true);
	assert(ip1.scope,        'public');
	assert(ip1.type,         'v6');

	assert(isString(ip2.ip), true);
	assert(ip2.scope,        'public');
	assert(ip2.type,         'v6');

	assert(isString(ip3.ip), true);
	assert(ip3.scope,        'public');
	assert(ip3.type,         'v6');

	assert(isString(ip4.ip), true);
	assert(ip4.scope,        'public');
	assert(ip4.type,         'v6');

});

describe('IP.render()/v6', function(assert) {

	let ip1 = IP.parse('::1');
	let ip2 = IP.parse('fe80::1234');
	let ip3 = IP.parse('fe80::1234:abcd');
	let ip4 = IP.parse('fe80::1234:1234:abcd:abcd');
	let ip5 = IP.parse('13::37');
	let ip6 = IP.parse('1:3::3:7');
	let ip7 = IP.parse('12:34::ab:cd');
	let ip8 = IP.parse('abcd:1234::abcd:1234');

	assert(IP.render(ip1), '::1');
	assert(IP.render(ip2), 'fe80::1234');
	assert(IP.render(ip3), 'fe80::1234:abcd');
	assert(IP.render(ip4), 'fe80::1234:1234:abcd:abcd');
	assert(IP.render(ip5), '13::37');
	assert(IP.render(ip6), '1:3::3:7');
	assert(IP.render(ip7), '12:34::ab:cd');
	assert(IP.render(ip8), 'abcd:1234::abcd:1234');

});

describe('IP.sort()/v6', function(assert) {

	let sorted = IP.sort([
		IP.parse('::1'),
		IP.parse('fe80::1234'),
		IP.parse('fe80::1234:abcd'),
		IP.parse('fe80::1234:1234:abcd:abcd'),
		IP.parse('13::37'),
		IP.parse('1:3::3:7'),
		IP.parse('12:34::ab:cd'),
		IP.parse('abcd:1234::abcd:1234')
	]);

	assert(IP.render(sorted[0]), '::1');
	assert(IP.render(sorted[1]), 'fe80::1234');
	assert(IP.render(sorted[2]), 'fe80::1234:abcd');
	assert(IP.render(sorted[3]), 'fe80::1234:1234:abcd:abcd');
	assert(sorted[0].scope,      'private');
	assert(sorted[1].scope,      'private');
	assert(sorted[2].scope,      'private');
	assert(sorted[3].scope,      'private');

	assert(IP.render(sorted[4]), '1:3::3:7');
	assert(IP.render(sorted[5]), '12:34::ab:cd');
	assert(IP.render(sorted[6]), '13::37');
	assert(IP.render(sorted[7]), 'abcd:1234::abcd:1234');
	assert(sorted[4].scope,      'public');
	assert(sorted[5].scope,      'public');
	assert(sorted[6].scope,      'public');
	assert(sorted[7].scope,      'public');

});


export default finish('stealth/parser/IP');

