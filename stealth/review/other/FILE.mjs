
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

		assert(response !== null);
		assert(response.headers !== null);
		assert(response.headers['content-type'],   'text/plain');
		assert(response.headers['content-length'], SKETCH.payload.length);
		assert(response.payload !== null);
		assert(response.payload.length, SKETCH.payload.length);

	});

});

describe('FILE.send()/return', function(assert) {

	let response1 = FILE.send(null);
	let response2 = FILE.send({});
	let response3 = FILE.send(URL.parse(ROUTE));

	assert(response1, null);

	assert(response2, null);

	assert(response3 !== null);
	assert(response3.headers !== null);
	assert(response3.headers['content-type'],   'text/plain');
	assert(response3.headers['content-length'], SKETCH.payload.length);
	assert(response3.payload !== null);
	assert(response3.payload.length, SKETCH.payload.length);

});


export default finish('stealth/other/FILE');

