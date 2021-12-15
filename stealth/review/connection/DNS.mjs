
import { Buffer, isFunction              } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { DNS                             } from '../../../stealth/source/connection/DNS.mjs';
import { IP                              } from '../../../stealth/source/parser/IP.mjs';
import { URL                             } from '../../../stealth/source/parser/URL.mjs';



before('DNS.upgrade()', function(assert) {

	this.connection = DNS.upgrade(null, URL.parse('dns://127.0.0.1:13337'));

	this.connection.once('@connect', () => {
		assert(true);
	});

});

describe('DNS.connect()', function(assert) {

	assert(isFunction(DNS.connect), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

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

describe('DNS.disconnect()', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNS.send()/client/A', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

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
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
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

describe('DNS.send()/client/AAAA', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

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
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
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

describe('DNS.send()/client/CNAME', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

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
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
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

describe('DNS.send()/client/MX', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

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
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
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

describe('DNS.send()/client/NS', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

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
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
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

describe('DNS.send()/client/PTR/v4', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

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
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
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

describe('DNS.send()/client/PTR/v6', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

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
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
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

describe('DNS.send()/client/SRV', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	let url         = URL.parse('dns://1.0.0.1:53');
	let connection1 = DNS.connect(url);
	let connection2 = DNS.connect(url);

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
			assert(DNS.disconnect(connection1), true);
		}, 0);

	});

	connection1.once('@connect', () => {

		DNS.send(connection1, {
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
			assert(DNS.disconnect(connection2), true);
		}, 0);

	});

	connection2.once('@connect', () => {

		DNS.send(connection2, {
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

describe('DNS.send()/client/TXT', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

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
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
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

describe('DNS.send()/server/A', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	this.connection.once('request', (request) => {

		assert(request, {
			headers: {
				'@id':   1337,
				'@type': 'request'
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
					type:   'A',
					value:  null
				}],
				answers: []
			}
		});

		DNS.send(this.connection, {
			headers: {
				'@id':   1337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
					type:   'A',
					value:  null
				}],
				answers: [{
					domain: 'tholian.local',
					type:   'A',
					value:  IP.parse('192.168.0.123')
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});


	let url        = URL.parse('dns://localhost:13337');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   1337,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
					type:   'A',
					value:  null
				}],
				answers: [{
					domain: 'tholian.local',
					type:   'A',
					value:  IP.parse('192.168.0.123')
				}]
			}
		});

		setTimeout(() => {
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 1337
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
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

describe('DNS.send()/server/AAAA', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	this.connection.once('request', (request) => {

		assert(request, {
			headers: {
				'@id':   1338,
				'@type': 'request'
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
					type:   'AAAA',
					value:  null
				}],
				answers: []
			}
		});

		DNS.send(this.connection, {
			headers: {
				'@id':   1338,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
					type:   'AAAA',
					value:  null
				}],
				answers: [{
					domain: 'tholian.local',
					type:   'AAAA',
					value:  IP.parse('fe80::1337')
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});


	let url        = URL.parse('dns://localhost:13337');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   1338,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
					type:   'AAAA',
					value:  null
				}],
				answers: [{
					domain: 'tholian.local',
					type:   'AAAA',
					value:  IP.parse('fe80::1337')
				}]
			}
		});

		setTimeout(() => {
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 1338
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
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

describe('DNS.send()/server/CNAME', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	this.connection.once('request', (request) => {

		assert(request, {
			headers: {
				'@id':   1339,
				'@type': 'request'
			},
			payload: {
				questions: [{
					domain: 'peers.tholian.local',
					type:   'CNAME',
					value:  null
				}],
				answers: []
			}
		});

		DNS.send(this.connection, {
			headers: {
				'@id':   1339,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'peers.tholian.local',
					type:   'CNAME',
					value:  null
				}],
				answers: [{
					domain: 'peers.tholian.local',
					type:   'CNAME',
					value:  'peers.tholian.network'
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});


	let url        = URL.parse('dns://localhost:13337');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   1339,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'peers.tholian.local',
					type:   'CNAME',
					value:  null
				}],
				answers: [{
					domain: 'peers.tholian.local',
					type:   'CNAME',
					value:  'peers.tholian.network'
				}]
			}
		});

		setTimeout(() => {
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 1339
			},
			payload: {
				questions: [{
					domain: 'peers.tholian.local',
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

describe('DNS.send()/server/MX', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	this.connection.once('request', (request) => {

		assert(request, {
			headers: {
				'@id':   1340,
				'@type': 'request'
			},
			payload: {
				questions: [{
					domain: 'mail.tholian.local',
					type:   'MX',
					value:  null
				}],
				answers: []
			}
		});

		DNS.send(this.connection, {
			headers: {
				'@id':   1340,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'mail.tholian.local',
					type:   'MX',
					value:  null
				}],
				answers: [{
					domain: 'mail.tholian.local',
					type:   'MX',
					value:  'mail.tholian.network',
					weight: 1337
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});


	let url        = URL.parse('dns://localhost:13337');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   1340,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'mail.tholian.local',
					type:   'MX',
					value:  null
				}],
				answers: [{
					domain: 'mail.tholian.local',
					type:   'MX',
					value:  'mail.tholian.network',
					weight: 1337
				}]
			}
		});

		setTimeout(() => {
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 1340
			},
			payload: {
				questions: [{
					domain: 'mail.tholian.local',
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

describe('DNS.send()/server/NS', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	this.connection.once('request', (request) => {

		assert(request, {
			headers: {
				'@id':   1341,
				'@type': 'request'
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
					type:   'NS',
					value:  null
				}],
				answers: []
			}
		});

		DNS.send(this.connection, {
			headers: {
				'@id':   1341,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
					type:   'NS',
					value:  null
				}],
				answers: [{
					domain: 'tholian.local',
					type:   'NS',
					value:  'covert-one.tholian.local'
				}, {
					domain: 'tholian.local',
					type:   'NS',
					value:  'covert-two.tholian.local'
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});


	let url        = URL.parse('dns://localhost:13337');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   1341,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
					type:   'NS',
					value:  null
				}],
				answers: [{
					domain: 'tholian.local',
					type:   'NS',
					value:  'covert-one.tholian.local'
				}, {
					domain: 'tholian.local',
					type:   'NS',
					value:  'covert-two.tholian.local'
				}]
			}
		});

		setTimeout(() => {
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 1341
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
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

describe('DNS.send()/server/PTR/v4', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	this.connection.once('request', (request) => {

		assert(request, {
			headers: {
				'@id':   1342,
				'@type': 'request'
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  IP.parse('192.168.0.123')
				}],
				answers: []
			}
		});

		DNS.send(this.connection, {
			headers: {
				'@id':   1342,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  IP.parse('192.168.0.123')
				}],
				answers: [{
					domain: 'cookiengineer.peers.tholian.network',
					type:   'PTR',
					value:  IP.parse('192.168.0.123')
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});


	let url        = URL.parse('dns://localhost:13337');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   1342,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  IP.parse('192.168.0.123')
				}],
				answers: [{
					domain: 'cookiengineer.peers.tholian.network',
					type:   'PTR',
					value:  IP.parse('192.168.0.123')
				}]
			}
		});

		setTimeout(() => {
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 1342
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  IP.parse('192.168.0.123')
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

describe('DNS.send()/server/PTR/v6', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	this.connection.once('request', (request) => {

		assert(request, {
			headers: {
				'@id':   1343,
				'@type': 'request'
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  IP.parse('fe80::1337')
				}],
				answers: []
			}
		});

		DNS.send(this.connection, {
			headers: {
				'@id':   1343,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  IP.parse('fe80::1337')
				}],
				answers: [{
					domain: 'cookiengineer.peers.tholian.network',
					type:   'PTR',
					value:  IP.parse('fe80::1337')
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});


	let url        = URL.parse('dns://localhost:13337');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   1343,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  IP.parse('fe80::1337')
				}],
				answers: [{
					domain: 'cookiengineer.peers.tholian.network',
					type:   'PTR',
					value:  IP.parse('fe80::1337')
				}]
			}
		});

		setTimeout(() => {
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 1343
			},
			payload: {
				questions: [{
					domain: null,
					type:   'PTR',
					value:  IP.parse('fe80::1337')
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

describe('DNS.send()/server/SRV', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	this.connection.once('request', (request) => {

		assert(request, {
			headers: {
				'@id':   1344,
				'@type': 'request'
			},
			payload: {
				questions: [{
					domain: '_stealth._wss.tholian.local',
					type:   'SRV',
					value:  null
				}],
				answers: []
			}
		});

		DNS.send(this.connection, {
			headers: {
				'@id':   1344,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: '_stealth._wss.tholian.local',
					type:   'SRV',
					value:  null
				}],
				answers: [{
					domain: '_stealth._wss.tholian.local',
					type:   'SRV',
					value:  'covert-one.tholian.local',
					weight: 0,
					port:   65432
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});


	let url        = URL.parse('dns://localhost:13337');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   1344,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: '_stealth._wss.tholian.local',
					type:   'SRV',
					value:  null
				}],
				answers: [{
					domain: '_stealth._wss.tholian.local',
					type:   'SRV',
					value:  'covert-one.tholian.local',
					weight: 0,
					port:   65432
				}]
			}
		});

		setTimeout(() => {
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 1344
			},
			payload: {
				questions: [{
					domain: '_stealth._wss.tholian.local',
					type:   'SRV',
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

describe('DNS.send()/server/TXT', function(assert) {

	assert(isFunction(DNS.connect),    true);
	assert(isFunction(DNS.disconnect), true);
	assert(isFunction(DNS.send),       true);

	this.connection.once('request', (request) => {

		assert(request, {
			headers: {
				'@id':   1345,
				'@type': 'request'
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
					type:   'TXT',
					value:  null
				}],
				answers: []
			}
		});

		DNS.send(this.connection, {
			headers: {
				'@id':   1345,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
					type:   'TXT',
					value:  null
				}],
				answers: [{
					domain: 'tholian.local',
					type:   'TXT',
					value:  [
						Buffer.from('This is a test.', 'utf8')
					]
				}]
			}
		}, (result) => {
			assert(result, true);
		});

	});


	let url        = URL.parse('dns://localhost:13337');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		assert(response, {
			headers: {
				'@id':   1345,
				'@type': 'response'
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
					type:   'TXT',
					value:  null
				}],
				answers: [{
					domain: 'tholian.local',
					type:   'TXT',
					value:  [
						Buffer.from('This is a test.', 'utf8')
					]
				}]
			}
		});

		setTimeout(() => {
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@id': 1345
			},
			payload: {
				questions: [{
					domain: 'tholian.local',
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

after('DNS.disconnect()', function(assert) {

	assert(isFunction(DNS.disconnect), true);

	this.connection.once('@disconnect', () => {
		assert(true);
	});

	assert(DNS.disconnect(this.connection), true);

	this.connection = null;

});


export default finish('stealth/connection/DNS', {
	internet: true,
	network:  false,
	ports:    [ 53 ]
});

