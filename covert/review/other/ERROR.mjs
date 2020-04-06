
import { Buffer           } from '../../../stealth/source/BASE.mjs';
import { ERROR            } from '../../../stealth/source/other/ERROR.mjs';
import { describe, finish } from '../../source/Review.mjs';



describe('ERROR.send/callback', function(assert) {

	let payload = Buffer.from('Example', 'utf8');


	ERROR.send(null, (response) => {
		assert(response === null);
	});

	ERROR.send({}, (response) => {

		assert(response !== null);
		assert(response.headers['@code'] === 500);
		assert(response.headers['@status'] === '500 Internal Server Error');
		assert(response.payload === null);

	});

	ERROR.send({ code: 200 }, (response) => {

		assert(response !== null);
		assert(response.headers['@code'] === 200);
		assert(response.headers['@status'] === '200 OK');
		assert(response.payload === null);

	});

	ERROR.send({ code: 404, payload: payload }, (response) => {

		assert(response !== null);
		assert(response.headers['@code'] === 404);
		assert(response.headers['@status'] === '404 Not Found');
		assert(response.payload === payload);

	});

});

describe('ERROR.send/return', function(assert) {

	let payload   = Buffer.from('Example', 'utf8');
	let response1 = ERROR.send(null);
	let response2 = ERROR.send({});
	let response3 = ERROR.send({ code: 200 });
	let response4 = ERROR.send({ code: 404, payload: payload });

	assert(response1 === null);

	assert(response2 !== null);
	assert(response2.headers['@code'] === 500);
	assert(response2.headers['@status'] === '500 Internal Server Error');
	assert(response2.payload === null);

	assert(response3 !== null);
	assert(response3.headers['@code'] === 200);
	assert(response3.headers['@status'] === '200 OK');
	assert(response3.payload === null);

	assert(response4 !== null);
	assert(response4.headers['@code'] === 404);
	assert(response4.headers['@status'] === '404 Not Found');
	assert(response4.payload === payload);

});



export default finish('other/ERROR');

