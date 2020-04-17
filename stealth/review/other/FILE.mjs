
import { describe, finish } from '../../../covert/index.mjs';
import { sketch           } from '../../../covert/EXAMPLE.mjs';
import { FILE             } from '../../../stealth/source/other/FILE.mjs';
import { URL              } from '../../../stealth/source/parser/URL.mjs';



const PATH = '/covert/sketch/cache/payload/example.com/file.html';
const REF  = sketch('cache/payload/example.com/file.html');



describe('FILE.send/callback', function(assert) {

	FILE.send(null, (response) => {
		assert(response, null);
	});

	FILE.send({}, (response) => {
		assert(response, null);
	});

	FILE.send(URL.parse(PATH), (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(response.headers['content-type'],   'text/html');
		assert(response.headers['content-length'], REF.payload.length);
		assert(response.payload !== null);
		assert(response.payload.length, REF.payload.length);

	});

});

describe('FILE.send/return', function(assert) {

	let response1 = FILE.send(null);
	let response2 = FILE.send({});
	let response3 = FILE.send(URL.parse(PATH));

	assert(response1, null);

	assert(response2, null);

	assert(response3 !== null);
	assert(response3.headers !== null);
	assert(response3.headers['content-type'],   'text/html');
	assert(response3.headers['content-length'], REF.payload.length);
	assert(response3.payload !== null);
	assert(response3.payload.length, REF.payload.length);

});


export default finish('stealth/other/FILE');

