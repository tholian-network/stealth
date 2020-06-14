
import { Buffer                    } from '../../../base/index.mjs';
import { describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { PAC                       } from '../../../stealth/source/other/PAC.mjs';



describe('PAC.send()/callback', function(assert) {

	let url1 = 'https://example.com/proxy.pac';
	let url2 = 'http://proxy.example.com:65432/proxy.pac';
	let url3 = 'https://' + EXAMPLE.ipv4.ip + '/proxy.pac';
	let url4 = 'http://' + EXAMPLE.ipv4.ip + ':65432/proxy.pac';
	let url5 = 'https://[' + EXAMPLE.ipv6.ip + ']/proxy.pac';
	let url6 = 'http://[' + EXAMPLE.ipv6.ip + ']:65432/proxy.pac';

	PAC.send(null, (response) => {

		assert(response, null);

	});

	PAC.send({}, (response) => {

		assert(response, null);

	});

	PAC.send({ url: url1 }, (response) => {

		assert(response, {
			headers: {
				'@code':   200,
				'@status': '200 OK'
			},
			payload: Buffer.from([
				'',
				'function FindProxyForURL(url, host) {',
				'	if (host === "example.com") return "DIRECT";',
				'	if (host === "localhost") return "DIRECT";',
				'	return "PROXY example.com:443; DIRECT";',
				'}',
				''
			].join('\n'), 'utf8')
		});

	});

	PAC.send({ url: url2 }, (response) => {

		assert(response, {
			headers: {
				'@code':   200,
				'@status': '200 OK'
			},
			payload: Buffer.from([
				'',
				'function FindProxyForURL(url, host) {',
				'	if (host === "proxy.example.com") return "DIRECT";',
				'	if (host === "localhost") return "DIRECT";',
				'	return "PROXY proxy.example.com:65432; DIRECT";',
				'}',
				''
			].join('\n'), 'utf8')
		});

	});

	PAC.send({ url: url3 }, (response) => {

		assert(response, {
			headers: {
				'@code':   200,
				'@status': '200 OK'
			},
			payload: Buffer.from([
				'',
				'function FindProxyForURL(url, host) {',
				'	if (host === "' + EXAMPLE.ipv4.ip + '") return "DIRECT";',
				'	if (host === "localhost") return "DIRECT";',
				'	return "PROXY ' + EXAMPLE.ipv4.ip + ':443; DIRECT";',
				'}',
				''
			].join('\n'), 'utf8')
		});

	});

	PAC.send({ url: url4 }, (response) => {

		assert(response, {
			headers: {
				'@code':   200,
				'@status': '200 OK'
			},
			payload: Buffer.from([
				'',
				'function FindProxyForURL(url, host) {',
				'	if (host === "' + EXAMPLE.ipv4.ip + '") return "DIRECT";',
				'	if (host === "localhost") return "DIRECT";',
				'	return "PROXY ' + EXAMPLE.ipv4.ip + ':65432; DIRECT";',
				'}',
				''
			].join('\n'), 'utf8')
		});

	});

	PAC.send({ url: url5 }, (response) => {

		assert(response, {
			headers: {
				'@code':   200,
				'@status': '200 OK'
			},
			payload: Buffer.from([
				'',
				'function FindProxyForURL(url, host) {',
				'	if (host === "[' + EXAMPLE.ipv6.ip + ']") return "DIRECT";',
				'	if (host === "localhost") return "DIRECT";',
				'	return "PROXY [' + EXAMPLE.ipv6.ip + ']:443; DIRECT";',
				'}',
				''
			].join('\n'), 'utf8')
		});

	});

	PAC.send({ url: url6 }, (response) => {

		assert(response, {
			headers: {
				'@code':   200,
				'@status': '200 OK'
			},
			payload: Buffer.from([
				'',
				'function FindProxyForURL(url, host) {',
				'	if (host === "[' + EXAMPLE.ipv6.ip + ']") return "DIRECT";',
				'	if (host === "localhost") return "DIRECT";',
				'	return "PROXY [' + EXAMPLE.ipv6.ip + ']:65432; DIRECT";',
				'}',
				''
			].join('\n'), 'utf8')
		});

	});

});

describe('PAC.send()/return', function(assert) {

	let response1 = PAC.send(null);
	let response2 = PAC.send({});
	let response3 = PAC.send({ url: 'https://example.com/proxy.pac' });
	let response4 = PAC.send({ url: 'http://proxy.example.com:65432/proxy.pac' });
	let response5 = PAC.send({ url: 'https://' + EXAMPLE.ipv4.ip + '/proxy.pac' });
	let response6 = PAC.send({ url: 'http://' + EXAMPLE.ipv4.ip + ':65432/proxy.pac' });
	let response7 = PAC.send({ url: 'https://[' + EXAMPLE.ipv6.ip + ']/proxy.pac' });
	let response8 = PAC.send({ url: 'http://[' + EXAMPLE.ipv6.ip + ']:65432/proxy.pac' });

	assert(response1, null);

	assert(response2, null);

	assert(response3, {
		headers: {
			'@code':   200,
			'@status': '200 OK'
		},
		payload: Buffer.from([
			'',
			'function FindProxyForURL(url, host) {',
			'	if (host === "example.com") return "DIRECT";',
			'	if (host === "localhost") return "DIRECT";',
			'	return "PROXY example.com:443; DIRECT";',
			'}',
			''
		].join('\n'), 'utf8')
	});

	assert(response4, {
		headers: {
			'@code':   200,
			'@status': '200 OK'
		},
		payload: Buffer.from([
			'',
			'function FindProxyForURL(url, host) {',
			'	if (host === "proxy.example.com") return "DIRECT";',
			'	if (host === "localhost") return "DIRECT";',
			'	return "PROXY proxy.example.com:65432; DIRECT";',
			'}',
			''
		].join('\n'), 'utf8')
	});

	assert(response5, {
		headers: {
			'@code':   200,
			'@status': '200 OK'
		},
		payload: Buffer.from([
			'',
			'function FindProxyForURL(url, host) {',
			'	if (host === "' + EXAMPLE.ipv4.ip + '") return "DIRECT";',
			'	if (host === "localhost") return "DIRECT";',
			'	return "PROXY ' + EXAMPLE.ipv4.ip + ':443; DIRECT";',
			'}',
			''
		].join('\n'), 'utf8')
	});

	assert(response6, {
		headers: {
			'@code':   200,
			'@status': '200 OK'
		},
		payload: Buffer.from([
			'',
			'function FindProxyForURL(url, host) {',
			'	if (host === "' + EXAMPLE.ipv4.ip + '") return "DIRECT";',
			'	if (host === "localhost") return "DIRECT";',
			'	return "PROXY ' + EXAMPLE.ipv4.ip + ':65432; DIRECT";',
			'}',
			''
		].join('\n'), 'utf8')
	});

	assert(response7, {
		headers: {
			'@code':   200,
			'@status': '200 OK'
		},
		payload: Buffer.from([
			'',
			'function FindProxyForURL(url, host) {',
			'	if (host === "[' + EXAMPLE.ipv6.ip + ']") return "DIRECT";',
			'	if (host === "localhost") return "DIRECT";',
			'	return "PROXY [' + EXAMPLE.ipv6.ip + ']:443; DIRECT";',
			'}',
			''
		].join('\n'), 'utf8')
	});

	assert(response8, {
		headers: {
			'@code':   200,
			'@status': '200 OK'
		},
		payload: Buffer.from([
			'',
			'function FindProxyForURL(url, host) {',
			'	if (host === "[' + EXAMPLE.ipv6.ip + ']") return "DIRECT";',
			'	if (host === "localhost") return "DIRECT";',
			'	return "PROXY [' + EXAMPLE.ipv6.ip + ']:65432; DIRECT";',
			'}',
			''
		].join('\n'), 'utf8')
	});

});


export default finish('stealth/other/PAC');

