
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

	config: function(url) {

		url = isString(url) ? url : 'https://example.com/index.html';


		let ref = URL.parse(url);
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

		if (ref.domain !== null) {

			if (ref.subdomain !== null) {
				cfg.domain = ref.subdomain + '.' + ref.domain;
			} else {
				cfg.domain = ref.domain;
			}

		} else if (ref.host !== null) {

			cfg.domain = ref.host;

		}

		if (ref.mime !== null) {
			cfg.mode[ref.mime.type] = true;
		}

		return cfg;

	},

	file: FILE,

	hosts: [
		IP.parse('93.184.216.34'),
		IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946')
	],

	ipv4: IP.parse('93.184.216.34'),
	ipv6: IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946'),


	ref: function(url) {

		url = isString(url) ? url : 'https://example.com/index.html';


		let ref = URL.parse(url);

		if (ref.domain !== null) {

			if (ref.domain === 'example.com') {

				ref.hosts = EXAMPLE.hosts;

			} else if (ref.domain === 'websocket.org' && ref.subdomain === 'echo') {

				ref.hosts = [
					IP.parse('174.129.224.73')
				];

			}

		} else if (ref.host !== null) {

			ref.hosts = [
				IP.parse(ref.host)
			];

		}

		return ref;

	},

	sketch: function(file) {

		file = isString(file) ? file : null;


		if (file !== null) {

			let resolved = path.resolve(ENVIRONMENT.root + '/covert/sketch', file);

			let stat = null;
			try {
				stat = fs.lstatSync(resolved);
			} catch (err) {
				stat = null;
			}

			if (stat !== null && stat.isFile() === true) {

				let ref = URL.parse(resolved);
				if (ref !== null) {

					let payload = null;
					try {
						payload = fs.readFileSync(resolved);
					} catch (err) {
						payload = null;
					}

					if (payload !== null) {
						ref.payload = payload;
					}

					return ref;

				}

			}

		}

		return null;

	}

};


export { EXAMPLE };

