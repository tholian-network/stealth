
import { Buffer, isFunction              } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { DNSS                            } from '../../../stealth/source/connection/DNSS.mjs';
import { IP                              } from '../../../stealth/source/parser/IP.mjs';
import { URL                             } from '../../../stealth/source/parser/URL.mjs';



before('DNSS.upgrade()', function(assert) {

	assert(isFunction(DNSS.upgrade), true);

	this.connection = DNSS.upgrade(null, URL.parse('dnss://127.0.0.1:13337'));

	this.connection.once('@connect', () => {
		assert(true);
	});

});

describe('DNSS.connect()', function(assert) {

	assert(isFunction(DNSS.connect), true);

	let url        = Object.assign(URL.parse('dnss://cloudflare-dns.com:853'), { hosts: [ IP.parse('1.0.0.1'), IP.parse('2606:4700:4700::1001'), IP.parse('1.1.1.1'), IP.parse('2606:4700:4700::1111') ]});
	let connection = DNSS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNSS.disconnect()', function(assert) {

	assert(isFunction(DNSS.connect),    true);
	assert(isFunction(DNSS.disconnect), true);

	let url        = Object.assign(URL.parse('dnss://cloudflare-dns.com:853'), { hosts: [ IP.parse('1.0.0.1'), IP.parse('2606:4700:4700::1001'), IP.parse('1.1.1.1'), IP.parse('2606:4700:4700::1111') ]});
	let connection = DNSS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			assert(DNSS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNSS.send()/client/A', function(assert) {

	assert(isFunction(DNSS.connect),    true);
	assert(isFunction(DNSS.disconnect), true);
	assert(isFunction(DNSS.send),       true);

	let url        = Object.assign(URL.parse('dnss://cloudflare-dns.com:853'), { hosts: [ IP.parse('1.0.0.1'), IP.parse('2606:4700:4700::1001'), IP.parse('1.1.1.1'), IP.parse('2606:4700:4700::1111') ]});
	let connection = DNSS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   13337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'A',
					value:  null
				}],
				answers: [{
					domain: 'example.com',
					type:   'A',
					value:  IP.parse('93.184.216.34')
				}]
			}
		});

		setTimeout(() => {
			assert(DNSS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNSS.send(connection, {
			headers: {
				'@id': 13337
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'A',
					value:  null
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNSS.send()/client/AAAA', function(assert) {

	assert(isFunction(DNSS.connect),    true);
	assert(isFunction(DNSS.disconnect), true);
	assert(isFunction(DNSS.send),       true);

	let url        = Object.assign(URL.parse('dnss://cloudflare-dns.com:853'), { hosts: [ IP.parse('1.0.0.1'), IP.parse('2606:4700:4700::1001'), IP.parse('1.1.1.1'), IP.parse('2606:4700:4700::1111') ]});
	let connection = DNSS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   13337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'AAAA',
					value:  null
				}],
				answers: [{
					domain: 'example.com',
					type:   'AAAA',
					value:  IP.parse('2606:2800:220:1:248:1893:25c8:1946')
				}]
			}
		});

		setTimeout(() => {
			assert(DNSS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNSS.send(connection, {
			headers: {
				'@id': 13337
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'AAAA',
					value:  null
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNSS.send()/client/CNAME', function(assert) {

	assert(isFunction(DNSS.connect),    true);
	assert(isFunction(DNSS.disconnect), true);
	assert(isFunction(DNSS.send),       true);

	let url        = Object.assign(URL.parse('dnss://cloudflare-dns.com:853'), { hosts: [ IP.parse('1.0.0.1'), IP.parse('2606:4700:4700::1001'), IP.parse('1.1.1.1'), IP.parse('2606:4700:4700::1111') ]});
	let connection = DNSS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   13337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'prophet.heise.de',
					type:   'CNAME',
					value:  null
				}],
				answers: [{
					domain: 'prophet.heise.de',
					type:   'CNAME',
					value:  'heise02.webtrekk.net'
				}]
			}
		});

		setTimeout(() => {
			assert(DNSS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNSS.send(connection, {
			headers: {
				'@id': 13337
			},
			payload: {
				questions: [{
					domain: 'prophet.heise.de',
					type:   'CNAME',
					value:  null
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNSS.send()/client/MX', function(assert) {

	assert(isFunction(DNSS.connect),    true);
	assert(isFunction(DNSS.disconnect), true);
	assert(isFunction(DNSS.send),       true);

	let url        = Object.assign(URL.parse('dnss://cloudflare-dns.com:853'), { hosts: [ IP.parse('1.0.0.1'), IP.parse('2606:4700:4700::1001'), IP.parse('1.1.1.1'), IP.parse('2606:4700:4700::1111') ]});
	let connection = DNSS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   13337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'github.com',
					type:   'MX',
					value:  null
				}],
				answers: [{
					domain: 'github.com',
					type:   'MX',
					value:  'aspmx.l.google.com',
					weight: 1
				}, {
					domain: 'github.com',
					type:   'MX',
					value:  'alt1.aspmx.l.google.com',
					weight: 5
				}, {
					domain: 'github.com',
					type:   'MX',
					value:  'alt2.aspmx.l.google.com',
					weight: 5
				}, {
					domain: 'github.com',
					type:   'MX',
					value:  'alt3.aspmx.l.google.com',
					weight: 10
				}, {
					domain: 'github.com',
					type:   'MX',
					value:  'alt4.aspmx.l.google.com',
					weight: 10
				}]
			}
		});

		setTimeout(() => {
			assert(DNSS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNSS.send(connection, {
			headers: {
				'@id': 13337
			},
			payload: {
				questions: [{
					domain: 'github.com',
					type:   'MX',
					value:  null
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNSS.send()/client/NS', function(assert) {

	assert(isFunction(DNSS.connect),    true);
	assert(isFunction(DNSS.disconnect), true);
	assert(isFunction(DNSS.send),       true);

	let url        = Object.assign(URL.parse('dnss://cloudflare-dns.com:853'), { hosts: [ IP.parse('1.0.0.1'), IP.parse('2606:4700:4700::1001'), IP.parse('1.1.1.1'), IP.parse('2606:4700:4700::1111') ]});
	let connection = DNSS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   13337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'NS',
					value:  null
				}],
				answers: [{
					domain: 'example.com',
					type:   'NS',
					value:  'a.iana-servers.net'
				}, {
					domain: 'example.com',
					type:   'NS',
					value:  'b.iana-servers.net'
				}]
			}
		});

		setTimeout(() => {
			assert(DNSS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNSS.send(connection, {
			headers: {
				'@id': 13337
			},
			payload: {
				questions: [{
					domain: 'example.com',
					type:   'NS',
					value:  null
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNSS.send()/client/PTR/v4', function(assert) {

	assert(isFunction(DNSS.connect),    true);
	assert(isFunction(DNSS.disconnect), true);
	assert(isFunction(DNSS.send),       true);

	let url        = Object.assign(URL.parse('dnss://cloudflare-dns.com:853'), { hosts: [ IP.parse('1.0.0.1'), IP.parse('2606:4700:4700::1001'), IP.parse('1.1.1.1'), IP.parse('2606:4700:4700::1111') ]});
	let connection = DNSS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   1337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  IP.parse('95.217.163.246')
				}],
				answers: [{
					domain: 'archlinux.org',
					type:   'PTR',
					value:  IP.parse('95.217.163.246')
				}]
			}
		});

		setTimeout(() => {
			assert(DNSS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNSS.send(connection, {
			headers: {
				'@id': 1337
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  IP.parse('95.217.163.246')
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNSS.send()/client/PTR/v6', function(assert) {

	assert(isFunction(DNSS.connect),    true);
	assert(isFunction(DNSS.disconnect), true);
	assert(isFunction(DNSS.send),       true);

	let url        = Object.assign(URL.parse('dnss://cloudflare-dns.com:853'), { hosts: [ IP.parse('1.0.0.1'), IP.parse('2606:4700:4700::1001'), IP.parse('1.1.1.1'), IP.parse('2606:4700:4700::1111') ]});
	let connection = DNSS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   1337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  IP.parse('2a01:04f9:c010:6b1f:0000:0000:0000:0001')
				}],
				answers: [{
					domain: 'archlinux.org',
					type:   'PTR',
					value:  IP.parse('2a01:04f9:c010:6b1f:0000:0000:0000:0001')
				}]
			}
		});

		setTimeout(() => {
			assert(DNSS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNSS.send(connection, {
			headers: {
				'@id': 1337
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  IP.parse('2a01:04f9:c010:6b1f:0000:0000:0000:0001')
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNSS.send()/client/SRV', function(assert) {

	assert(isFunction(DNSS.connect),    true);
	assert(isFunction(DNSS.disconnect), true);
	assert(isFunction(DNSS.send),       true);

	let url         = Object.assign(URL.parse('dnss://cloudflare-dns.com:853'), { hosts: [ IP.parse('1.0.0.1'), IP.parse('2606:4700:4700::1001'), IP.parse('1.1.1.1'), IP.parse('2606:4700:4700::1111') ]});
	let connection1 = DNSS.connect(url);
	let connection2 = DNSS.connect(url);

	connection1.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   13337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: '_stealth._wss.tholian.network',
					type:   'SRV',
					value:  null
				}],
				answers: [{
					domain: '_stealth._wss.tholian.network',
					type:   'SRV',
					value:  'radar.tholian.network',
					weight: 0,
					port:   65432
				}]
			}
		});

		setTimeout(() => {
			assert(DNSS.disconnect(connection1), true);
		}, 0);

	});

	connection1.once('@connect', () => {

		DNSS.send(connection1, {
			headers: {
				'@id': 13337
			},
			payload: {
				questions: [{
					domain: '_stealth._wss.tholian.network',
					type:   'SRV',
					value:  null
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});

	connection1.once('@disconnect', () => {
		assert(true);
	});

	connection2.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   1337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: '_stealth._ws.tholian.network',
					type:   'SRV',
					value:  null
				}],
				answers: [{
					domain: '_stealth._ws.tholian.network',
					type:   'SRV',
					value:  'radar.tholian.network',
					weight: 1,
					port:   65432
				}]
			}
		});

		setTimeout(() => {
			assert(DNSS.disconnect(connection2), true);
		}, 0);

	});

	connection2.once('@connect', () => {

		DNSS.send(connection2, {
			headers: {
				'@id': 1337
			},
			payload: {
				questions: [{
					domain: '_stealth._ws.tholian.network',
					type:   'SRV',
					value:  null
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});

	connection2.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNSS.send()/client/TXT', function(assert) {

	assert(isFunction(DNSS.connect),    true);
	assert(isFunction(DNSS.disconnect), true);
	assert(isFunction(DNSS.send),       true);

	let url        = Object.assign(URL.parse('dnss://cloudflare-dns.com:853'), { hosts: [ IP.parse('1.0.0.1'), IP.parse('2606:4700:4700::1001'), IP.parse('1.1.1.1'), IP.parse('2606:4700:4700::1111') ]});
	let connection = DNSS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   137,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'radar.tholian.network',
					type:   'TXT',
					value:  null
				}],
				answers: [{
					domain: 'radar.tholian.network',
					type:   'TXT',
					value:  [
						Buffer.from('version=X0:2021-12-31', 'utf8')
					]
				}, {
					domain: 'radar.tholian.network',
					type:   'TXT',
					value:  [
						Buffer.from('connection=broadband', 'utf8')
					]
				}]
			}
		});

		setTimeout(() => {
			assert(DNSS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNSS.send(connection, {
			headers: {
				'@id': 137
			},
			payload: {
				questions: [{
					domain: 'radar.tholian.network',
					type:   'TXT',
					value:  null
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

after('DNSS.disconnect()', function(assert) {

	assert(isFunction(DNSS.disconnect), true);

	this.connection.once('@disconnect', () => {
		assert(true);
	});

	assert(DNSS.disconnect(this.connection), true);

	this.connection = null;

});


export default finish('stealth/connection/DNSS', {
	internet: true,
	network:  false,
	ports:    [ 853 ]
});

