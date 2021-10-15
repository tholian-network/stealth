
import net from 'net';

import { Buffer, isArray, isBuffer, isFunction, isObject } from '../../../base/index.mjs';
import { describe, finish                                } from '../../../covert/index.mjs';
import { WHOIS                                           } from '../../../stealth/source/connection/WHOIS.mjs';
import { IP                                              } from '../../../stealth/source/parser/IP.mjs';
import { URL                                             } from '../../../stealth/source/parser/URL.mjs';



describe('WHOIS.connect()', function(assert) {

	assert(isFunction(WHOIS.connect), true);

	let url        = Object.assign(URL.parse('whois://whois.ripe.net'), { hosts: [ IP.parse('193.0.6.135'), IP.parse('2001:067c:02e8:0022:0000:0000:c100:0687') ] });
	let connection = WHOIS.connect(url);

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

describe('WHOIS.disconnect()', function(assert) {

	assert(isFunction(WHOIS.disconnect), true);

	let url        = Object.assign(URL.parse('whois://whois.ripe.net'), { hosts: [ IP.parse('193.0.6.135'), IP.parse('2001:067c:02e8:0022:0000:0000:c100:0687') ] });
	let connection = WHOIS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			assert(WHOIS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

// TODO: WHOIS.receive() for AFRINIC format
// TODO: WHOIS.receive() for APNIC format
// TODO: WHOIS.receive() for ARIN format
// TODO: WHOIS.receive() for LACNIC format
// TODO: WHOIS.receive() for RIPE format

describe('WHOIS.send()/RIPE', function(assert, console) {

	assert(isFunction(WHOIS.send), true);

	let url        = Object.assign(URL.parse('whois://whois.ripe.net'), { hosts: [ IP.parse('193.0.6.135'), IP.parse('2001:067c:02e8:0022:0000:0000:c100:0687') ] });
	let connection = WHOIS.connect(url);

	connection.once('response', (response) => {
		console.log(response);
	});

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			assert(WHOIS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});


export default finish('stealth/connection/WHOIS', {
	internet: true,
	network:  true,
	ports:    [ 43, 13337 ]
});

