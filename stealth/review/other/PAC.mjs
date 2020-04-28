
import { isBuffer, isObject } from '../../../base/index.mjs';
import { describe, finish   } from '../../../covert/index.mjs';
import { IPV4, IPV6         } from '../../../covert/EXAMPLE.mjs';
import { PAC                } from '../../../stealth/source/other/PAC.mjs';



describe('PAC.send()/callback', function(assert) {

	let url1 = 'https://example.com/proxy.pac';
	let url2 = 'http://proxy.example.com:65432/proxy.pac';
	let url3 = 'https://' + IPV4.ip + '/proxy.pac';
	let url4 = 'http://' + IPV4.ip + ':65432/proxy.pac';
	let url5 = 'https://[' + IPV6.ip + ']/proxy.pac';
	let url6 = 'http://[' + IPV6.ip + ']:65432/proxy.pac';

	PAC.send(null, (response) => {
		assert(response, null);
	});

	PAC.send({}, (response) => {
		assert(response, null);
	});

	PAC.send({ url: url1 }, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(isObject(response.headers),  true);
		assert(response.headers['@code'],   200);
		assert(response.headers['@status'], '200 OK');

		assert(response.payload !== null);
		assert(isBuffer(response.payload), true);
		assert(response.payload.toString('utf8').includes('PROXY example.com:443; DIRECT'));

	});

	PAC.send({ url: url2 }, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(isObject(response.headers),  true);
		assert(response.headers['@code'],   200);
		assert(response.headers['@status'], '200 OK');

		assert(response.payload !== null);
		assert(isBuffer(response.payload), true);
		assert(response.payload.toString('utf8').includes('PROXY proxy.example.com:65432; DIRECT'));

	});

	PAC.send({ url: url3 }, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(isObject(response.headers),  true);
		assert(response.headers['@code'],   200);
		assert(response.headers['@status'], '200 OK');

		assert(response.payload !== null);
		assert(isBuffer(response.payload), true);
		assert(response.payload.toString('utf8').includes('PROXY ' + IPV4.ip + ':443; DIRECT'));

	});

	PAC.send({ url: url4 }, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(isObject(response.headers),  true);
		assert(response.headers['@code'],   200);
		assert(response.headers['@status'], '200 OK');

		assert(response.payload !== null);
		assert(isBuffer(response.payload), true);
		assert(response.payload.toString('utf8').includes('PROXY ' + IPV4.ip + ':65432; DIRECT'));

	});

	PAC.send({ url: url5 }, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(isObject(response.headers),  true);
		assert(response.headers['@code'],   200);
		assert(response.headers['@status'], '200 OK');

		assert(response.payload !== null);
		assert(isBuffer(response.payload), true);
		assert(response.payload.toString('utf8').includes('PROXY [' + IPV6.ip + ']:443; DIRECT'));

	});

	PAC.send({ url: url6 }, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(isObject(response.headers),  true);
		assert(response.headers['@code'],   200);
		assert(response.headers['@status'], '200 OK');

		assert(response.payload !== null);
		assert(isBuffer(response.payload), true);
		assert(response.payload.toString('utf8').includes('PROXY [' + IPV6.ip + ']:65432; DIRECT'));

	});

});

describe('PAC.send()/return', function(assert) {

	let response1 = PAC.send(null);
	let response2 = PAC.send({});
	let response3 = PAC.send({ url: 'https://example.com/proxy.pac' });
	let response4 = PAC.send({ url: 'http://proxy.example.com:65432/proxy.pac' });
	let response5 = PAC.send({ url: 'https://' + IPV4.ip + '/proxy.pac' });
	let response6 = PAC.send({ url: 'http://' + IPV4.ip + ':65432/proxy.pac' });
	let response7 = PAC.send({ url: 'https://[' + IPV6.ip + ']/proxy.pac' });
	let response8 = PAC.send({ url: 'http://[' + IPV6.ip + ']:65432/proxy.pac' });

	assert(response1, null);

	assert(response2, null);

	assert(response3 !== null);
	assert(response3.headers !== null);
	assert(isObject(response3.headers),  true);
	assert(response3.headers['@code'],   200);
	assert(response3.headers['@status'], '200 OK');
	assert(response3.payload !== null);
	assert(isBuffer(response3.payload), true);
	assert(response3.payload.toString('utf8').includes('PROXY example.com:443; DIRECT'));

	assert(response4 !== null);
	assert(response4.headers !== null);
	assert(isObject(response4.headers),  true);
	assert(response4.headers['@code'],   200);
	assert(response4.headers['@status'], '200 OK');
	assert(response4.payload !== null);
	assert(isBuffer(response4.payload), true);
	assert(response4.payload.toString('utf8').includes('PROXY proxy.example.com:65432; DIRECT'));

	assert(response5 !== null);
	assert(response5.headers !== null);
	assert(isObject(response5.headers),  true);
	assert(response5.headers['@code'],   200);
	assert(response5.headers['@status'], '200 OK');
	assert(response5.payload !== null);
	assert(isBuffer(response5.payload), true);
	assert(response5.payload.toString('utf8').includes('PROXY ' + IPV4.ip + ':443; DIRECT'));

	assert(response6 !== null);
	assert(response6.headers !== null);
	assert(isObject(response6.headers),  true);
	assert(response6.headers['@code'],   200);
	assert(response6.headers['@status'], '200 OK');
	assert(response6.payload !== null);
	assert(isBuffer(response6.payload), true);
	assert(response6.payload.toString('utf8').includes('PROXY ' + IPV4.ip + ':65432; DIRECT'));

	assert(response7 !== null);
	assert(response7.headers !== null);
	assert(isObject(response7.headers),  true);
	assert(response7.headers['@code'],   200);
	assert(response7.headers['@status'], '200 OK');
	assert(response7.payload !== null);
	assert(isBuffer(response7.payload), true);
	assert(response7.payload.toString('utf8').includes('PROXY [' + IPV6.ip + ']:443; DIRECT'));

	assert(response8 !== null);
	assert(response8.headers !== null);
	assert(isObject(response8.headers),  true);
	assert(response8.headers['@code'],   200);
	assert(response8.headers['@status'], '200 OK');
	assert(response8.payload !== null);
	assert(isBuffer(response8.payload), true);
	assert(response8.payload.toString('utf8').includes('PROXY [' + IPV6.ip + ']:65432; DIRECT'));

});


export default finish('stealth/other/PAC');

