
import { isArray, isBoolean, isBuffer, isNumber, isObject, isString } from '../../extern/base.mjs';
import { IP                                                         } from '../../source/parser/IP.mjs';



const DOUBLE_TOPLEVELDOMAINS = [
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

const INVALID_TOPLEVELDOMAINS = [

	// DNS RFC2606
	'domain',
	'example',
	'invalid',
	'local',
	'localhost',
	'test',

	// Basically RFC-violating companies
	'belkin',
	'corp',
	'home',
	'host',
	'lan',
	'localdomain',
	'mail',
	'wpad',
	'workgroup'

];

const MIME_DEFAULT = {
	ext:    'bin',
	type:   'other',
	binary: true,
	format: 'application/octet-stream'
};

const MIME = [

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
	{ ext: 'm4v',  type: 'video', binary: true, format: 'video/mp4'       },
	{ ext: 'mov',  type: 'video', binary: true, format: 'video/quicktime' },
	{ ext: 'mp4',  type: 'video', binary: true, format: 'video/mp4'       },
	{ ext: 'mpeg', type: 'video', binary: true, format: 'video/mpeg'      },
	{ ext: 'mpg4', type: 'video', binary: true, format: 'video/mp4'       },
	{ ext: 'ogv',  type: 'video', binary: true, format: 'video/ogg'       },
	{ ext: 'qt',   type: 'video', binary: true, format: 'video/quicktime' },
	{ ext: 'webm', type: 'video', binary: true, format: 'video/webm'      },

	// other
	{ ext: '7z',     type: 'other', binary: true, format: 'application/x-7z-compressed'       },
	{ ext: 'bz',     type: 'other', binary: true, format: 'application/x-bzip'                },
	{ ext: 'bz2',    type: 'other', binary: true, format: 'application/x-bzip2'               },
	{ ext: 'epub',   type: 'other', binary: true, format: 'application/epub+zip'              },
	{ ext: 'gz',     type: 'other', binary: true, format: 'application/x-gzip'                },
	{ ext: 'jar',    type: 'other', binary: true, format: 'application/jar-archive'           },
	{ ext: 'pac',    type: 'other', binary: true, format: 'application/x-ns-proxy-autoconfig' },
	{ ext: 'pcap',   type: 'other', binary: true, format: 'application/vnd.tcpdump.pcap'      },
	{ ext: 'pcapng', type: 'other', binary: true, format: 'application/x-pcapng'              },
	{ ext: 'rar',    type: 'other', binary: true, format: 'application/x-rar-compressed'      },
	{ ext: 'tar',    type: 'other', binary: true, format: 'application/x-tar'                 },
	{ ext: 'zip',    type: 'other', binary: true, format: 'application/zip'                   }

];

const isMIME = function(mime) {

	if (
		isObject(mime) === true
		&& isString(mime.ext) === true
		&& isString(mime.type) === true
		&& isBoolean(mime.binary) === true
		&& isString(mime.format) === true
	) {

		let other = MIME.find((m) => m.ext === mime.ext) || null;
		if (other !== null) {

			if (
				other.type === mime.type
				&& other.binary === mime.binary
				&& other.format === mime.format
			) {
				return true;
			}

		}

	}

	return false;

};

const isPolicy = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& isArray(payload.policies) === true
	) {

		let check = payload.policies.filter((policy) => {

			if (
				isObject(policy) === true
				&& isString(policy.path) === true
				&& (isString(policy.query) === true || policy.query === null)
			) {
				return true;
			}

			return false;

		});

		if (check.length === payload.policies.length) {
			return true;
		}

	}


	return false;

};

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

	compare: function(a, b) {

		let is_url_a = URL.isURL(a) === true;
		let is_url_b = URL.isURL(b) === true;

		if (is_url_a === true && is_url_b === true) {

			if (a.protocol === 'stealth' && b.protocol !== 'stealth') return 1;
			if (b.protocol === 'stealth' && a.protocol !== 'stealth') return -1;


			if (a.protocol !== null && b.protocol !== null) {

				if (a.protocol < b.protocol) return -1;
				if (b.protocol < a.protocol) return 1;

			} else {

				if (a.protocol !== null) return -1;
				if (b.protocol !== null) return 1;

			}

			if (a.host !== null && b.host !== null) {

				if (a.host < b.host) return -1;
				if (b.host < a.host) return 1;

			} else {

				if (a.host !== null) return -1;
				if (b.host !== null) return 1;

			}

			if (a.domain !== null && b.domain !== null) {

				if (a.domain < b.domain) return -1;
				if (b.domain < a.domain) return 1;

				if (a.subdomain !== null && b.subdomain !== null) {

					if (a.subdomain < b.subdomain) return -1;
					if (b.subdomain < a.subdomain) return 1;

				} else {

					if (a.subdomain !== null) return 1;
					if (b.subdomain !== null) return -1;

				}

			} else {

				if (a.domain !== null) return -1;
				if (b.domain !== null) return 1;

			}

			if (a.port !== null && b.port !== null) {

				if (a.port < b.port) return -1;
				if (b.port < a.port) return 1;

			} else {

				if (a.port !== null) return -1;
				if (b.port !== null) return 1;

			}

			if (a.path !== null && b.path !== null) {

				if (a.path < b.path) return -1;
				if (b.path < a.path) return 1;

			} else {

				if (a.path !== null) return -1;
				if (b.path !== null) return 1;

			}

			if (a.query !== null && b.query !== null) {

				if (a.query < b.query) return -1;
				if (b.query < a.query) return 1;

			} else {

				if (a.query !== null) return 1;
				if (b.query !== null) return -1;

			}

			return 0;

		} else if (is_url_a === true) {
			return -1;
		} else if (is_url_b === true) {
			return 1;
		}


		return 0;

	},

	filter: function(url, policy) {

		url    = URL.isURL(url)   ? url    : null;
		policy = isPolicy(policy) ? policy : null;


		if (url !== null && policy !== null) {

			let found = policy.policies.find((policy) => {

				let pattern = policy.path;
				if (pattern.startsWith('*') === true) {

					return url.path.endsWith(pattern.substr(1)) === true;

				} else if (pattern.endsWith('*') === true) {

					return url.path.startsWith(pattern.substr(0, pattern.length - 1)) === true;

				} else if (pattern.includes('*') === true) {

					return (
						url.path.startsWith(pattern.split('*').shift()) === true
						&& url.path.endsWith(pattern.split('*').pop()) === true
					);

				} else {

					return url.path === policy.path;

				}

			}) || null;

			if (found !== null) {

				let parameters = [];
				let patterns   = [];

				found.query.split('&').forEach((chunk) => {

					let key = chunk.split('=')[0] || null;
					let val = chunk.split('=')[1] || null;

					if (key !== null && val !== null) {
						patterns.push({ key: key, val: val });
					} else if (key !== null) {
						patterns.push({ key: key, val: '*' });
					}

				});

				url.query.split('&').map((chunk) => ({
					key: chunk.split('=')[0] || null,
					val: chunk.split('=')[1] || ''
				})).sort((a, b) => {
					if (a.key < b.key) return -1;
					if (b.key < a.key) return  1;
					return 0;
				}).forEach((parameter) => {

					let valid_key = false;
					let valid_val = false;

					for (let p = 0, pl = patterns.length; p < pl; p++) {

						let pattern = patterns[p];

						if (pattern.key.startsWith('*') === true) {
							valid_key = parameter.key.endsWith(pattern.key.substr(1)) === true;
						} else if (pattern.key.endsWith('*') === true) {
							valid_key = parameter.key.startsWith(pattern.key.substr(0, pattern.key.length - 1)) === true;
						} else if (pattern.key.includes('*') === true) {
							valid_key = (
								parameter.key.startsWith(pattern.key.split('*')[0]) === true
								&& parameter.key.endsWith(pattern.key.split('*')[1]) === true
							);
						} else {
							valid_key = parameter.key === pattern.key;
						}

						if (pattern.val.startsWith('*') === true) {
							valid_val = parameter.val.endsWith(pattern.val.substr(1)) === true;
						} else if (pattern.val.endsWith('*') === true) {
							valid_val = parameter.val.startsWith(pattern.val.substr(0, pattern.val.length - 1)) === true;
						} else if (pattern.val.includes('*') === true) {
							valid_val = (
								parameter.val.startsWith(pattern.val.split('*')[0]) === true
								&& parameter.val.endsWith(pattern.val.split('*')[1]) === true
							);
						} else {
							valid_val = parameter.val === pattern.val;
						}

						if (valid_key === true && valid_val === true) {
							break;
						}

					}

					if (valid_key === true && valid_val === true) {
						parameters.push(parameter);
					}

				});


				let query = '';

				parameters.forEach((parameter, p) => {

					if (p > 0) {
						query += '&';
					}

					query += parameter.key + '=' + parameter.val;

				});


				return {

					domain:    url.domain,
					hash:      url.hash,
					host:      url.host,
					mime:      url.mime,
					path:      url.path,
					port:      url.port,
					protocol:  url.protocol,
					query:     query,
					subdomain: url.subdomain,

					// Browser API
					link:      URL.render({
						domain:    url.domain,
						host:      url.host,
						path:      url.path,
						port:      url.port,
						protocol:  url.protocol,
						query:     query,
						subdomain: url.subdomain
					}),

					// DNS API
					hosts:     url.hosts,

					// Service API
					headers:   url.headers,
					payload:   url.payload

				};

			}

			return url;

		}


		return null;

	},

	isDomain: function(absolute, relative) {

		let url_absolute = null;

		if (isString(absolute) === true) {
			url_absolute = URL.parse(absolute);
		} else if (URL.isURL(absolute) === true) {
			url_absolute = absolute;
		}

		let url_relative = null;

		if (isString(relative) === true) {
			url_relative = URL.parse(relative);
		} else if (URL.isURL(relative) === true) {
			url_relative = relative;
		} else if (isObject(relative) === true) {
			url_relative      = URL.parse();
			url_relative.path = isString(relative.path) ? relative.path : '';
		}


		if (url_absolute !== null && url_relative !== null) {

			if (url_absolute.protocol === 'stealth' && url_relative.protocol === 'stealth') {

				if (url_absolute.domain !== null && url_relative.domain !== null) {
					return true;
				}

			} else if (url_absolute.protocol !== 'file') {

				if (
					isString(url_absolute.domain) === true
					&& isString(url_relative.domain) === true
				) {

					if (url_absolute.domain === url_relative.domain) {

						if (url_absolute.subdomain !== null && url_relative.subdomain !== null) {

							let chunks_absolute = url_absolute.subdomain.split('.').reverse();
							let chunks_relative = url_relative.subdomain.split('.').reverse();

							if (chunks_relative.length >= chunks_absolute.length) {

								let check = true;

								for (let c = 0, cl = Math.min(chunks_relative.length, chunks_absolute.length); c < cl; c++) {

									if (chunks_relative[c] !== chunks_absolute[c]) {
										check = false;
										break;
									}

								}

								return check;

							}

						} else if (url_absolute.subdomain === null && url_relative.subdomain !== null) {

							return true;

						} else if (url_absolute.subdomain === null && url_relative.subdomain === null) {

							return true;

						}

					}

				} else if (
					isString(url_absolute.host) === true
					&& isString(url_relative.host) === true
				) {

					if (url_absolute.host === url_relative.host) {
						return true;
					}

				}

			}

		}


		return false;

	},

	isURL: function(payload) {

		payload = isObject(payload) ? payload : null;


		if (payload !== null) {

			let protocol = payload.protocol || null;
			if (protocol === 'file') {

				if (
					(isMIME(payload.mime) === true || payload.mime === null)
					&& isString(payload.path) === true
				) {
					return true;
				}

			} else if (
				protocol === 'dns'
				|| protocol === 'dnsh'
				|| protocol === 'dnss'
				|| protocol === 'ftps'
				|| protocol === 'ftp'
				|| protocol === 'https'
				|| protocol === 'http'
				|| protocol === 'mdns'
				|| protocol === 'whois'
				|| protocol === 'wss'
				|| protocol === 'ws'
				|| protocol === 'socks'
			) {

				if (
					isString(payload.domain) === true
					&& (isString(payload.subdomain) === true || payload.subdomain === null)
				) {

					if (
						(isString(payload.hash) === true || payload.hash === null)
						&& payload.host === null
						&& (isMIME(payload.mime) === true || payload.mime === null)
						&& isString(payload.path) === true
						&& isNumber(payload.port) === true
						&& (isString(payload.query) === true || payload.query === null)
					) {
						return true;
					}

				} else if (
					isString(payload.host) === true
				) {

					if (
						payload.domain === null
						&& payload.subdomain === null
						&& (isString(payload.hash) === true || payload.hash === null)
						&& (isMIME(payload.mime) === true || payload.mime === null)
						&& isString(payload.path) === true
						&& isNumber(payload.port) === true
						&& (isString(payload.query) === true || payload.query === null)
					) {
						return true;
					}

				}

			} else if (
				protocol === 'stealth'
			) {

				if (
					isString(payload.domain) === true
					&& (isString(payload.hash) === true || payload.hash === null)
					&& (isMIME(payload.mime) === true || payload.mime === null)
					&& (isString(payload.query) === true || payload.query === null)
				) {
					return true;
				}


			}

		}


		return false;

	},

	parse: function(buf_or_str) {

		let raw = null;

		if (isBuffer(buf_or_str) === true) {
			raw = buf_or_str.toString('utf8');
		} else if (isString(buf_or_str) === true) {
			raw = buf_or_str;
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

		if (raw !== null) {

			let prefix = raw.split('?')[0] || '';
			let suffix = raw.split('?')[1] || '';

			if (prefix.startsWith('stealth:') === true) {

				protocol = 'stealth';
				domain   = prefix.substr(protocol.length + 1).split('/')[0];
				path     = '/' + prefix.substr(protocol.length + 1).split('/').slice(1).join('/');
				query    = suffix !== '' ? suffix : null;

			} else if (prefix.startsWith('file://') === true) {

				protocol = 'file';
				path     = '/' + prefix.substr(protocol.length + 3).split('/').slice(1).join('/');
				query    = suffix !== '' ? suffix : null;

			} else if (prefix.startsWith('//') === true) {

				protocol = 'https';
				domain   = prefix.substr(2).split('/')[0];
				path     = '/' + prefix.substr(2).split('/').slice(1).join('/');
				query    = suffix !== '' ? suffix : null;

			} else if (prefix.startsWith('/') === true) {

				protocol = 'file';
				domain   = null;
				host     = null;
				path     = prefix;
				query    = suffix !== '' ? suffix : null;

			} else if (prefix.startsWith('..') === true) {

				path     = prefix;
				query    = suffix !== '' ? suffix : null;

			} else if (prefix.startsWith('.') === true) {

				path     = prefix;
				query    = suffix !== '' ? suffix : null;

			} else if (prefix.includes('://') === true) {

				protocol = prefix.substr(0, prefix.indexOf('://'));
				domain   = prefix.substr(protocol.length + 3).split('/')[0];
				path     = '/' + prefix.substr(protocol.length + 3).split('/').slice(1).join('/');
				query    = suffix !== '' ? suffix : null;

			} else if (prefix.startsWith('?') === true) {

				query    = suffix !== '' ? suffix : null;

			} else if (prefix.startsWith('#') === true) {

				hash     = prefix.split('#').slice(1).join('#');

			} else {

				domain   = prefix.split('/')[0];
				path     = '/' + prefix.split('/').slice(1).join('/');
				query    = suffix !== '' ? suffix : null;

			}

			if (domain !== null && /^([a-zA-z0-9.:-]+)$/.test(domain) === false) {
				domain = null;
			}


			if (path !== null && path.includes('#') === true) {
				hash = path.split('#').slice(1).join('#');
				path = path.split('#').shift();
			}

			if (query !== null && query.includes('#') === true) {
				hash  = query.split('#').slice(1).join('#');
				query = query.split('#').shift();
			}


			let check_ipv6 = false;
			let check_ipv4 = false;

			if (domain !== null && domain.includes(':') === true) {
				check_ipv6 = domain.split(':').length > 2;
			}

			if (domain !== null && domain.includes('.') === true) {
				check_ipv4 = /^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/g.test(domain.split(':')[0]) === true;
			}

			if (check_ipv6 === true) {

				if (domain.startsWith('[') === true) {
					domain = domain.substr(1);
				}

				if (domain.includes(']:') === true) {

					let tmp1 = domain.split(']:');
					let tmp2 = parseInt(tmp1[1], 10);

					domain = tmp1[0];

					if (Number.isNaN(tmp2) === false && tmp2 > 0 && tmp2 < 65535) {
						port = tmp2;
					}

				} else if (domain.includes(']') === true) {
					domain = domain.split(']').join('');
				}


				let ip = IP.parse(domain);
				if (ip.type === 'v6') {

					domain = null;
					host   = '[' + ip.ip + ']';
					hosts.push(ip);

				}

			} else if (check_ipv4 === true) {

				if (domain.includes('[') === true) {
					domain = domain.split('[').join('');
				}

				if (domain.includes(']') === true) {
					domain = domain.split(']').join('');
				}

				if (domain.includes(':') === true) {

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

			} else if (domain !== null && domain.includes('.') === true) {

				if (domain.includes(':') === true) {

					let tmp1 = domain.split(':');
					let tmp2 = parseInt(tmp1[1], 10);

					domain = tmp1[0];

					if (Number.isNaN(tmp2) === false && tmp2 > 0 && tmp2 < 65535) {
						port = tmp2;
					}

				}


				let tmp_tld = domain.split('.').slice(-2).join('.');
				let tmp_sub = domain.split('.').slice(0, -2);

				if (DOUBLE_TOPLEVELDOMAINS.includes(tmp_tld) === true && tmp_sub.length > 0) {

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

				if (domain.startsWith('-') === true) {
					domain = null;
				}

			} else if (domain !== null) {

				if (domain.includes(':') === true) {

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

			if (domain !== null && domain !== 'localhost') {

				if (domain.includes('.') === true) {

					let tld = domain.split('.').pop();
					if (INVALID_TOPLEVELDOMAINS.includes(tld) === true) {
						domain    = null;
						subdomain = null;
					}

				} else {

					if (INVALID_TOPLEVELDOMAINS.includes(domain) === true) {
						domain    = null;
						subdomain = null;
					}

				}

			}

			if (path !== null && path.includes('.') === true) {

				let ext  = path.split('.').pop();
				let type = MIME.find((m) => m.ext === ext) || null;

				if (type !== null) {
					mime = Object.assign({}, type);
				} else {
					mime = Object.assign({}, MIME_DEFAULT);
				}

			} else {

				// assume text/html by default
				let type = MIME.find((m) => m.ext === 'html') || null;

				if (type !== null) {
					mime = Object.assign({}, type);
				} else {
					mime = Object.assign({}, MIME_DEFAULT);
				}

			}


			if (protocol !== null && port === null) {

				if (protocol === 'file') {
					// Do nothing
				} else if (protocol === 'dns') {
					port = 53;
				} else if (protocol === 'dnsh') {
					port = 443;
				} else if (protocol === 'dnss') {
					port = 853;
				} else if (protocol === 'ftps') {
					port = 990;
				} else if (protocol === 'ftp') {
					port = 21;
				} else if (protocol === 'https') {
					port = 443;
				} else if (protocol === 'http') {
					port = 80;
				} else if (protocol === 'mdns') {
					port = 5353;
				} else if (protocol === 'whois') {
					port = 43;
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

			// Browser API
			link:      URL.render({
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

	render: function(url) {

		url = isObject(url) ? url : null;


		if (url !== null) {

			let link = '';

			if (isString(url.protocol) === true) {

				if (url.protocol === 'stealth') {
					link += url.protocol + ':';
				} else {
					link += url.protocol + '://';
				}

			}

			if (isString(url.domain) === true) {

				if (isString(url.subdomain) === true) {
					link += url.subdomain + '.' + url.domain;
				} else {
					link += url.domain;
				}

			} else if (isString(url.host) === true) {

				link += url.host;

			}


			if (isString(url.protocol) === true) {

				if (url.protocol === 'file') {

					// Do nothing

				} else if (url.protocol === 'dns') {

					if (url.port !== 53) {
						link += ':' + url.port;
					}

				} else if (url.protocol === 'dnsh') {

					if (url.port !== 443) {
						link += ':' + url.port;
					}

				} else if (url.protocol === 'dnss') {

					if (url.port !== 853) {
						link += ':' + url.port;
					}

				} else if (url.protocol === 'ftps') {

					if (url.port !== 990) {
						link += ':' + url.port;
					}

				} else if (url.protocol === 'ftp') {

					if (url.port !== 21) {
						link += ':' + url.port;
					}

				} else if (url.protocol === 'https') {

					if (url.port !== 443) {
						link += ':' + url.port;
					}

				} else if (url.protocol === 'http') {

					if (url.port !== 80) {
						link += ':' + url.port;
					}

				} else if (url.protocol === 'mdns') {

					if (url.port !== 5353) {
						link += ':' + url.port;
					}

				} else if (url.protocol === 'whois') {

					if (url.port !== 43) {
						link += ':' + url.port;
					}

				} else if (url.protocol === 'wss') {

					if (url.port !== 443) {
						link += ':' + url.port;
					}

				} else if (url.protocol === 'ws') {

					if (url.port !== 80) {
						link += ':' + url.port;
					}

				} else if (url.protocol === 'socks') {

					if (url.port !== 1080) {
						link += ':' + url.port;
					}

				} else if (url.protocol === 'stealth') {

					// Do nothing

				} else if (url.port !== null) {
					link += ':' + url.port;
				}

			}

			if (url.protocol !== 'stealth') {

				if (isString(url.path) === true) {
					link += url.path;
				}

			}

			if (isString(url.query) === true) {
				link += '?' + url.query;
			}

			return link;

		}


		return null;

	},

	resolve: function(absolute, relative) {

		let url_absolute = null;

		if (isString(absolute) === true) {
			url_absolute = URL.parse(absolute);
		} else if (URL.isURL(absolute) === true) {
			url_absolute = absolute;
		}

		let url_relative = null;

		if (isString(relative) === true) {
			url_relative = URL.parse(relative);
		} else if (URL.isURL(relative) === true) {
			url_relative = relative;
		} else if (isObject(relative) === true) {
			url_relative      = URL.parse();
			url_relative.path = isString(relative.path) ? relative.path : '';
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

		if (url_absolute !== null && url_relative !== null) {

			if (url_relative.protocol === 'stealth') {

				domain    = url_relative.domain;
				hash      = url_relative.hash;
				host      = url_relative.host;
				hosts     = url_relative.hosts;
				mime      = url_relative.mime;
				path      = url_relative.path;
				port      = url_relative.port;
				protocol  = url_relative.protocol;
				query     = url_relative.query;
				subdomain = url_relative.subdomain;

			} else if (url_relative.path.startsWith('../') === true) {

				domain    = url_absolute.domain;
				host      = url_absolute.host;
				hosts     = url_absolute.hosts;
				port      = url_absolute.port;
				protocol  = url_absolute.protocol;
				subdomain = url_absolute.subdomain;

				hash      = url_relative.hash;
				mime      = url_relative.mime;
				query     = url_relative.query;

				let is_folder = url_absolute.path.endsWith('/') === true;
				if (is_folder === true) {
					path = resolve_path(url_absolute.path + url_relative.path);
				} else {
					path = resolve_path(url_absolute.path.split('/').slice(0, -1).join('/') + '/' + url_relative.path);
				}

			} else if (url_relative.path.startsWith('./') === true) {

				domain    = url_absolute.domain;
				host      = url_absolute.host;
				hosts     = url_absolute.hosts;
				port      = url_absolute.port;
				protocol  = url_absolute.protocol;
				subdomain = url_absolute.subdomain;

				hash      = url_relative.hash;
				mime      = url_relative.mime;
				query     = url_relative.query;

				let is_folder = url_absolute.path.endsWith('/') === true;
				if (is_folder === true) {
					path = resolve_path(url_absolute.path + url_relative.path);
				} else {
					path = resolve_path(url_absolute.path.split('/').slice(0, -1).join('/') + '/' + url_relative.path);
				}

			} else if (isString(relative) === true && relative.startsWith('//') === true) {

				domain    = url_relative.domain;
				host      = url_relative.host;
				hosts     = url_relative.hosts;

				if (url_absolute.protocol !== 'file') {
					protocol = url_absolute.protocol;
				} else {
					protocol = url_relative.protocol;
				}

				if (url_relative.protocol === 'https' && url_relative.port === 443) {

					if (protocol === 'file') {
						// Do nothing
					} else if (protocol === 'dns') {
						port = 53;
					} else if (protocol === 'dnsh') {
						port = 443;
					} else if (protocol === 'dnss') {
						port = 853;
					} else if (protocol === 'ftps') {
						port = 990;
					} else if (protocol === 'ftp') {
						port = 21;
					} else if (protocol === 'https') {
						port = 443;
					} else if (protocol === 'http') {
						port = 80;
					} else if (protocol === 'mdns') {
						port = 5353;
					} else if (protocol === 'whois') {
						port = 43;
					} else if (protocol === 'wss') {
						port = 443;
					} else if (protocol === 'ws') {
						port = 80;
					} else if (protocol === 'socks') {
						port = 1080;
					} else if (protocol === 'stealth') {
						// Do nothing
					}

				} else {

					port = url_relative.port;

				}

				subdomain = url_relative.subdomain;

				hash      = url_relative.hash;
				mime      = url_relative.mime;
				path      = resolve_path(url_relative.path);
				query     = url_relative.query;

			} else if (isString(relative) === true && relative.startsWith('/') === true) {

				domain    = url_absolute.domain;
				host      = url_absolute.host;
				hosts     = url_absolute.hosts;
				port      = url_absolute.port;
				protocol  = url_absolute.protocol;
				subdomain = url_absolute.subdomain;

				hash      = url_relative.hash;
				mime      = url_relative.mime;
				path      = resolve_path(url_relative.path);
				query     = url_relative.query;

			} else if (url_relative.protocol !== null) {

				domain    = url_relative.domain;
				hash      = url_relative.hash;
				host      = url_relative.host;
				hosts     = url_relative.hosts;
				mime      = url_relative.mime;
				path      = resolve_path(url_relative.path);
				port      = url_relative.port;
				protocol  = url_relative.protocol;
				query     = url_relative.query;
				subdomain = url_relative.subdomain;

			}

		} else if (url_absolute !== null) {

			domain    = url_absolute.domain;
			hash      = url_absolute.hash;
			host      = url_absolute.host;
			hosts     = url_absolute.hosts;
			mime      = url_absolute.mime;
			path      = resolve_path(url_absolute.path);
			port      = url_absolute.port;
			protocol  = url_absolute.protocol;
			query     = url_absolute.query;
			subdomain = url_absolute.subdomain;

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

			// Browser API
			link:      URL.render({
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

			return array.filter((url) => {
				return URL.isURL(url) === true;
			}).sort((a, b) => {
				return URL.compare(a, b);
			});

		}


		return [];

	},

	toDomain: function(payload) {

		payload = isObject(payload) ? payload : null;


		if (payload !== null) {

			let domain = null;

			if (isString(payload.domain) === true) {

				if (isString(payload.subdomain) === true) {
					domain = payload.subdomain + '.' + payload.domain;
				} else {
					domain = payload.domain;
				}

			}

			return domain;

		}


		return null;

	},

	toHost: function(payload) {

		payload = isObject(payload) ? payload : null;


		if (payload !== null) {

			let host = null;

			if (isString(payload.host) === true) {

				host = payload.host;

			} else if (isArray(payload.hosts) === true) {

				let hosts = IP.sort(payload.hosts);
				if (hosts.length > 0) {

					let ip = hosts[0];
					if (ip.type === 'v4') {
						host = ip.ip;
					} else if (ip.type === 'v6') {
						host = '[' + ip.ip + ']';
					}

				}

			}

			return host;

		}


		return null;

	}

};


export { URL };

