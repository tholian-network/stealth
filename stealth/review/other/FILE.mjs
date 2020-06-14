
import { describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { FILE                      } from '../../../stealth/source/other/FILE.mjs';
import { URL                       } from '../../../stealth/source/parser/URL.mjs';



const ROUTE  = '/covert/sketch/hosts/block.txt';
const SKETCH = EXAMPLE.sketch('hosts/block.txt');



describe('FILE.send()/callback', function(assert) {

	FILE.send(null, (response) => {

		assert(response, null);

	});

	FILE.send({}, (response) => {

		assert(response, null);

	});

	FILE.send(URL.parse(ROUTE), (response) => {

		assert(response, {
			headers: {
				'@code':          200,
				'@status':        '200 OK',
				'content-type':   'text/plain',
				'content-length': SKETCH.payload.length
			},
			payload: SKETCH.payload
		});

	});

});

describe('FILE.send()/return', function(assert) {

	let response1 = FILE.send(null);
	let response2 = FILE.send({});
	let response3 = FILE.send(URL.parse(ROUTE));

	assert(response1, null);

	assert(response2, null);

	assert(response3, {
		headers: {
			'@code':          200,
			'@status':        '200 OK',
			'content-type':   'text/plain',
			'content-length': SKETCH.payload.length
		},
		payload: SKETCH.payload
	});

});


export default finish('stealth/other/FILE');

