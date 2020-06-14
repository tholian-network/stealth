
import { Buffer           } from '../../../base/index.mjs';
import { describe, finish } from '../../../covert/index.mjs';
import { ERROR            } from '../../../stealth/source/other/ERROR.mjs';



describe('ERROR.send()/callback', function(assert) {

	let payload = Buffer.from('Example', 'utf8');

	ERROR.send(null, (response) => {

		assert(response, null);

	});

	ERROR.send({}, (response) => {

		assert(response, {
			headers: {
				'@code':   500,
				'@status': '500 Internal Server Error'
			},
			payload: null
		});

	});

	ERROR.send({ code: 200 }, (response) => {

		assert(response, {
			headers: {
				'@code':   200,
				'@status': '200 OK'
			},
			payload: null
		});

	});

	ERROR.send({ code: 404, payload: payload }, (response) => {

		assert(response, {
			headers: {
				'@code':   404,
				'@status': '404 Not Found'
			},
			payload: payload
		});

	});

});

describe('ERROR.send()/return', function(assert) {

	let payload   = Buffer.from('Example', 'utf8');
	let response1 = ERROR.send(null);
	let response2 = ERROR.send({});
	let response3 = ERROR.send({ code: 200 });
	let response4 = ERROR.send({ code: 404, payload: payload });

	assert(response1, null);

	assert(response2, {
		headers: {
			'@code':   500,
			'@status': '500 Internal Server Error'
		},
		payload: null
	});

	assert(response3, {
		headers: {
			'@code':   200,
			'@status': '200 OK'
		},
		payload: null
	});

	assert(response4, {
		headers: {
			'@code':   404,
			'@status': '404 Not Found'
		},
		payload: payload
	});

});


export default finish('stealth/other/ERROR');

