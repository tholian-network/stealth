
import { Buffer, isBuffer, isObject      } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { ENVIRONMENT                     } from '../../../stealth/source/ENVIRONMENT.mjs';
import { HTTP                            } from '../../../stealth/source/connection/HTTP.mjs';
import { URL                             } from '../../../stealth/source/parser/URL.mjs';
import { connect, disconnect             } from '../../../stealth/review/Stealth.mjs';



before(connect);

describe('HTTP.send()/CONNECT', function(assert) {
});

describe('HTTP.send()/GET', function(assert, console) {

	let url        = URL.parse('http://localhost:65432');
	let connection = HTTP.connect(url);

	connection.once('@connect', () => {

		assert(true);

		HTTP.send(connection, {
			headers: {
				'@method': 'GET',
				'@url':    'http://example.com/index.html'
			},
			payload: null
		}, (result) => {

			assert(result, true);

		});

	});

	connection.once('response', (response) => {

		console.log(response);

		assert(false);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});


// TODO: HTTP Proxy usage with GET http://url
// TODO: GET /stealth/ usage with :tabid:
// TODO: GET /stealth/ usage with :tabid: and flags
// TODO: GET /stealth/ usage without any flags

after(disconnect);


export default finish('stealth/server/Webproxy', {
	internet: false,
	network:  true
});

