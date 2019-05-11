
import { describe, finish } from '../../source/Review.mjs';

import { URL } from '../../../stealth/source/parser/URL.mjs';



const build_domain = (protocol, subdomain, domain, port, path, query, hash) => ({ domain,       hash, host: null, path, port,       protocol, query, subdomain       });
const build_host   = (protocol, host, port, path, query, hash)              => ({ domain: null, hash, host,       path, port,       protocol, query, subdomain: null });
const build_file   = (protocol, path, query, hash)                          => ({ domain: null, hash, host: null, path, port: null, protocol, query, subdomain: null });



describe('URL.isURL', function(assert) {

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

	assert(URL.isURL(url1)  === true);
	assert(URL.isURL(url2)  === true);
	assert(URL.isURL(url3)  === true);
	assert(URL.isURL(url4)  === true);
	assert(URL.isURL(url5)  === true);
	assert(URL.isURL(url6)  === true);
	assert(URL.isURL(url7)  === true);
	assert(URL.isURL(url8)  === true);
	assert(URL.isURL(url9)  === true);
	assert(URL.isURL(url10) === true);
	assert(URL.isURL(url11) === true);
	assert(URL.isURL(url12) === true);
	assert(URL.isURL(url13) === true);
	assert(URL.isURL(url14) === true);
	assert(URL.isURL(url15) === false);
	assert(URL.isURL(url16) === false);

});

describe('URL.parse/protocol', function(assert) {

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

	assert(url1.protocol  === 'http');
	assert(url2.protocol  === 'http');
	assert(url3.protocol  === 'https');
	assert(url4.protocol  === 'https');
	assert(url5.protocol  === 'http');
	assert(url6.protocol  === 'http');
	assert(url7.protocol  === 'https');
	assert(url8.protocol  === 'https');
	assert(url9.protocol  === 'stealth');
	assert(url10.protocol === 'stealth');
	assert(url11.protocol === 'file');
	assert(url12.protocol === 'file');
	assert(url13.protocol === 'ftp');
	assert(url14.protocol === 'ftp');
	assert(url15.protocol === 'unknown');
	assert(url16.protocol === 'unknown');

});

describe('URL.parse/hostname', function(assert) {

	let url1 = URL.parse('http://localhost/what/ever.html');
	let url2 = URL.parse('http://thinkpad:1337/what/ever.html?q=u&e=r&y#and-a-hash');

	assert(url1.protocol  === 'http');
	assert(url1.domain    === 'localhost');
	assert(url1.hash      === null);
	assert(url1.host      === null);
	assert(url1.path      === '/what/ever.html');
	assert(url1.port      === 80);
	assert(url1.query     === null);
	assert(url1.subdomain === null);

	assert(url2.protocol  === 'http');
	assert(url2.domain    === 'thinkpad');
	assert(url2.hash      === 'and-a-hash');
	assert(url2.host      === null);
	assert(url2.path      === '/what/ever.html');
	assert(url2.port      === 1337);
	assert(url2.query     === 'q=u&e=r&y');
	assert(url2.subdomain === null);

});

describe('URL.parse/domain', function(assert) {

	let url1 = URL.parse('https://domain.tld/what/ever.html');
	let url2 = URL.parse('https://sub.domain.tld:1337/what/ever.html?q=u&e=r&y#and-a-hash');

	assert(url1.protocol  === 'https');
	assert(url1.domain    === 'domain.tld');
	assert(url1.hash      === null);
	assert(url1.host      === null);
	assert(url1.path      === '/what/ever.html');
	assert(url1.port      === 443);
	assert(url1.query     === null);
	assert(url1.subdomain === null);

	assert(url2.protocol  === 'https');
	assert(url2.domain    === 'domain.tld');
	assert(url2.hash      === 'and-a-hash');
	assert(url2.host      === null);
	assert(url2.path      === '/what/ever.html');
	assert(url2.port      === 1337);
	assert(url2.query     === 'q=u&e=r&y');
	assert(url2.subdomain === 'sub');

});

describe('URL.parse/ipv4', function(assert) {

	let url1 = URL.parse('http://127.0.0.1/what/ever.html');
	let url2 = URL.parse('http://127.0.0.1:1337/what/ever.html?q=u&e=r&y#and-a-hash');

	assert(url1.protocol  === 'http');
	assert(url1.domain    === null);
	assert(url1.hash      === null);
	assert(url1.host      === '127.0.0.1');
	assert(url1.path      === '/what/ever.html');
	assert(url1.port      === 80);
	assert(url1.query     === null);
	assert(url1.subdomain === null);

	assert(url2.protocol  === 'http');
	assert(url2.domain    === null);
	assert(url2.hash      === 'and-a-hash');
	assert(url2.host      === '127.0.0.1');
	assert(url2.path      === '/what/ever.html');
	assert(url2.port      === 1337);
	assert(url2.query     === 'q=u&e=r&y');
	assert(url2.subdomain === null);

});

describe('URL.parse/ipv6', function(assert) {

	let url1 = URL.parse('https://[::1]/what/ever.html');
	let url2 = URL.parse('https://[::1]:1337/what/ever.html?q=u&e=r&y#and-a-hash');

	assert(url1.protocol  === 'https');
	assert(url1.domain    === null);
	assert(url1.hash      === null);
	assert(url1.host      === '0000:0000:0000:0000:0000:0000:0000:0001');
	assert(url1.path      === '/what/ever.html');
	assert(url1.port      === 443);
	assert(url1.query     === null);
	assert(url1.subdomain === null);

	assert(url2.protocol  === 'https');
	assert(url2.domain    === null);
	assert(url2.hash      === 'and-a-hash');
	assert(url2.host      === '0000:0000:0000:0000:0000:0000:0000:0001');
	assert(url2.path      === '/what/ever.html');
	assert(url2.port      === 1337);
	assert(url2.query     === 'q=u&e=r&y');
	assert(url2.subdomain === null);

});

describe('URL.parse/stealth', function(assert) {

	let url1 = URL.parse('stealth:settings');
	let url2 = URL.parse('stealth:search?query=This+is+a+test#and-a-hash');

	assert(url1.protocol  === 'stealth');
	assert(url1.domain    === 'settings');
	assert(url1.hash      === null);
	assert(url1.host      === null);
	assert(url1.path      === '/');
	assert(url1.port      === null);
	assert(url1.query     === null);
	assert(url1.subdomain === null);

	assert(url2.protocol  === 'stealth');
	assert(url2.domain    === 'search');
	assert(url2.hash      === 'and-a-hash');
	assert(url2.host      === null);
	assert(url2.path      === '/');
	assert(url2.port      === null);
	assert(url2.query     === 'query=This+is+a+test');
	assert(url2.subdomain === null);

});

describe('URL.parse/file', function(assert) {

	let url1 = URL.parse('/what/ever.html');
	let url2 = URL.parse('file:///what/ever.html?q=u&e=r&y#and-a-hash');

	assert(url1.protocol  === 'file');
	assert(url1.domain    === null);
	assert(url1.hash      === null);
	assert(url1.host      === null);
	assert(url1.path      === '/what/ever.html');
	assert(url1.port      === null);
	assert(url1.query     === null);
	assert(url1.subdomain === null);

	assert(url2.protocol  === 'file');
	assert(url2.domain    === null);
	assert(url2.hash      === 'and-a-hash');
	assert(url2.host      === null);
	assert(url2.path      === '/what/ever.html');
	assert(url2.port      === null);
	assert(url2.query     === 'q=u&e=r&y');
	assert(url2.subdomain === null);

});

describe('URL.resolve/absolute', function(assert) {

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

	assert(url1.url  === 'http://localhost/some/thing.html');
	assert(url2.url  === 'http://thinkpad:1337/some/thing.html?q=u&e=r&y');
	assert(url3.url  === 'https://domain.tld/some/thing.html');
	assert(url4.url  === 'https://sub.domain.tld/some/thing.html?q=u&e=r&y');
	assert(url5.url  === 'http://127.0.0.1/some/thing.html');
	assert(url6.url  === 'http://127.0.0.1:1337/some/thing.html?q=u&e=r&y');
	assert(url7.url  === 'https://[0000:0000:0000:0000:0000:0000:0000:0001]/some/thing.html');
	assert(url8.url  === 'https://[0000:0000:0000:0000:0000:0000:0000:0001]:1337/some/thing.html?q=u&e=r&y');
	assert(url9.url  === 'http://localhost/some/thing.html');
	assert(url10.url === 'http://thinkpad:1337/some/thing.html?q=u&e=r&y');
	assert(url11.url === 'https://domain.tld/some/thing.html');
	assert(url12.url === 'https://sub.domain.tld/some/thing.html?q=u&e=r&y');
	assert(url13.url === 'http://127.0.0.1/some/thing.html');
	assert(url14.url === 'http://127.0.0.1:1337/some/thing.html?q=u&e=r&y');
	assert(url15.url === 'https://[0000:0000:0000:0000:0000:0000:0000:0001]/some/thing.html');
	assert(url16.url === 'https://[0000:0000:0000:0000:0000:0000:0000:0001]:1337/some/thing.html?q=u&e=r&y');

});

describe('URL.resolve/relative', function(assert) {

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

	assert(url1.url  === 'http://localhost/what/some/thing.html');
	assert(url2.url  === 'http://thinkpad:1337/what/some/thing.html?q=u&e=r&y');
	assert(url3.url  === 'https://domain.tld/what/some/thing.html');
	assert(url4.url  === 'https://sub.domain.tld/what/some/thing.html?q=u&e=r&y');
	assert(url5.url  === 'http://127.0.0.1/what/some/thing.html');
	assert(url6.url  === 'http://127.0.0.1:1337/what/some/thing.html?q=u&e=r&y');
	assert(url7.url  === 'https://[0000:0000:0000:0000:0000:0000:0000:0001]/what/some/thing.html');
	assert(url8.url  === 'https://[0000:0000:0000:0000:0000:0000:0000:0001]:1337/what/some/thing.html?q=u&e=r&y');
	assert(url9.url  === 'http://localhost/some/thing.html');
	assert(url10.url === 'http://thinkpad:1337/some/thing.html?q=u&e=r&y');
	assert(url11.url === 'https://domain.tld/some/thing.html');
	assert(url12.url === 'https://sub.domain.tld/some/thing.html?q=u&e=r&y');
	assert(url13.url === 'http://127.0.0.1/some/thing.html');
	assert(url14.url === 'http://127.0.0.1:1337/some/thing.html?q=u&e=r&y');
	assert(url15.url === 'https://[0000:0000:0000:0000:0000:0000:0000:0001]/some/thing.html');
	assert(url16.url === 'https://[0000:0000:0000:0000:0000:0000:0000:0001]:1337/some/thing.html?q=u&e=r&y');

});

describe('URL.resolve/protocol', function(assert) {

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


	assert(url1.url  === 'http://some/thing.html');
	assert(url2.url  === 'http://some.thing.tld:13337/else.html?q=u&e=r&y');
	assert(url3.url  === 'https://some/thing.html');
	assert(url4.url  === 'https://some.thing.tld:13337/else.html?q=u&e=r&y');
	assert(url5.url  === 'http://some/thing.html');
	assert(url6.url  === 'http://some.thing.tld:13337/else.html?q=u&e=r&y');
	assert(url7.url  === 'https://some/thing.html');
	assert(url8.url  === 'https://some.thing.tld:13337/else.html?q=u&e=r&y');
	assert(url9.url  === 'stealth:some');
	assert(url10.url === 'stealth:some.thing.tld?q=u&e=r&y');
	assert(url11.url === 'file:///some/thing.html');
	assert(url12.url === 'file:///some.thing.tld:13337/else.html?q=u&e=r&y');
	assert(url13.url === 'ftp://some/thing.html');
	assert(url14.url === 'ftp://some.thing.tld:13337/else.html?q=u&e=r&y');
	assert(url15.url === 'unknown://some/thing.html');
	assert(url16.url === 'unknown://some.thing.tld:13337/else.html?q=u&e=r&y');

});

describe('URL.render', function(assert) {

	let url1  = URL.render(build_domain('http',  null,  'localhost',    80, '/what/ever.html', null, null));
	let url2  = URL.render(build_domain('http',  null,  'thinkpad',   1337, '/what/ever.html', 'q=u&e=r&y', 'and-a-hash'));
	let url3  = URL.render(build_domain('https', null,  'domain.tld',  443, '/what/ever.html', null, null));
	let url4  = URL.render(build_domain('https', 'sub', 'domain.tld', 1337, '/what/ever.html', 'q=u&e=r&y', 'and-a-hash'));
	let url5  = URL.render(build_host('http',  '127.0.0.1',    80, '/what/ever.html', null, null));
	let url6  = URL.render(build_host('http',  '127.0.0.1',  1337, '/what/ever.html', 'q=u&e=r&y', 'and-a-hash'));
	let url7  = URL.render(build_host('https', '::1',         443, '/what/ever.html', null, null));
	let url8  = URL.render(build_host('https', '::1',        1337, '/what/ever.html', 'q=u&e=r&y', 'and-a-hash'));
	let url9  = URL.render(build_domain('stealth', null, 'settings', null, null, null, null));
	let url10 = URL.render(build_domain('stealth', null, 'search',   null, null, 'query=This+is+a+test', 'and-a-hash'));
	let url11 = URL.render(build_file('file', '/what/ever.html', null, null));
	let url12 = URL.render(build_file('file', '/what/ever.html', 'q=u&e=r&y', 'and-a-hash'));
	let url13 = URL.render(build_domain('ftp', null, 'localhost',  21, '/what/ever.html', null, null));
	let url14 = URL.render(build_domain('ftp', null, 'thinkpad', 1337, '/what/ever.html', 'q=u&e=r&y', 'and-a-hash'));
	let url15 = URL.render(build_domain('unknown', null,  'domain.tld', null, '/what/ever.html', null, null));
	let url16 = URL.render(build_domain('unknown', 'sub', 'domain.tld', 1337, '/what/ever.html', 'q=u&e=r&y', 'and-a-hash'));

	assert(url1  === 'http://localhost/what/ever.html');
	assert(url2  === 'http://thinkpad:1337/what/ever.html?q=u&e=r&y');
	assert(url3  === 'https://domain.tld/what/ever.html');
	assert(url4  === 'https://sub.domain.tld:1337/what/ever.html?q=u&e=r&y');
	assert(url5  === 'http://127.0.0.1/what/ever.html');
	assert(url6  === 'http://127.0.0.1:1337/what/ever.html?q=u&e=r&y');
	assert(url7  === 'https://[::1]/what/ever.html');
	assert(url8  === 'https://[::1]:1337/what/ever.html?q=u&e=r&y');
	assert(url9  === 'stealth:settings');
	assert(url10 === 'stealth:search?query=This+is+a+test');
	assert(url11 === 'file:///what/ever.html');
	assert(url12 === 'file:///what/ever.html?q=u&e=r&y');
	assert(url13 === 'ftp://localhost/what/ever.html');
	assert(url14 === 'ftp://thinkpad:1337/what/ever.html?q=u&e=r&y');
	assert(url15 === 'unknown://domain.tld/what/ever.html');
	assert(url16 === 'unknown://sub.domain.tld:1337/what/ever.html?q=u&e=r&y');

});



export default finish('parser/URL');

