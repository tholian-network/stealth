
import fs   from 'fs';
import path from 'path';

import { Buffer, isString } from '../extern/base.mjs';
import { ENVIRONMENT      } from '../../covert/source/ENVIRONMENT.mjs';
import { IP               } from '../../stealth/source/parser/IP.mjs';
import { URL              } from '../../stealth/source/parser/URL.mjs';



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



const EXAMPLE = {

	file: FILE,

	hosts: [
		IP.parse('93.184.216.34'),
		IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
	],

	ipv4: IP.parse('93.184.216.34'),
	ipv6: IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946'),

	toMode: function(link) {

		link = isString(link) ? link : 'https://example.com/index.html';


		let url  = URL.parse(link);
		let mode = {
			domain: null,
			mode:   {
				text:  false,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		};

		let domain = URL.toDomain(url);
		let host   = URL.toHost(url);

		if (domain !== null) {
			mode.domain = domain;
		} else if (host !== null) {
			mode.domain = host;
		}

		if (url.mime !== null) {
			mode.mode[url.mime.type] = true;
		}

		return mode;

	},

	toSketch: function(file) {

		file = isString(file) ? file : null;


		if (file !== null) {

			let link = path.resolve(ENVIRONMENT.root + '/covert/sketch', file);

			let stat = null;
			try {
				stat = fs.lstatSync(link);
			} catch (err) {
				stat = null;
			}

			if (stat !== null && stat.isFile() === true) {

				let url = URL.parse(link);
				if (url !== null) {

					let payload = null;
					try {
						payload = fs.readFileSync(link);
					} catch (err) {
						payload = null;
					}

					if (payload !== null) {
						url.payload = payload;
					}

					return url;

				}

			}

		}

		return null;

	},

	toURL: function(link) {

		link = isString(link) ? link : 'https://example.com/index.html';


		let url    = URL.parse(link);
		let domain = URL.toDomain(url);
		let host   = URL.toHost(url);

		if (domain !== null) {

			if (domain === 'localhost') {

				url.hosts = [
					IP.parse('127.0.0.1'),
					IP.parse('::1')
				];

			} else if (domain === 'example.com') {

				url.hosts = EXAMPLE.hosts;

			} else if (domain === 'echo.websocket.org') {

				url.hosts = [
					IP.parse('174.129.224.73')
				];

			}

		} else if (host !== null) {

			url.hosts = [
				IP.parse(host)
			];

		}

		return url;

	}

};


export { EXAMPLE };

