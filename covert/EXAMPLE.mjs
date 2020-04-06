
import fs from 'fs';

import { Buffer, isString } from '../stealth/source/BASE.mjs';
import { IP               } from '../stealth/source/parser/IP.mjs';
import { MIME, URL        } from '../stealth/source/parser/URL.mjs';



const FILE = Buffer.from([
	'<!doctype html>',
	'<html>',
	'<head>',
	'    <title>Example Domain</title>',
	'',
	'    <meta charset="utf-8" />',
	'    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />',
	'    <meta name="viewport" content="width=device-width, initial-scale=1" />',
	'    <style type="text/css">',
	'    body {',
	'        background-color: #f0f0f2;',
	'        margin: 0;',
	'        padding: 0;',
	'        font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;',
	'    }',
	'    div {',
	'        width: 600px;',
	'        margin: 5em auto;',
	'        padding: 50px;',
	'        background-color: #fff;',
	'        border-radius: 1em;',
	'    }',
	'    a:link, a:visited {',
	'        color: #38488f;',
	'        text-decoration: none;',
	'    }',
	'    @media (max-width: 700px) {',
	'        body {',
	'            background-color: #fff;',
	'        }',
	'        div {',
	'            width: auto;',
	'            margin: 0 auto;',
	'            border-radius: 0;',
	'            padding: 1em;',
	'        }',
	'    }',
	'    </style>',
	'</head>',
	'',
	'<body>',
	'<div>',
	'    <h1>Example Domain</h1>',
	'    <p>This domain is established to be used for illustrative examples in documents. You may use this',
	'    domain in examples without prior coordination or asking for permission.</p>',
	'    <p><a href="http://www.iana.org/domains/example">More information...</a></p>',
	'</div>',
	'</body>',
	'</html>'
].join('\n'), 'utf8');



/*
 *
 * RFC 2606 defines the example.com domain
 * that is an IANA-managed reserved domain
 * and therefore can be assumed to always
 * exist as long the internet exists.
 *
 */



export const CONFIG = {
	domain: 'example.com',
	mode:   {
		text:  true,
		image: true,
		audio: false,
		video: false,
		other: false
	}
};

export const DOMAIN = {
	A:    '93.184.216.34',
	AAAA: '2606:2800:0220:0001:0248:1893:25c8:1946'
};

export const HOSTS = [
	IP.parse('93.184.216.34'),
	IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
];

export const IPV4 = IP.parse('93.184.216.34');

export const IPV6 = IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946');

export const PAYLOAD = Buffer.concat([
	Buffer.from([
		'HTTP/1.1 200 OK',
		'Content-Encoding: identity',
		'Cache-Control: max-age=604800',
		'Content-Type: text/html; charset=UTF-8',
		'Date: Sun, 14 Apr 2019 13:15:09 GMT',
		'Etag: "1541025663"',
		'Expires: Sun, 21 Apr 2019 13:15:09 GMT',
		'Last-Modified: Fri, 09 Aug 2013 23:54:35 GMT',
		'Server: ECS (dcb/7EED)',
		'Vary: Accept-Encoding',
		'X-Cache: HIT',
		'Content-Length: 1304'
	].join('\r\n'), 'utf8'),
	Buffer.from('\r\n\r\n', 'utf8'),
	Buffer.from(FILE.toString('utf8').split('\n').join('\r\n'), 'utf8'),
	Buffer.from('\r\n\r\n', 'utf8')
]);

export const REQUEST = {
	headers: {
		'@method': 'GET',
		'@path':   '/index.html',
		'@query':  null,
		'host':    'example.com',
		'range':   'bytes=0-'
	},
	payload: null
};

export const RESPONSE = {
	headers: {
		'@status': '200 OK',
		'content-encoding': 'identity',
		'cache-control': 'max-age=604800',
		'content-type': 'text/html; charset=UTF-8',
		'date': 'Sun, 14 Apr 2019 13:15:09 GMT',
		'etag': '"1541025663"',
		'expires': 'Sun, 21 Apr 2019 13:15:09 GMT',
		'last-modified': 'Fri, 09 Aug 2013 23:54:35 GMT',
		'server': 'ECS (dcb/7EED)',
		'vary': 'Accept-Encoding',
		'x-cache': 'HIT',
		'content-length': '1304'
	},
	payload: Buffer.from(FILE)
};



export const create = function(url) {

	url = isString(url) ? url : 'https://example.com/index.html';


	let ext    = url.split('.').pop();
	let mime   = MIME.find((t) => t.ext === ext) || null;
	let ref    = URL.parse(url);
	let config = {
		domain: null,
		mode:   {
			text:  false,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};

	if (ref.domain !== null) {

		if (ref.subdomain !== null) {
			config.domain = ref.subdomain + '.' + ref.domain;
		} else {
			config.domain = ref.domain;
		}

		if (config.domain === 'example.com') {

			ref.hosts = [
				IP.parse('93.184.216.34'),
				IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
			];

		} else if (config.domain === 'echo.websocket.org') {

			ref.hosts = [
				IP.parse('174.129.224.73')
			];

		} else if (config.domain === 'cookie.engineer') {

			ref.hosts = [
				IP.parse('185.199.108.153'),
				IP.parse('185.199.109.153'),
				IP.parse('185.199.110.153'),
				IP.parse('185.199.111.153')
			];

		}

	} else if (ref.host !== null) {

		config.domain = ref.host;

		ref.hosts = [
			IP.parse(ref.host)
		];

	}


	if (mime !== null) {

		config.mode[mime.type] = true;

	} else {

		config.mode.text  = true;
		config.mode.image = true;
		config.mode.audio = true;
		config.mode.video = true;
		config.mode.other = true;

	}


	return {
		config: config,
		mime:   mime,
		ref:    ref
	};

};

export const config = function(path) {

	path = isString(path) ? path : null;


	let cfg = {
		domain: null,
		mode:   {
			text:  false,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};

	if (path !== null) {

		let ref  = URL.parse(path);
		let mime = MIME.find((m) => {

			if (ref.path.endsWith('.' + m.ext)) {
				return true;
			}

			return false;

		}) || null;

		if (mime !== null) {
			cfg.mode[mime.type] = true;
		}

	}


	return cfg;

};

export const sketch = function(path) {

	let stat = null;
	try {
		stat = fs.lstatSync(process.env.PWD + '/covert/sketch/' + path);
	} catch (err) {
		stat = null;
	}

	if (stat !== null && stat.isFile()) {

		let ref = URL.parse(process.env.PWD + '/covert/sketch/' + path);
		if (ref !== null) {

			let payload = null;
			try {
				payload = fs.readFileSync(process.env.PWD + '/covert/sketch/' + path);
			} catch (err) {
				payload = null;
			}

			ref.payload = payload;

		}

		return ref;

	}


	return null;

};

