
import { describe, finish } from '../../../covert/index.mjs';
import { IP               } from '../../../stealth/source/parser/IP.mjs';
import { URL              } from '../../../stealth/source/parser/URL.mjs';



const build_domain = (protocol, subdomain, domain, port, path, query, hash) => {

	return {

		domain:    domain,
		hash:      hash,
		host:      null,
		mime:      null,
		path:      path,
		port:      port,
		protocol:  protocol,
		query:     query,
		subdomain: subdomain,

		link:      URL.render({
			domain:    domain,
			host:      null,
			path:      path,
			port:      port,
			protocol:  protocol,
			query:     query,
			subdomain: subdomain
		}),

		hosts:     [],

		headers:   null,
		payload:   null

	};

};

const build_host = (protocol, host, port, path, query, hash) => {

	return {

		domain:    null,
		hash:      hash,
		host:      host,
		mime:      null,
		path:      path,
		port:      port,
		protocol:  protocol,
		query:     query,
		subdomain: null,

		link:      URL.render({
			domain:    null,
			host:      host,
			path:      path,
			port:      port,
			protocol:  protocol,
			query:     query,
			subdomain: null
		}),

		hosts:     [
			IP.parse(host)
		],

		headers:   null,
		payload:   null

	};

};

const build_file = (protocol, path, query, hash) => {

	return {

		domain:    null,
		hash:      hash,
		host:      null,
		path:      path,
		port:      null,
		protocol:  protocol,
		query:     query,
		subdomain: null,

		link:      URL.render({
			domain:    null,
			host:      null,
			path:      path,
			port:      null,
			protocol:  protocol,
			query:     query,
			subdomain: null
		}),

		hosts:     [],

		headers:   null,
		payload:   null

	};

};



describe('URL.compare()', function(assert) {

	let sorted = [
		URL.parse('http://localhost/what/ever.html'),
		URL.parse('http://thinkpad:1337/what/ever.html?q=u&e=r&y'),
		URL.parse('https://domain.tld/what/ever.html'),
		URL.parse('https://sub.domain.tld:1337/what/ever.html?q=u&e=r&y'),
		URL.parse('http://127.0.0.1/what/ever.html'),
		URL.parse('http://127.0.0.1:1337/what/ever.html?q=u&e=r&y'),
		URL.parse('https://[::1]/what/ever.html'),
		URL.parse('https://[::1]:1337/what/ever.html?q=u&e=r&y'),
		URL.parse('stealth:settings'),
		URL.parse('stealth:search?query=This+is+a+test'),
		URL.parse('file:///what/ever.html'),
		URL.parse('file:///what/ever.html?q=u&e=r&y'),
		URL.parse('ftp://localhost/what/ever.html'),
		URL.parse('ftp://thinkpad:1337/what/ever.html?q=u&e=r&y'),
		URL.parse('unknown://domain.tld/what/ever.html'),
		URL.parse('unknown://sub.domain.tld:1337/what/ever.html?q=u&e=r&y')
	].sort((a, b) => {
		return URL.compare(a, b);
	});

	assert(sorted.length > 0);
	assert(sorted.length, 16);

	assert(sorted[0].link,  'file:///what/ever.html');
	assert(sorted[1].link,  'file:///what/ever.html?q=u&e=r&y');
	assert(sorted[2].link,  'ftp://localhost/what/ever.html');
	assert(sorted[3].link,  'ftp://thinkpad:1337/what/ever.html?q=u&e=r&y');
	assert(sorted[4].link,  'http://127.0.0.1/what/ever.html');
	assert(sorted[5].link,  'http://127.0.0.1:1337/what/ever.html?q=u&e=r&y');
	assert(sorted[6].link,  'http://localhost/what/ever.html');
	assert(sorted[7].link,  'http://thinkpad:1337/what/ever.html?q=u&e=r&y');
	assert(sorted[8].link,  'https://[0000:0000:0000:0000:0000:0000:0000:0001]/what/ever.html');
	assert(sorted[9].link,  'https://[0000:0000:0000:0000:0000:0000:0000:0001]:1337/what/ever.html?q=u&e=r&y');
	assert(sorted[10].link, 'https://domain.tld/what/ever.html');
	assert(sorted[11].link, 'https://sub.domain.tld:1337/what/ever.html?q=u&e=r&y');
	assert(sorted[12].link, 'stealth:search?query=This+is+a+test');
	assert(sorted[13].link, 'stealth:settings');
	assert(sorted[14].link, 'unknown://domain.tld/what/ever.html');
	assert(sorted[15].link, 'unknown://sub.domain.tld:1337/what/ever.html?q=u&e=r&y');

});

describe('URL.filter()', function(assert) {

	let url1    = URL.parse('http://example.com/tracker?foo=bar&bar=qux&qux=123');
	let policy1 = {
		domain: 'example.com',
		policies: [{
			path: '/tracker',
			query: 'foo&bar'
		}]
	};

	let url2    = URL.parse('http://example.com/tracker?foo=bar&bar=qux&qux=123');
	let url3    = URL.parse('https://example.com/tracker?fee=123EUR&bar=qux&qux=123');
	let policy2 = {
		domain: 'example.com',
		policies: [{
			path: '/track*',
			query: 'f*&qux'
		}]
	};

	let url4    = URL.parse('http://example.com/tracker?foo=bar&bar=qux&qux=123');
	let url5    = URL.parse('https://example.com/tracker?loo=asd&bar=qux&qux=123');
	let policy3 = {
		domain: 'example.com',
		policies: [{
			path: '*cker',
			query: '*oo&bar=qux'
		}]
	};

	let url6    = URL.parse('http://example.com/tracker?foo=bar&bar=qux&qux=123');
	let url7    = URL.parse('https://example.com/tracker?bor=asd&bar=qux&qux=321');
	let policy4 = {
		domain: 'example.com',
		policies: [{
			path: '/t*er',
			query: 'b*r&qux=*23'
		}]
	};

	assert(URL.filter(url1, policy1), URL.parse('http://example.com/tracker?bar=qux&foo=bar'));

	assert(URL.filter(url2, policy2), URL.parse('http://example.com/tracker?foo=bar&qux=123'));
	assert(URL.filter(url3, policy2), URL.parse('https://example.com/tracker?fee=123EUR&qux=123'));

	assert(URL.filter(url4, policy3), URL.parse('http://example.com/tracker?bar=qux&foo=bar'));
	assert(URL.filter(url5, policy3), URL.parse('https://example.com/tracker?bar=qux&loo=asd'));

	assert(URL.filter(url6, policy4), URL.parse('http://example.com/tracker?bar=qux&qux=123'));
	assert(URL.filter(url7, policy4), URL.parse('https://example.com/tracker?bar=qux&bor=asd'));

});

describe('URL.isDomain()', function(assert) {

	assert(URL.isDomain('example.com',     'example.com'),     true);
	assert(URL.isDomain('example.com',     'two.example.com'), true);
	assert(URL.isDomain('two.example.com', 'example.com'),     false);
	assert(URL.isDomain('two.example.com', 'two.example.com'), true);

	assert(URL.isDomain('three.two.example.com',      'three.two.example.com'),      true);
	assert(URL.isDomain('three.two.example.com',      'four.three.two.example.com'), true);
	assert(URL.isDomain('four.three.two.example.com', 'three.two.example.com'),      false);
	assert(URL.isDomain('four.three.two.example.com', 'four.three.two.example.com'), true);

	assert(URL.isDomain('example.com', '1.3.3.7'),     false);
	assert(URL.isDomain('1.3.3.7',     '3.3.7'),       false);
	assert(URL.isDomain('3.3.7',       '1.3.3.7'),     false);
	assert(URL.isDomain('1.3.3.7',     '1.3.3.7'),     true);
	assert(URL.isDomain('10.0.0.1',    '1.3.3.7'),     false);
	assert(URL.isDomain('1.3.3.7',     '10.0.0.1'),    false);
	assert(URL.isDomain('10.0.0.1',    '10.0.0.1'),    true);
	assert(URL.isDomain('1.3.3.7',     'example.com'), false);

});

describe('URL.isURL()', function(assert) {

	let url1  = URL.parse('http://localhost/what/ever.html');
	let url2  = URL.parse('http://thinkpad:1337/what/ever.html?q=u&e=r&y#and-a-hash');
	let url3  = URL.parse('https://domain.tld/what/ever.html');
	let url4  = URL.parse('https://sub.domain.tld:1337/what/ever.html?q=u&e=r&y#and-a-hash');
	let url5  = URL.parse('http://127.0.0.1/what/ever.html');
	let url6  = URL.parse('http://127.0.0.1:1337/what/ever.html?q=u&e=r&y#and-a-hash');
	let url7  = URL.parse('https://[::1]/what/ever.html');
	let url8  = URL.parse('https://[::1]:1337/what/ever.html?q=u&e=r&y#and-a-hash');
	let url9  = URL.parse('stealth:settings');
	let url10 = URL.parse('stealth:search?query=This+is+a+test#and-a-hash');
	let url11 = URL.parse('/what/ever.html');
	let url12 = URL.parse('file:///what/ever.html?q=u&e=r&y#and-a-hash');
	let url13 = URL.parse('ftp://localhost/what/ever.html');
	let url14 = URL.parse('ftp://thinkpad:1337/what/ever.html?q=u&e=r&y#and-a-hash');
	let url15 = URL.parse('unknown://domain.tld/what/ever.html');
	let url16 = URL.parse('unknown://sub.domain.tld:1337/what/ever.html?q=u&e=r&y#and-a-hash');

	assert(URL.isURL(url1),  true);
	assert(URL.isURL(url2),  true);
	assert(URL.isURL(url3),  true);
	assert(URL.isURL(url4),  true);
	assert(URL.isURL(url5),  true);
	assert(URL.isURL(url6),  true);
	assert(URL.isURL(url7),  true);
	assert(URL.isURL(url8),  true);
	assert(URL.isURL(url9),  true);
	assert(URL.isURL(url10), true);
	assert(URL.isURL(url11), true);
	assert(URL.isURL(url12), true);
	assert(URL.isURL(url13), true);
	assert(URL.isURL(url14), true);
	assert(URL.isURL(url15), false);
	assert(URL.isURL(url16), false);

});

describe('URL.parse()/protocol', function(assert) {

	let url1  = URL.parse('http://localhost/what/ever.html');
	let url2  = URL.parse('http://thinkpad:1337/what/ever.html?q=u&e=r&y#and-a-hash');
	let url3  = URL.parse('https://domain.tld/what/ever.html');
	let url4  = URL.parse('https://sub.domain.tld:1337/what/ever.html?q=u&e=r&y#and-a-hash');
	let url5  = URL.parse('http://127.0.0.1/what/ever.html');
	let url6  = URL.parse('http://127.0.0.1:1337/what/ever.html?q=u&e=r&y#and-a-hash');
	let url7  = URL.parse('https://[::1]/what/ever.html');
	let url8  = URL.parse('https://[::1]:1337/what/ever.html?q=u&e=r&y#and-a-hash');
	let url9  = URL.parse('stealth:settings');
	let url10 = URL.parse('stealth:search?query=This+is+a+test#and-a-hash');
	let url11 = URL.parse('/what/ever.html');
	let url12 = URL.parse('file:///what/ever.html?q=u&e=r&y#and-a-hash');
	let url13 = URL.parse('ftp://localhost/what/ever.html');
	let url14 = URL.parse('ftp://thinkpad:1337/what/ever.html?q=u&e=r&y#and-a-hash');
	let url15 = URL.parse('unknown://domain.tld/what/ever.html');
	let url16 = URL.parse('unknown://sub.domain.tld:1337/what/ever.html?q=u&e=r&y#and-a-hash');

	assert(url1.protocol,  'http');
	assert(url2.protocol,  'http');
	assert(url3.protocol,  'https');
	assert(url4.protocol,  'https');
	assert(url5.protocol,  'http');
	assert(url6.protocol,  'http');
	assert(url7.protocol,  'https');
	assert(url8.protocol,  'https');
	assert(url9.protocol,  'stealth');
	assert(url10.protocol, 'stealth');
	assert(url11.protocol, 'file');
	assert(url12.protocol, 'file');
	assert(url13.protocol, 'ftp');
	assert(url14.protocol, 'ftp');
	assert(url15.protocol, 'unknown');
	assert(url16.protocol, 'unknown');

});

describe('URL.parse()/hostname', function(assert) {

	let url1 = URL.parse('http://localhost/what/ever.html');
	let url2 = URL.parse('http://thinkpad:1337/what/ever.html?q=u&e=r&y#and-a-hash');

	assert(url1.protocol,  'http');
	assert(url1.domain,    'localhost');
	assert(url1.hash,      null);
	assert(url1.host,      null);
	assert(url1.path,      '/what/ever.html');
	assert(url1.port,      80);
	assert(url1.query,     null);
	assert(url1.subdomain, null);

	assert(url2.protocol,  'http');
	assert(url2.domain,    'thinkpad');
	assert(url2.hash,      'and-a-hash');
	assert(url2.host,      null);
	assert(url2.path,      '/what/ever.html');
	assert(url2.port,      1337);
	assert(url2.query,     'q=u&e=r&y');
	assert(url2.subdomain, null);

});

describe('URL.parse()/domain', function(assert) {

	let url1 = URL.parse('https://domain.tld/what/ever.html');
	let url2 = URL.parse('https://sub.domain.tld:1337/what/ever.html?q=u&e=r&y#and-a-hash');

	assert(url1.protocol,  'https');
	assert(url1.domain,    'domain.tld');
	assert(url1.hash,      null);
	assert(url1.host,      null);
	assert(url1.path,      '/what/ever.html');
	assert(url1.port,      443);
	assert(url1.query,     null);
	assert(url1.subdomain, null);

	assert(url2.protocol,  'https');
	assert(url2.domain,    'domain.tld');
	assert(url2.hash,      'and-a-hash');
	assert(url2.host,      null);
	assert(url2.path,      '/what/ever.html');
	assert(url2.port,      1337);
	assert(url2.query,     'q=u&e=r&y');
	assert(url2.subdomain, 'sub');

});

describe('URL.parse()/ipv4', function(assert) {

	let url1 = URL.parse('http://127.0.0.1/what/ever.html');
	let url2 = URL.parse('http://127.0.0.1:1337/what/ever.html?q=u&e=r&y#and-a-hash');

	assert(url1.protocol,  'http');
	assert(url1.domain,    null);
	assert(url1.hash,      null);
	assert(url1.host,      '127.0.0.1');
	assert(url1.path,      '/what/ever.html');
	assert(url1.port,      80);
	assert(url1.query,     null);
	assert(url1.subdomain, null);

	assert(url2.protocol,  'http');
	assert(url2.domain,    null);
	assert(url2.hash,      'and-a-hash');
	assert(url2.host,      '127.0.0.1');
	assert(url2.path,      '/what/ever.html');
	assert(url2.port,      1337);
	assert(url2.query,     'q=u&e=r&y');
	assert(url2.subdomain, null);

});

describe('URL.parse()/ipv6', function(assert) {

	let url1 = URL.parse('https://[::1]/what/ever.html');
	let url2 = URL.parse('https://[::1]:1337/what/ever.html?q=u&e=r&y#and-a-hash');

	assert(url1.protocol,  'https');
	assert(url1.domain,    null);
	assert(url1.hash,      null);
	assert(url1.host,      '[0000:0000:0000:0000:0000:0000:0000:0001]');
	assert(url1.path,      '/what/ever.html');
	assert(url1.port,      443);
	assert(url1.query,     null);
	assert(url1.subdomain, null);

	assert(url2.protocol,  'https');
	assert(url2.domain,    null);
	assert(url2.hash,      'and-a-hash');
	assert(url2.host,      '[0000:0000:0000:0000:0000:0000:0000:0001]');
	assert(url2.path,      '/what/ever.html');
	assert(url2.port,      1337);
	assert(url2.query,     'q=u&e=r&y');
	assert(url2.subdomain, null);

});

describe('URL.parse()/stealth', function(assert) {

	let url1 = URL.parse('stealth:settings');
	let url2 = URL.parse('stealth:search?query=This+is+a+test#and-a-hash');

	assert(url1.protocol,  'stealth');
	assert(url1.domain,    'settings');
	assert(url1.hash,      null);
	assert(url1.host,      null);
	assert(url1.path,      '/');
	assert(url1.port,      null);
	assert(url1.query,     null);
	assert(url1.subdomain, null);

	assert(url2.protocol,  'stealth');
	assert(url2.domain,    'search');
	assert(url2.hash,      'and-a-hash');
	assert(url2.host,      null);
	assert(url2.path,      '/');
	assert(url2.port,      null);
	assert(url2.query,     'query=This+is+a+test');
	assert(url2.subdomain, null);

});

describe('URL.parse()/file', function(assert) {

	let url1 = URL.parse('/what/ever.html');
	let url2 = URL.parse('file:///what/ever.html?q=u&e=r&y#and-a-hash');

	assert(url1.protocol,  'file');
	assert(url1.domain,    null);
	assert(url1.hash,      null);
	assert(url1.host,      null);
	assert(url1.path,      '/what/ever.html');
	assert(url1.port,      null);
	assert(url1.query,     null);
	assert(url1.subdomain, null);

	assert(url2.protocol,  'file');
	assert(url2.domain,    null);
	assert(url2.hash,      'and-a-hash');
	assert(url2.host,      null);
	assert(url2.path,      '/what/ever.html');
	assert(url2.port,      null);
	assert(url2.query,     'q=u&e=r&y');
	assert(url2.subdomain, null);

});

describe('URL.resolve()/absolute', function(assert) {

	let url1  = URL.resolve('http://localhost/what/ever',            '/some/thing.html');
	let url2  = URL.resolve('http://thinkpad:1337/what/ever.html',   '/some/thing.html?q=u&e=r&y#and-a-hash');
	let url3  = URL.resolve('https://domain.tld/what/ever.html',     '/some/thing.html');
	let url4  = URL.resolve('https://sub.domain.tld/what/ever.html', '/some/thing.html?q=u&e=r&y#and-a-hash');
	let url5  = URL.resolve('http://127.0.0.1/what/ever',            '/some/thing.html');
	let url6  = URL.resolve('http://127.0.0.1:1337/what/ever.html',  '/some/thing.html?q=u&e=r&y#and-a-hash');
	let url7  = URL.resolve('https://[::1]/what/ever',               '/some/thing.html');
	let url8  = URL.resolve('https://[::1]:1337/what/ever.html',     '/some/thing.html?q=u&e=r&y#and-a-hash');
	let url9  = URL.resolve('http://localhost/what/ever',            '/../.././.././some/thing.html');
	let url10 = URL.resolve('http://thinkpad:1337/what/ever.html',   '/../.././.././some/./././thing.html?q=u&e=r&y#and-a-hash');
	let url11 = URL.resolve('https://domain.tld/what/ever.html',     '/../.././.././some/thing.html');
	let url12 = URL.resolve('https://sub.domain.tld/what/ever.html', '/../.././.././some/./././thing.html?q=u&e=r&y#and-a-hash');
	let url13 = URL.resolve('http://127.0.0.1/what/ever',            '/../.././.././some/thing.html');
	let url14 = URL.resolve('http://127.0.0.1:1337/what/ever.html',  '/../.././.././some/./././thing.html?q=u&e=r&y#and-a-hash');
	let url15 = URL.resolve('https://[::1]/what/ever',               '/../.././.././some/thing.html');
	let url16 = URL.resolve('https://[::1]:1337/what/ever.html',     '/../.././.././some/./././thing.html?q=u&e=r&y#and-a-hash');

	assert(url1.link,  'http://localhost/some/thing.html');
	assert(url2.link,  'http://thinkpad:1337/some/thing.html?q=u&e=r&y');
	assert(url3.link,  'https://domain.tld/some/thing.html');
	assert(url4.link,  'https://sub.domain.tld/some/thing.html?q=u&e=r&y');
	assert(url5.link,  'http://127.0.0.1/some/thing.html');
	assert(url6.link,  'http://127.0.0.1:1337/some/thing.html?q=u&e=r&y');
	assert(url7.link,  'https://[0000:0000:0000:0000:0000:0000:0000:0001]/some/thing.html');
	assert(url8.link,  'https://[0000:0000:0000:0000:0000:0000:0000:0001]:1337/some/thing.html?q=u&e=r&y');
	assert(url9.link,  'http://localhost/some/thing.html');
	assert(url10.link, 'http://thinkpad:1337/some/thing.html?q=u&e=r&y');
	assert(url11.link, 'https://domain.tld/some/thing.html');
	assert(url12.link, 'https://sub.domain.tld/some/thing.html?q=u&e=r&y');
	assert(url13.link, 'http://127.0.0.1/some/thing.html');
	assert(url14.link, 'http://127.0.0.1:1337/some/thing.html?q=u&e=r&y');
	assert(url15.link, 'https://[0000:0000:0000:0000:0000:0000:0000:0001]/some/thing.html');
	assert(url16.link, 'https://[0000:0000:0000:0000:0000:0000:0000:0001]:1337/some/thing.html?q=u&e=r&y');

});

describe('URL.resolve()/relative', function(assert) {

	let url1  = URL.resolve('http://localhost/what/ever',            './some/thing.html');
	let url2  = URL.resolve('http://thinkpad:1337/what/ever.html',   './some/thing.html?q=u&e=r&y#and-a-hash');
	let url3  = URL.resolve('https://domain.tld/what/ever.html',     './some/thing.html');
	let url4  = URL.resolve('https://sub.domain.tld/what/ever.html', './some/thing.html?q=u&e=r&y#and-a-hash');
	let url5  = URL.resolve('http://127.0.0.1/what/ever',            './some/thing.html');
	let url6  = URL.resolve('http://127.0.0.1:1337/what/ever.html',  './some/thing.html?q=u&e=r&y#and-a-hash');
	let url7  = URL.resolve('https://[::1]/what/ever',               './some/thing.html');
	let url8  = URL.resolve('https://[::1]:1337/what/ever.html',     './some/thing.html?q=u&e=r&y#and-a-hash');
	let url9  = URL.resolve('http://localhost/what/ever',            './../.././.././some/thing.html');
	let url10 = URL.resolve('http://thinkpad:1337/what/ever.html',   './../.././.././some/./././thing.html?q=u&e=r&y#and-a-hash');
	let url11 = URL.resolve('https://domain.tld/what/ever.html',     './../.././.././some/thing.html');
	let url12 = URL.resolve('https://sub.domain.tld/what/ever.html', './../.././.././some/./././thing.html?q=u&e=r&y#and-a-hash');
	let url13 = URL.resolve('http://127.0.0.1/what/ever',            './../.././.././some/thing.html');
	let url14 = URL.resolve('http://127.0.0.1:1337/what/ever.html',  './../.././.././some/./././thing.html?q=u&e=r&y#and-a-hash');
	let url15 = URL.resolve('https://[::1]/what/ever',               './../.././.././some/thing.html');
	let url16 = URL.resolve('https://[::1]:1337/what/ever.html',     './../.././.././some/./././thing.html?q=u&e=r&y#and-a-hash');

	assert(url1.link,  'http://localhost/what/some/thing.html');
	assert(url2.link,  'http://thinkpad:1337/what/some/thing.html?q=u&e=r&y');
	assert(url3.link,  'https://domain.tld/what/some/thing.html');
	assert(url4.link,  'https://sub.domain.tld/what/some/thing.html?q=u&e=r&y');
	assert(url5.link,  'http://127.0.0.1/what/some/thing.html');
	assert(url6.link,  'http://127.0.0.1:1337/what/some/thing.html?q=u&e=r&y');
	assert(url7.link,  'https://[0000:0000:0000:0000:0000:0000:0000:0001]/what/some/thing.html');
	assert(url8.link,  'https://[0000:0000:0000:0000:0000:0000:0000:0001]:1337/what/some/thing.html?q=u&e=r&y');
	assert(url9.link,  'http://localhost/some/thing.html');
	assert(url10.link, 'http://thinkpad:1337/some/thing.html?q=u&e=r&y');
	assert(url11.link, 'https://domain.tld/some/thing.html');
	assert(url12.link, 'https://sub.domain.tld/some/thing.html?q=u&e=r&y');
	assert(url13.link, 'http://127.0.0.1/some/thing.html');
	assert(url14.link, 'http://127.0.0.1:1337/some/thing.html?q=u&e=r&y');
	assert(url15.link, 'https://[0000:0000:0000:0000:0000:0000:0000:0001]/some/thing.html');
	assert(url16.link, 'https://[0000:0000:0000:0000:0000:0000:0000:0001]:1337/some/thing.html?q=u&e=r&y');

});

describe('URL.resolve()/protocol', function(assert) {

	let url1  = URL.resolve('http://localhost/what/ever',                     '//some/thing.html');
	let url2  = URL.resolve('http://thinkpad:1337/what/ever.html',            '//some.thing.tld:13337/else.html?q=u&e=r&y#and-a-hash');
	let url3  = URL.resolve('https://domain.tld/what/ever',                   '//some/thing.html');
	let url4  = URL.resolve('https://sub.domain.tld:1337/what/ever.html',     '//some.thing.tld:13337/else.html?q=u&e=r&y#and-a-hash');
	let url5  = URL.resolve('http://127.0.0.1/what/ever',                     '//some/thing.html');
	let url6  = URL.resolve('http://127.0.0.1:1337/what/ever.html',           '//some.thing.tld:13337/else.html?q=u&e=r&y#and-a-hash');
	let url7  = URL.resolve('https://[::1]/what/ever',                        '//some/thing.html');
	let url8  = URL.resolve('https://[::1]:1337/what/ever.html',              '//some.thing.tld:13337/else.html?q=u&e=r&y#and-a-hash');
	let url9  = URL.resolve('stealth:settings',                               '//some/thing.html');
	let url10 = URL.resolve('stealth:search?query=This+is+a+test#and-a-hash', '//some.thing.tld:13337/else.html?q=u&e=r&y#and-a-hash');
	let url11 = URL.resolve('/what/ever',                                     '//some/thing.html');
	let url12 = URL.resolve('file:///what/ever.html',                         '//some.thing.tld:13337/else.html?q=u&e=r&y#and-a-hash');
	let url13 = URL.resolve('ftp://localhost/what/ever',                      '//some/thing.html');
	let url14 = URL.resolve('ftp://thinkpad:1337/what/ever.html',             '//some.thing.tld:13337/else.html?q=u&e=r&y#and-a-hash');
	let url15 = URL.resolve('unknown://domain.tld/what/ever.html',            '//some/thing.html');
	let url16 = URL.resolve('unknown://sub.domain.tld:1337/what/ever.html',   '//some.thing.tld:13337/else.html?q=u&e=r&y#and-a-hash');

	assert(url1.link,  'http://some/thing.html');
	assert(url2.link,  'http://some.thing.tld:13337/else.html?q=u&e=r&y');
	assert(url3.link,  'https://some/thing.html');
	assert(url4.link,  'https://some.thing.tld:13337/else.html?q=u&e=r&y');
	assert(url5.link,  'http://some/thing.html');
	assert(url6.link,  'http://some.thing.tld:13337/else.html?q=u&e=r&y');
	assert(url7.link,  'https://some/thing.html');
	assert(url8.link,  'https://some.thing.tld:13337/else.html?q=u&e=r&y');
	assert(url9.link,  'stealth:some');
	assert(url10.link, 'stealth:some.thing.tld?q=u&e=r&y');
	assert(url11.link, 'https://some/thing.html');
	assert(url12.link, 'https://some.thing.tld:13337/else.html?q=u&e=r&y');
	assert(url13.link, 'ftp://some/thing.html');
	assert(url14.link, 'ftp://some.thing.tld:13337/else.html?q=u&e=r&y');
	assert(url15.link, 'unknown://some/thing.html');
	assert(url16.link, 'unknown://some.thing.tld:13337/else.html?q=u&e=r&y');

});

describe('URL.render()', function(assert) {

	let url1  = URL.render(build_domain('http',  null,  'localhost',    80, '/what/ever.html', null, null));
	let url2  = URL.render(build_domain('http',  null,  'thinkpad',   1337, '/what/ever.html', 'q=u&e=r&y', 'and-a-hash'));
	let url3  = URL.render(build_domain('https', null,  'domain.tld',  443, '/what/ever.html', null, null));
	let url4  = URL.render(build_domain('https', 'sub', 'domain.tld', 1337, '/what/ever.html', 'q=u&e=r&y', 'and-a-hash'));
	let url5  = URL.render(build_host('http',  '127.0.0.1',    80, '/what/ever.html', null, null));
	let url6  = URL.render(build_host('http',  '127.0.0.1',  1337, '/what/ever.html', 'q=u&e=r&y', 'and-a-hash'));
	let url7  = URL.render(build_host('https', '[::1]',       443, '/what/ever.html', null, null));
	let url8  = URL.render(build_host('https', '[::1]',      1337, '/what/ever.html', 'q=u&e=r&y', 'and-a-hash'));
	let url9  = URL.render(build_domain('stealth', null, 'settings', null, null, null, null));
	let url10 = URL.render(build_domain('stealth', null, 'search',   null, null, 'query=This+is+a+test', 'and-a-hash'));
	let url11 = URL.render(build_file('file', '/what/ever.html', null, null));
	let url12 = URL.render(build_file('file', '/what/ever.html', 'q=u&e=r&y', 'and-a-hash'));
	let url13 = URL.render(build_domain('ftp', null, 'localhost',  21, '/what/ever.html', null, null));
	let url14 = URL.render(build_domain('ftp', null, 'thinkpad', 1337, '/what/ever.html', 'q=u&e=r&y', 'and-a-hash'));
	let url15 = URL.render(build_domain('unknown', null,  'domain.tld', null, '/what/ever.html', null, null));
	let url16 = URL.render(build_domain('unknown', 'sub', 'domain.tld', 1337, '/what/ever.html', 'q=u&e=r&y', 'and-a-hash'));

	assert(url1,  'http://localhost/what/ever.html');
	assert(url2,  'http://thinkpad:1337/what/ever.html?q=u&e=r&y');
	assert(url3,  'https://domain.tld/what/ever.html');
	assert(url4,  'https://sub.domain.tld:1337/what/ever.html?q=u&e=r&y');
	assert(url5,  'http://127.0.0.1/what/ever.html');
	assert(url6,  'http://127.0.0.1:1337/what/ever.html?q=u&e=r&y');
	assert(url7,  'https://[::1]/what/ever.html');
	assert(url8,  'https://[::1]:1337/what/ever.html?q=u&e=r&y');
	assert(url9,  'stealth:settings');
	assert(url10, 'stealth:search?query=This+is+a+test');
	assert(url11, 'file:///what/ever.html');
	assert(url12, 'file:///what/ever.html?q=u&e=r&y');
	assert(url13, 'ftp://localhost/what/ever.html');
	assert(url14, 'ftp://thinkpad:1337/what/ever.html?q=u&e=r&y');
	assert(url15, 'unknown://domain.tld/what/ever.html');
	assert(url16, 'unknown://sub.domain.tld:1337/what/ever.html?q=u&e=r&y');

});

describe('URL.sort()', function(assert) {

	let sorted = URL.sort([
		URL.parse('http://localhost/what/ever.html'),
		URL.parse('http://thinkpad:1337/what/ever.html?q=u&e=r&y'),
		URL.parse('https://domain.tld/what/ever.html'),
		URL.parse('https://sub.domain.tld:1337/what/ever.html?q=u&e=r&y'),
		URL.parse('http://127.0.0.1/what/ever.html'),
		URL.parse('http://127.0.0.1:1337/what/ever.html?q=u&e=r&y'),
		URL.parse('https://[::1]/what/ever.html'),
		URL.parse('https://[::1]:1337/what/ever.html?q=u&e=r&y'),
		URL.parse('stealth:settings'),
		URL.parse('stealth:search?query=This+is+a+test'),
		URL.parse('file:///what/ever.html'),
		URL.parse('file:///what/ever.html?q=u&e=r&y'),
		URL.parse('ftp://localhost/what/ever.html'),
		URL.parse('ftp://thinkpad:1337/what/ever.html?q=u&e=r&y'),
		URL.parse('unknown://domain.tld/what/ever.html'),
		URL.parse('unknown://sub.domain.tld:1337/what/ever.html?q=u&e=r&y')
	]);

	assert(sorted.length > 0);
	assert(sorted.length, 14);

	assert(sorted[0].link,  'file:///what/ever.html');
	assert(sorted[1].link,  'file:///what/ever.html?q=u&e=r&y');
	assert(sorted[2].link,  'ftp://localhost/what/ever.html');
	assert(sorted[3].link,  'ftp://thinkpad:1337/what/ever.html?q=u&e=r&y');
	assert(sorted[4].link,  'http://127.0.0.1/what/ever.html');
	assert(sorted[5].link,  'http://127.0.0.1:1337/what/ever.html?q=u&e=r&y');
	assert(sorted[6].link,  'http://localhost/what/ever.html');
	assert(sorted[7].link,  'http://thinkpad:1337/what/ever.html?q=u&e=r&y');
	assert(sorted[8].link,  'https://[0000:0000:0000:0000:0000:0000:0000:0001]/what/ever.html');
	assert(sorted[9].link,  'https://[0000:0000:0000:0000:0000:0000:0000:0001]:1337/what/ever.html?q=u&e=r&y');
	assert(sorted[10].link, 'https://domain.tld/what/ever.html');
	assert(sorted[11].link, 'https://sub.domain.tld:1337/what/ever.html?q=u&e=r&y');
	assert(sorted[12].link, 'stealth:search?query=This+is+a+test');
	assert(sorted[13].link, 'stealth:settings');

});

describe('URL.toDomain()', function(assert) {

	let domain1  = URL.toDomain(URL.parse('http://localhost/what/ever.html'));
	let domain2  = URL.toDomain(URL.parse('http://thinkpad:1337/what/ever.html?q=u&e=r&y#and-a-hash'));
	let domain3  = URL.toDomain(URL.parse('https://domain.tld/what/ever.html'));
	let domain4  = URL.toDomain(URL.parse('https://sub.domain.tld:1337/what/ever.html?q=u&e=r&y#and-a-hash'));
	let domain5  = URL.toDomain(URL.parse('http://127.0.0.1/what/ever.html'));
	let domain6  = URL.toDomain(URL.parse('http://127.0.0.1:1337/what/ever.html?q=u&e=r&y#and-a-hash'));
	let domain7  = URL.toDomain(URL.parse('https://[::1]/what/ever.html'));
	let domain8  = URL.toDomain(URL.parse('https://[::1]:1337/what/ever.html?q=u&e=r&y#and-a-hash'));
	let domain9  = URL.toDomain(URL.parse('stealth:settings'));
	let domain10 = URL.toDomain(URL.parse('stealth:search?query=This+is+a+test#and-a-hash'));
	let domain11 = URL.toDomain(URL.parse('/what/ever.html'));
	let domain12 = URL.toDomain(URL.parse('file:///what/ever.html?q=u&e=r&y#and-a-hash'));
	let domain13 = URL.toDomain(URL.parse('ftp://localhost/what/ever.html'));
	let domain14 = URL.toDomain(URL.parse('ftp://thinkpad:1337/what/ever.html?q=u&e=r&y#and-a-hash'));
	let domain15 = URL.toDomain(URL.parse('unknown://domain.tld/what/ever.html'));
	let domain16 = URL.toDomain(URL.parse('unknown://sub.domain.tld:1337/what/ever.html?q=u&e=r&y#and-a-hash'));

	assert(domain1,  'localhost');
	assert(domain2,  'thinkpad');
	assert(domain3,  'domain.tld');
	assert(domain4,  'sub.domain.tld');
	assert(domain5,  null);
	assert(domain6,  null);
	assert(domain7,  null);
	assert(domain8,  null);
	assert(domain9,  'settings');
	assert(domain10, 'search');
	assert(domain11, null);
	assert(domain12, null);
	assert(domain13, 'localhost');
	assert(domain14, 'thinkpad');
	assert(domain15, 'domain.tld');
	assert(domain16, 'sub.domain.tld');

});

describe('URL.toHost()', function(assert) {

	let domain1  = URL.toHost(URL.parse('http://localhost/what/ever.html'));
	let domain2  = URL.toHost(URL.parse('http://thinkpad:1337/what/ever.html?q=u&e=r&y#and-a-hash'));
	let domain3  = URL.toHost(URL.parse('https://domain.tld/what/ever.html'));
	let domain4  = URL.toHost(URL.parse('https://sub.domain.tld:1337/what/ever.html?q=u&e=r&y#and-a-hash'));
	let domain5  = URL.toHost(URL.parse('http://127.0.0.1/what/ever.html'));
	let domain6  = URL.toHost(URL.parse('http://127.0.0.1:1337/what/ever.html?q=u&e=r&y#and-a-hash'));
	let domain7  = URL.toHost(URL.parse('https://[::1]/what/ever.html'));
	let domain8  = URL.toHost(URL.parse('https://[::1]:1337/what/ever.html?q=u&e=r&y#and-a-hash'));
	let domain9  = URL.toHost(URL.parse('stealth:settings'));
	let domain10 = URL.toHost(URL.parse('stealth:search?query=This+is+a+test#and-a-hash'));
	let domain11 = URL.toHost(URL.parse('/what/ever.html'));
	let domain12 = URL.toHost(URL.parse('file:///what/ever.html?q=u&e=r&y#and-a-hash'));
	let domain13 = URL.toHost(URL.parse('ftp://localhost/what/ever.html'));
	let domain14 = URL.toHost(URL.parse('ftp://thinkpad:1337/what/ever.html?q=u&e=r&y#and-a-hash'));
	let domain15 = URL.toHost(URL.parse('unknown://domain.tld/what/ever.html'));
	let domain16 = URL.toHost(URL.parse('unknown://sub.domain.tld:1337/what/ever.html?q=u&e=r&y#and-a-hash'));

	assert(domain1,  '127.0.0.1');
	assert(domain2,  null);
	assert(domain3,  null);
	assert(domain4,  null);
	assert(domain5,  '127.0.0.1');
	assert(domain6,  '127.0.0.1');
	assert(domain7,  '[0000:0000:0000:0000:0000:0000:0000:0001]');
	assert(domain8,  '[0000:0000:0000:0000:0000:0000:0000:0001]');
	assert(domain9,  null);
	assert(domain10, null);
	assert(domain11, null);
	assert(domain12, null);
	assert(domain13, '127.0.0.1');
	assert(domain14, null);
	assert(domain15, null);
	assert(domain16, null);

});


export default finish('stealth/parser/URL', {
	internet: false,
	network:  false
});

