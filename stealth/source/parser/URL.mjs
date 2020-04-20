
import { isArray, isNumber, isObject, isString } from '../../extern/base.mjs';
import { IP                                    } from './IP.mjs';



const TOPLEVELDOMAINS = [
	'aba.ae',
	'ac.id',
	'ac.in',
	'ac.th',
	'adv.br',
	'at.ua',
	'az.pl',
	'cn.com',
	'co.at',
	'co.cc',
	'co.cr',
	'co.id',
	'co.il',
	'co.in',
	'co.jp',
	'co.ke',
	'co.kr',
	'co.ls',
	'co.mz',
	'co.nf',
	'co.nz',
	'co.rs',
	'co.th',
	'co.tv',
	'co.tz',
	'co.ua',
	'co.ug',
	'co.uk',
	'co.vu',
	'co.za',
	'co.zw',
	'com.ar',
	'com.au',
	'com.bd',
	'com.bo',
	'com.br',
	'com.cn',
	'com.co',
	'com.cy',
	'com.de',
	'com.do',
	'com.ec',
	'com.eg',
	'com.es',
	'com.gt',
	'com.hk',
	'com.kh',
	'com.lb',
	'com.mk',
	'com.mx',
	'com.my',
	'com.ng',
	'com.np',
	'com.pe',
	'com.ph',
	'com.pk',
	'com.pl',
	'com.pt',
	'com.py',
	'com.ru',
	'com.sa',
	'com.sg',
	'com.sv',
	'com.tr',
	'com.tw',
	'com.ua',
	'com.uy',
	'com.ve',
	'com.vn',
	'cz.cc',
	'da.ru',
	'de.vu',
	'do.am',
	'dol.ru',
	'dp.ua',
	'edu.ar',
	'edu.au',
	'edu.bd',
	'edu.br',
	'edu.cn',
	'edu.co',
	'edu.in',
	'edu.mx',
	'edu.my',
	'edu.ng',
	'edu.np',
	'edu.pe',
	'edu.pk',
	'edu.pl',
	'edu.tw',
	'edu.vn',
	'eng.br',
	'esy.es',
	'far.ru',
	'flu.cc',
	'fr.am',
	'gen.tr',
	'go.com',
	'go.id',
	'go.ro',
	'go.th',
	'gob.mx',
	'gob.pe',
	'gov.bd',
	'gov.br',
	'gov.cn',
	'gov.it',
	'gov.ph',
	'had.su',
	'hol.es',
	'hop.ru',
	'in.th',
	'in.ua',
	'ind.br',
	'inf.br',
	'me.uk',
	'mm.am',
	'ne.jp',
	'net.au',
	'net.br',
	'net.cn',
	'net.in',
	'net.nz',
	'net.pk',
	'net.pl',
	'net.ru',
	'net.ua',
	'nl.am',
	'nut.cc',
	'or.id',
	'or.jp',
	'or.ke',
	'or.kr',
	'org.ar',
	'org.au',
	'org.bd',
	'org.br',
	'org.il',
	'org.in',
	'org.mx',
	'org.my',
	'org.ng',
	'org.np',
	'org.nz',
	'org.pe',
	'org.pk',
	'org.pl',
	'org.rs',
	'org.ru',
	'org.tr',
	'org.tw',
	'org.ua',
	'org.uk',
	'org.ve',
	'org.za',
	'pe.hu',
	'pp.ru',
	'pp.ua',
	'prv.pl',
	'qc.ca',
	'rr.nu',
	'sh.cn',
	'spb.ru',
	'tbn.ru',
	'tur.br',
	'vi.net',
	'waw.pl',
	'wz.cz',
	'xt.pl',
	'yi.org',
	'za.net',
	'za.pl',
	'zyr.su',
	'zz.mu'
];


const DEFAULT = {
	ext:    null,
	type:   'other',
	binary: true,
	format: 'application/octet-stream'
};

export const MIME = [

	// Media-Types are compliant with IANA assignments
	// https://www.iana.org/assignments/media-types

	// non-official
	{ ext: 'webmanifest', type: 'text', binary: false, format: 'application/manifest+json' },

	// application
	{ ext: 'abw',   type: 'other', binary: true,  format: 'application/x-abiword'                                                     },
	{ ext: 'azw',   type: 'other', binary: true,  format: 'application/vnd.amazon.ebook'                                              },
	{ ext: 'bin',   type: 'other', binary: true,  format: 'application/octet-stream'                                                  },
	{ ext: 'csh',   type: 'text',  binary: false, format: 'application/x-csh'                                                         },
	{ ext: 'doc',   type: 'other', binary: true,  format: 'application/msword'                                                        },
	{ ext: 'docx',  type: 'other', binary: true,  format: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'   },
	{ ext: 'eot',   type: 'font',  binary: true,  format: 'application/vnd.ms-fontobject'                                             },
	{ ext: 'js',    type: 'text',  binary: false, format: 'application/javascript'                                                    },
	{ ext: 'json',  type: 'text',  binary: false, format: 'application/json'                                                          },
	{ ext: 'mjs',   type: 'text',  binary: false, format: 'application/javascript'                                                    },
	{ ext: 'odp',   type: 'other', binary: true,  format: 'application/vnd.oasis.opendocument.presentation'                           },
	{ ext: 'ods',   type: 'other', binary: true,  format: 'application/vnd.oasis.opendocument.spreadsheet'                            },
	{ ext: 'odt',   type: 'other', binary: true,  format: 'application/vnd.oasis.opendocument.text'                                   },
	{ ext: 'ogx',   type: 'video', binary: true,  format: 'application/ogg'                                                           },
	{ ext: 'pdf',   type: 'other', binary: true,  format: 'application/pdf'                                                           },
	{ ext: 'ppt',   type: 'other', binary: true,  format: 'application/vnd.ms-powerpoint'                                             },
	{ ext: 'pptx',  type: 'other', binary: true,  format: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
	{ ext: 'rtf',   type: 'other', binary: true,  format: 'application/rtf'                                                           },
	{ ext: 'sh',    type: 'text',  binary: false, format: 'application/x-sh'                                                          },
	{ ext: 'ts',    type: 'text',  binary: false, format: 'application/typescript'                                                    },
	{ ext: 'vsd',   type: 'other', binary: true,  format: 'application/vnd.visio'                                                     },
	{ ext: 'xhtml', type: 'text',  binary: false, format: 'application/xhtml+xml'                                                     },
	{ ext: 'xls',   type: 'other', binary: true,  format: 'application/vnd.ms-excel'                                                  },
	{ ext: 'xlsx',  type: 'other', binary: true,  format: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'         },
	{ ext: 'xml',   type: 'text',  binary: false, format: 'application/xml'                                                           },
	{ ext: 'xul',   type: 'text',  binary: false, format: 'application/vnd.mozilla.xul+xml'                                           },

	// audio
	{ ext: '3gp',  type: 'audio', binary: true, format: 'audio/3gpp' },
	{ ext: '3gpp', type: 'audio', binary: true, format: 'audio/3gpp' },
	{ ext: 'aac',  type: 'audio', binary: true, format: 'audio/aac'  },
	{ ext: 'ac3',  type: 'audio', binary: true, format: 'audio/ac3'  },
	{ ext: 'mid',  type: 'audio', binary: true, format: 'audio/midi' },
	{ ext: 'mp3',  type: 'audio', binary: true, format: 'audio/mp3'  },
	{ ext: 'oga',  type: 'audio', binary: true, format: 'audio/ogg'  },
	{ ext: 'ogg',  type: 'audio', binary: true, format: 'audio/ogg'  },
	{ ext: 'wav',  type: 'audio', binary: true, format: 'audio/wav'  },
	{ ext: 'weba', type: 'audio', binary: true, format: 'audio/webm' },

	// font
	{ ext: 'otf',   type: 'other', binary: true, format: 'font/otf'   },
	{ ext: 'sfnt',  type: 'other', binary: true, format: 'font/sfnt'  },
	{ ext: 'ttf',   type: 'other', binary: true, format: 'font/ttf'   },
	{ ext: 'woff',  type: 'other', binary: true, format: 'font/woff'  },
	{ ext: 'woff2', type: 'other', binary: true, format: 'font/woff2' },

	// image
	{ ext: 'bmp',  type: 'image', binary: true, format: 'image/bmp'     },
	{ ext: 'emf',  type: 'image', binary: true, format: 'image/emf'     },
	{ ext: 'gif',  type: 'image', binary: true, format: 'image/gif'     },
	{ ext: 'ico',  type: 'image', binary: true, format: 'image/x-icon'  },
	{ ext: 'jp2',  type: 'image', binary: true, format: 'image/jp2'     },
	{ ext: 'jpeg', type: 'image', binary: true, format: 'image/jpeg'    },
	{ ext: 'jpg',  type: 'image', binary: true, format: 'image/jpeg'    },
	{ ext: 'png',  type: 'image', binary: true, format: 'image/png'     },
	{ ext: 'tif',  type: 'image', binary: true, format: 'image/tiff'    },
	{ ext: 'tiff', type: 'image', binary: true, format: 'image/tiff'    },
	{ ext: 'svg',  type: 'image', binary: true, format: 'image/svg+xml' },
	{ ext: 'webp', type: 'image', binary: true, format: 'image/webp'    },
	{ ext: 'wmf',  type: 'image', binary: true, format: 'image/wmf'     },

	// text
	{ ext: 'appcache', type: 'text', binary: false, format: 'text/cache-manifest' },
	{ ext: 'css',      type: 'text', binary: false, format: 'text/css'            },
	{ ext: 'csv',      type: 'text', binary: false, format: 'text/csv'            },
	{ ext: 'htm',      type: 'text', binary: false, format: 'text/html'           },
	{ ext: 'html',     type: 'text', binary: false, format: 'text/html'           },
	{ ext: 'ical',     type: 'text', binary: false, format: 'text/calendar'       },
	{ ext: 'md',       type: 'text', binary: false, format: 'text/x-markdown'     },
	{ ext: 'mf',       type: 'text', binary: false, format: 'text/cache-manifest' },
	{ ext: 'txt',      type: 'text', binary: false, format: 'text/plain'          },

	// video
	{ ext: 'avi',  type: 'video', binary: true, format: 'video/x-msvideo' },
	{ ext: 'mpeg', type: 'video', binary: true, format: 'video/mpeg'      },
	{ ext: 'ogv',  type: 'video', binary: true, format: 'video/ogg'       },
	{ ext: 'webm', type: 'video', binary: true, format: 'video/webm'      },

	// other
	{ ext: '7z',   type: 'other', binary: true, format: 'application/x-7z-compressed'  },
	{ ext: 'bz',   type: 'other', binary: true, format: 'application/x-bzip'           },
	{ ext: 'bz2',  type: 'other', binary: true, format: 'application/x-bzip2'          },
	{ ext: 'epub', type: 'other', binary: true, format: 'application/epub+zip'         },
	{ ext: 'gz',   type: 'other', binary: true, format: 'application/x-gzip'           },
	{ ext: 'jar',  type: 'other', binary: true, format: 'application/jar-archive'      },
	{ ext: 'rar',  type: 'other', binary: true, format: 'application/x-rar-compressed' },
	{ ext: 'tar',  type: 'other', binary: true, format: 'application/x-tar'            },
	{ ext: 'zip',  type: 'other', binary: true, format: 'application/zip'              }

];

const resolve_path = function(raw) {

	let tmp = raw.split('/');

	for (let t = 0, tl = tmp.length; t < tl; t++) {

		if (tmp[t] === '') {
			tmp.splice(t, 1);
			tl--;
			t--;
		} else if (tmp[t] === '.') {
			tmp.splice(t, 1);
			tl--;
			t--;
		} else if (tmp[t] === '..' && t >= 1) {
			tmp.splice(t - 1, 2);
			tl -= 2;
			t  -= 2;
		} else if (tmp[t] === '..') {
			tmp.splice(t, 1);
			tl--;
			t--;
		}

	}

	let path = tmp.join('/');
	if (path === '') {
		path = '/';
	} else if (path.startsWith('/') === false) {
		path = '/' + path;
	}

	return path;

};



const URL = {

	isURL: function(ref) {

		ref = isObject(ref) ? ref : null;


		if (ref !== null) {

			let protocol  = ref.protocol  || null;
			let domain    = ref.domain    || null;
			let hash      = ref.hash      || null;
			let host      = ref.host      || null;
			let mime      = ref.mime      || null;
			let path      = ref.path      || null;
			let port      = ref.port      || null;
			let query     = ref.query     || null;
			let subdomain = ref.subdomain || null;

			if (protocol === 'file') {

				if (
					(MIME.includes(mime) || mime === null)
					&& isString(path) === true
				) {
					return true;
				}

			} else if (
				protocol === 'ftps'
				|| protocol === 'ftp'
				|| protocol === 'https'
				|| protocol === 'http'
				|| protocol === 'wss'
				|| protocol === 'ws'
				|| protocol === 'socks'
			) {

				if (
					isString(domain) === true
					&& (isString(subdomain) === true || subdomain === null)
				) {

					if (
						(isString(hash) === true || hash === null)
						&& host === null
						&& (MIME.includes(mime) || mime === null)
						&& isString(path) === true
						&& isNumber(port) === true
						&& (isString(query) === true || query === null)
					) {
						return true;
					}

				} else if (isString(host) === true) {

					if (
						domain === null
						&& subdomain === null
						&& (isString(hash) === true || hash === null)
						&& (MIME.includes(mime) || mime === null)
						&& isString(path) === true
						&& isNumber(port) === true
						&& (isString(query) === true || query === null)
					) {
						return true;
					}

				}

			} else if (protocol === 'stealth') {

				if (
					isString(domain) === true
					&& (isString(hash) === true || hash === null)
					&& (MIME.includes(mime) || mime === null)
					&& (isString(query) === true || query === null)
				) {
					return true;
				}

			}

		}


		return false;

	},

	parse: function(url) {

		url = isString(url) ? url : '';


		let protocol  = null;
		let domain    = null;
		let hash      = null;
		let host      = null;
		let hosts     = [];
		let mime      = null;
		let path      = null;
		let port      = null;
		let query     = null;
		let subdomain = null;


		let tmp1 = url.split('?')[0] || '';
		let tmp2 = url.split('?')[1] || '';

		if (url.startsWith('stealth:')) {

			protocol = 'stealth';
			domain   = tmp1.substr(protocol.length + 1).split('/')[0];
			path     = '/' + tmp1.substr(protocol.length + 1).split('/').slice(1).join('/');
			query    = tmp2 !== '' ? tmp2 : null;

		} else if (url.startsWith('file://')) {

			protocol = 'file';
			path     = '/' + tmp1.substr(protocol.length + 3).split('/').slice(1).join('/');
			query    = tmp2 !== '' ? tmp2 : null;

		} else if (url.startsWith('//')) {

			protocol = 'https';
			domain   = tmp1.substr(2).split('/')[0];
			path     = '/' + tmp1.substr(2).split('/').slice(1).join('/');
			query    = tmp2 !== '' ? tmp2 : null;

		} else if (url.startsWith('/')) {

			protocol = 'file';
			domain   = null;
			host     = null;
			path     = tmp1;
			query    = tmp2 !== '' ? tmp2 : null;

		} else if (url.startsWith('..')) {

			path     = tmp1;
			query    = tmp2 !== '' ? tmp2 : null;

		} else if (url.startsWith('.')) {

			path     = tmp1;
			query    = tmp2 !== '' ? tmp2 : null;

		} else if (url.includes('://')) {

			protocol = tmp1.substr(0, tmp1.indexOf('://'));
			domain   = tmp1.substr(protocol.length + 3).split('/')[0];
			path     = '/' + tmp1.substr(protocol.length + 3).split('/').slice(1).join('/');
			query    = tmp2 !== '' ? tmp2 : null;

		} else if (url.startsWith('?')) {

			query    = tmp2 !== '' ? tmp2 : null;

		} else if (url.startsWith('#')) {

			hash     = url.split('#').slice(1).join('#');

		} else {

			domain   = tmp1.split('/')[0];
			path     = '/' + tmp1.split('/').slice(1).join('/');

		}


		if (domain !== null && /^([a-zA-z0-9.:-]+)$/.test(domain) === false) {
			domain = null;
		}

		if (path !== null && path.includes('#')) {
			hash = path.split('#').slice(1).join('#');
			path = path.split('#').shift();
		}

		if (query !== null && query.includes('#')) {
			hash  = query.split('#').slice(1).join('#');
			query = query.split('#').shift();
		}


		let check_ipv6 = false;
		let check_ipv4 = false;

		if (domain !== null && domain.includes(':')) {
			check_ipv6 = domain.split(':').length > 2;
		}

		if (domain !== null && domain.includes('.')) {
			check_ipv4 = /^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/g.test(domain.split(':')[0]);
		}

		if (check_ipv6 === true) {

			if (domain.startsWith('[')) {
				domain = domain.substr(1);
			}

			if (domain.includes(']:')) {

				let tmp1 = domain.split(']:');
				let tmp2 = parseInt(tmp1[1], 10);

				domain = tmp1[0];

				if (Number.isNaN(tmp2) === false && tmp2 > 0 && tmp2 < 65535) {
					port = tmp2;
				}

			} else if (domain.includes(']')) {
				domain = domain.split(']').join('');
			}


			let ip = IP.parse(domain);
			if (ip.type === 'v6') {

				domain = null;
				host   = ip.ip;
				hosts.push(ip);

			}

		} else if (check_ipv4 === true) {

			if (domain.includes('[')) {
				domain = domain.split('[').join('');
			}

			if (domain.includes(']')) {
				domain = domain.split(']').join('');
			}

			if (domain.includes(':')) {

				let tmp1 = domain.split(':');
				let tmp2 = parseInt(tmp1[1], 10);

				domain = tmp1[0];

				if (Number.isNaN(tmp2) === false && tmp2 > 0 && tmp2 < 65535) {
					port = tmp2;
				}

			}


			let ip = IP.parse(domain);
			if (ip.type === 'v4') {

				domain = null;
				host   = ip.ip;
				hosts.push(ip);

			}

		} else if (domain !== null && domain.includes('.')) {

			if (domain.includes(':')) {

				let tmp1 = domain.split(':');
				let tmp2 = parseInt(tmp1[1], 10);

				domain = tmp1[0];

				if (Number.isNaN(tmp2) === false && tmp2 > 0 && tmp2 < 65535) {
					port = tmp2;
				}

			}


			let tmp_tld = domain.split('.').slice(-2).join('.');
			let tmp_sub = domain.split('.').slice(0, -2);

			if (TOPLEVELDOMAINS.includes(tmp_tld) === true && tmp_sub.length > 0) {

				domain = tmp_sub.pop() + '.' + tmp_tld;

				if (tmp_sub.length > 0) {
					subdomain = tmp_sub.join('.');
				} else {
					subdomain = null;
				}

			} else if (tmp_sub.length > 0) {
				domain    = tmp_tld;
				subdomain = tmp_sub.join('.');
			} else {
				domain    = tmp_tld;
				subdomain = null;
			}

			if (domain.startsWith('-')) {
				domain = null;
			}

		} else if (domain !== null) {

			if (domain.includes(':')) {

				let tmp1 = domain.split(':');
				let tmp2 = parseInt(tmp1[1], 10);

				domain = tmp1[0];

				if (Number.isNaN(tmp2) === false && tmp2 > 0 && tmp2 < 65535) {
					port = tmp2;
				}

				if (domain === 'localhost') {
					hosts.push(IP.parse('127.0.0.1'));
					hosts.push(IP.parse('::1'));
				}

			} else {

				if (domain === 'localhost') {
					hosts.push(IP.parse('127.0.0.1'));
					hosts.push(IP.parse('::1'));
				}

			}

		}


		if (path !== null && path.includes('.')) {

			let ext  = path.split('.').pop();
			let type = MIME.find((t) => t.ext === ext) || null;

			if (type !== null) {
				mime = type;
			} else {
				mime = DEFAULT;
			}

		} else {

			// assume text/html by default
			mime = MIME.find((t) => t.ext === 'html') || null;

		}

		if (protocol !== null && port === null) {

			if (protocol === 'file') {
				// Do nothing
			} else if (protocol === 'ftps') {
				port = 990;
			} else if (protocol === 'ftp') {
				port = 21;
			} else if (protocol === 'https') {
				port = 443;
			} else if (protocol === 'http') {
				port = 80;
			} else if (protocol === 'wss') {
				port = 443;
			} else if (protocol === 'ws') {
				port = 80;
			} else if (protocol === 'socks') {
				port = 1080;
			} else if (protocol === 'stealth') {
				// Do nothing
			}

		}


		return {

			domain:    domain,
			hash:      hash,
			host:      host,
			mime:      mime,
			path:      path,
			port:      port,
			protocol:  protocol,
			query:     query,
			subdomain: subdomain,
			url:       URL.render({
				domain:    domain,
				host:      host,
				path:      path,
				port:      port,
				protocol:  protocol,
				query:     query,
				subdomain: subdomain
			}),

			// DNS API
			hosts:     hosts,

			// Service API
			headers:   null,
			payload:   null

		};

	},

	render: function(ref) {

		ref = isObject(ref) ? ref : null;


		if (ref !== null) {

			let url = '';

			if (ref.protocol !== null) {

				if (ref.protocol === 'stealth') {
					url += ref.protocol + ':';
				} else {
					url += ref.protocol + '://';
				}

			}

			if (ref.domain !== null) {

				if (ref.subdomain !== null) {
					url += ref.subdomain + '.' + ref.domain;
				} else {
					url += ref.domain;
				}

			} else if (ref.host !== null) {

				if (ref.host.includes(':')) {
					url += '[' + ref.host + ']';
				} else {
					url += ref.host;
				}

			}


			if (ref.protocol === 'file') {

				// Do nothing

			} else if (ref.protocol === 'ftps') {

				if (ref.port !== 990) {
					url += ':' + ref.port;
				}

			} else if (ref.protocol === 'ftp') {

				if (ref.port !== 21) {
					url += ':' + ref.port;
				}

			} else if (ref.protocol === 'https') {

				if (ref.port !== 443) {
					url += ':' + ref.port;
				}

			} else if (ref.protocol === 'http') {

				if (ref.port !== 80) {
					url += ':' + ref.port;
				}

			} else if (ref.protocol === 'wss') {

				if (ref.port !== 443) {
					url += ':' + ref.port;
				}

			} else if (ref.protocol === 'ws') {

				if (ref.port !== 80) {
					url += ':' + ref.port;
				}

			} else if (ref.protocol === 'socks') {

				if (ref.port !== 1080) {
					url += ':' + ref.port;
				}

			} else if (ref.protocol === 'stealth') {

				// Do nothing

			} else if (ref.port !== null) {
				url += ':' + ref.port;
			}


			if (ref.protocol !== 'stealth') {

				if (ref.path !== null) {
					url += ref.path;
				}

			}

			if (ref.query !== null) {
				url += '?' + ref.query;
			}

			return url;

		}


		return null;

	},

	resolve: function(abs, rel) {

		let ref_abs = null;
		if (isString(abs)) {
			ref_abs = URL.parse(abs);
		} else if (isObject(abs)) {
			ref_abs = abs;
			abs     = abs.url;
		}


		let ref_rel = null;
		if (isString(rel)) {

			ref_rel = URL.parse(rel);

		} else if (isObject(rel)) {

			ref_rel = rel;
			rel     = ref_rel.path;

			// address bar: google.com/what/ever.html
			// content src: folder/what/ever.html
			if (ref_rel.domain !== null) {
				rel = ref_rel.url;
			}

		}


		let domain    = null;
		let hash      = null;
		let host      = null;
		let hosts     = [];
		let mime      = null;
		let path      = null;
		let port      = null;
		let protocol  = null;
		let query     = null;
		let subdomain = null;

		if (ref_abs !== null && ref_rel !== null) {

			if (rel.startsWith('stealth:')) {

				domain    = ref_rel.domain;
				hash      = ref_rel.hash;
				host      = ref_rel.host;
				hosts     = ref_rel.hosts;
				mime      = ref_rel.mime;
				path      = ref_rel.path;
				port      = ref_rel.port;
				protocol  = ref_rel.protocol;
				query     = ref_rel.query;
				subdomain = ref_rel.subdomain;

			} else if (rel.startsWith('../')) {

				domain    = ref_abs.domain;
				host      = ref_abs.host;
				hosts     = ref_abs.hosts;
				port      = ref_abs.port;
				protocol  = ref_abs.protocol;
				subdomain = ref_abs.subdomain;

				hash      = ref_rel.hash;
				mime      = ref_rel.mime;
				query     = ref_rel.query;

				let is_folder = ref_abs.path.endsWith('/');
				if (is_folder === true) {
					path = resolve_path(ref_abs.path + ref_rel.path);
				} else {
					path = resolve_path(ref_abs.path.split('/').slice(0, -1).join('/') + '/' + ref_rel.path);
				}

			} else if (rel.startsWith('./')) {

				domain    = ref_abs.domain;
				host      = ref_abs.host;
				hosts     = ref_abs.hosts;
				port      = ref_abs.port;
				protocol  = ref_abs.protocol;
				subdomain = ref_abs.subdomain;

				hash      = ref_rel.hash;
				mime      = ref_rel.mime;
				query     = ref_rel.query;

				let is_folder = ref_abs.path.endsWith('/');
				if (is_folder === true) {
					path = resolve_path(ref_abs.path + ref_rel.path);
				} else {
					path = resolve_path(ref_abs.path.split('/').slice(0, -1).join('/') + '/' + ref_rel.path);
				}

			} else if (rel.startsWith('//')) {

				if (ref_abs.protocol === 'file') {
					ref_rel = URL.parse(ref_abs.protocol + ':/' + rel);
				} else if (ref_abs.protocol === 'stealth') {
					ref_rel = URL.parse(ref_abs.protocol + ':' + rel.substr(2));
				} else {
					ref_rel = URL.parse(ref_abs.protocol + ':' + rel);
				}

				domain    = ref_rel.domain;
				hash      = ref_rel.hash;
				host      = ref_rel.host;
				hosts     = ref_rel.hosts;
				mime      = ref_rel.mime;
				port      = ref_rel.port;
				path      = resolve_path(ref_rel.path);
				protocol  = ref_rel.protocol;
				subdomain = ref_rel.subdomain;
				query     = ref_rel.query;

			} else if (rel.startsWith('/')) {

				domain    = ref_abs.domain;
				host      = ref_abs.host;
				hosts     = ref_abs.hosts;
				port      = ref_abs.port;
				protocol  = ref_abs.protocol;
				subdomain = ref_abs.subdomain;

				hash      = ref_rel.hash;
				mime      = ref_rel.mime;
				path      = resolve_path(ref_rel.path);
				query     = ref_rel.query;

			} else if (rel.includes('://')) {

				domain    = ref_rel.domain;
				hash      = ref_rel.hash;
				host      = ref_rel.host;
				hosts     = ref_rel.hosts;
				mime      = ref_rel.mime;
				port      = ref_rel.port;
				path      = resolve_path(ref_rel.path);
				protocol  = ref_rel.protocol;
				subdomain = ref_rel.subdomain;
				query     = ref_rel.query;

			} else {

				domain    = ref_abs.domain;
				host      = ref_abs.host;
				hosts     = ref_abs.hosts;
				port      = ref_abs.port;
				protocol  = ref_abs.protocol;
				subdomain = ref_abs.subdomain;

				hash      = ref_rel.hash;
				mime      = ref_rel.mime;
				query     = ref_rel.query;

				let is_folder = ref_abs.path.endsWith('/');
				if (is_folder === true) {
					path = resolve_path(ref_abs.path + ref_rel.path);
				} else {
					path = resolve_path(ref_abs.path.split('/').slice(0, -1).join('/') + '/' + ref_rel.path);
				}

			}

		} else if (ref_abs !== null) {

			domain    = ref_abs.domain;
			hash      = ref_abs.hash;
			host      = ref_abs.host;
			hosts     = ref_abs.hosts;
			mime      = ref_abs.mime;
			path      = resolve_path(ref_abs.path);
			port      = ref_abs.port;
			protocol  = ref_abs.protocol;
			query     = ref_abs.query;
			subdomain = ref_abs.subdomain;

		}


		return {

			domain:    domain,
			hash:      hash,
			host:      host,
			mime:      mime,
			path:      path,
			port:      port,
			protocol:  protocol,
			query:     query,
			subdomain: subdomain,
			url:       URL.render({
				domain:    domain,
				host:      host,
				path:      path,
				port:      port,
				protocol:  protocol,
				query:     query,
				subdomain: subdomain
			}),

			// DNS API
			hosts:     hosts,

			// Service API
			headers:   null,
			payload:   null

		};

	},

	sort: function(array) {

		array = isArray(array) ? array : null;


		if (array !== null) {

			return array.filter((url) => URL.isURL(url)).sort((a, b) => {

				if (a.protocol === 'stealth' && b.protocol !== 'stealth') return  1;
				if (b.protocol === 'stealth' && a.protocol !== 'stealth') return -1;


				if (a.protocol !== null && b.protocol !== null) {

					if (a.protocol < b.protocol) return -1;
					if (b.protocol < a.protocol) return  1;

				} else {

					if (a.protocol !== null) return -1;
					if (b.protocol !== null) return  1;

				}

				if (a.host !== null && b.host !== null) {

					if (a.host < b.host) return -1;
					if (b.host < a.host) return  1;

				} else {

					if (a.host !== null) return -1;
					if (b.host !== null) return  1;

				}

				if (a.domain !== null && b.domain !== null) {

					if (a.domain < b.domain) return -1;
					if (b.domain < a.domain) return  1;

					if (a.subdomain !== null && b.subdomain !== null) {

						if (a.subdomain < b.subdomain) return -1;
						if (b.subdomain < a.subdomain) return  1;

					} else {

						if (a.subdomain !== null) return  1;
						if (b.subdomain !== null) return -1;

					}

				} else {

					if (a.domain !== null) return -1;
					if (b.domain !== null) return  1;

				}

				if (a.port !== null && b.port !== null) {

					if (a.port < b.port) return -1;
					if (b.port < a.port) return  1;

				} else {

					if (a.port !== null) return -1;
					if (b.port !== null) return  1;

				}

				if (a.path !== null && b.path !== null) {

					if (a.path < b.path) return -1;
					if (b.path < a.path) return  1;

				} else {

					if (a.path !== null) return -1;
					if (b.path !== null) return  1;

				}

				if (a.query !== null && b.query !== null) {

					if (a.query < b.query) return -1;
					if (b.query < a.query) return  1;

				} else {

					if (a.query !== null) return  1;
					if (b.query !== null) return -1;

				}

				return 0;

			});

		}


		return [];

	}

};


export const isURL   = URL.isURL;
export const parse   = URL.parse;
export const render  = URL.render;
export const resolve = URL.resolve;
export const sort    = URL.sort;

export { URL };

