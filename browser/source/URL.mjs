
const _TYPES = {

	'appcache': { type: 'text',  binary: false, format: 'text/cache-manifest'      },
	'default':  { type: 'other', binary: true,  format: 'application/octet-stream' },

	// application
	'abw':   { type: 'other', binary: true,  format: 'application/x-abiword'                                                     },
	'azw':   { type: 'other', binary: true,  format: 'application/vnd.amazon.ebook'                                              },
	'bin':   { type: 'other', binary: true,  format: 'application/octet-stream'                                                  },
	'csh':   { type: 'text',  binary: false, format: 'application/x-csh'                                                         },
	'doc':   { type: 'other', binary: true,  format: 'application/msword'                                                        },
	'docx':  { type: 'other', binary: true,  format: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'   },
	'eot':   { type: 'font',  binary: true,  format: 'application/vnd.ms-fontobject'                                             },
	'js':    { type: 'text',  binary: false, format: 'application/javascript'                                                    },
	'json':  { type: 'text',  binary: false, format: 'application/json'                                                          },
	'mjs':   { type: 'text',  binary: false, format: 'application/javascript'                                                    },
	'odp':   { type: 'other', binary: true,  format: 'application/vnd.oasis.opendocument.presentation'                           },
	'ods':   { type: 'other', binary: true,  format: 'application/vnd.oasis.opendocument.spreadsheet'                            },
	'odt':   { type: 'other', binary: true,  format: 'application/vnd.oasis.opendocument.text'                                   },
	'ogx':   { type: 'video', binary: true,  format: 'application/ogg'                                                           },
	'pdf':   { type: 'other', binary: true,  format: 'application/pdf'                                                           },
	'ppt':   { type: 'other', binary: true,  format: 'application/vnd.ms-powerpoint'                                             },
	'pptx':  { type: 'other', binary: true,  format: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
	'rtf':   { type: 'other', binary: true,  format: 'application/rtf'                                                           },
	'sh':    { type: 'text',  binary: false, format: 'application/x-sh'                                                          },
	'ts':    { type: 'text',  binary: false, format: 'application/typescript'                                                    },
	'vsd':   { type: 'other', binary: true,  format: 'application/vnd.visio'                                                     },
	'xhtml': { type: 'text',  binary: false, format: 'application/xhtml+xml'                                                     },
	'xls':   { type: 'other', binary: true,  format: 'application/vnd.ms-excel'                                                  },
	'xlsx':  { type: 'other', binary: true,  format: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'         },
	'xml':   { type: 'text',  binary: false, format: 'application/xml'                                                           },
	'xul':   { type: 'text',  binary: false, format: 'application/vnd.mozilla.xul+xml'                                           },

	// audio
	'3gp':   { type: 'audio', binary: true, format: 'audio/3gpp' },
	'3gpp':  { type: 'audio', binary: true, format: 'audio/3gpp' },
	'aac':   { type: 'audio', binary: true, format: 'audio/aac'  },
	'ac3':   { type: 'audio', binary: true, format: 'audio/ac3'  },
	'mid':   { type: 'audio', binary: true, format: 'audio/midi' },
	'mp3':   { type: 'audio', binary: true, format: 'audio/mp3'  },
	'oga':   { type: 'audio', binary: true, format: 'audio/ogg'  },
	'ogg':   { type: 'audio', binary: true, format: 'audio/ogg'  },
	'wav':   { type: 'audio', binary: true, format: 'audio/wav'  },
	'weba':  { type: 'audio', binary: true, format: 'audio/webm' },

	// font
	'otf':   { type: 'font', binary: true, format: 'font/otf'   },
	'sfnt':  { type: 'font', binary: true, format: 'font/sfnt'  },
	'ttf':   { type: 'font', binary: true, format: 'font/ttf'   },
	'woff':  { type: 'font', binary: true, format: 'font/woff'  },
	'woff2': { type: 'font', binary: true, format: 'font/woff2' },

	// image
	'bmp':  { type: 'image', binary: true, format: 'image/bmp'     },
	'emf':  { type: 'image', binary: true, format: 'image/emf'     },
	'gif':  { type: 'image', binary: true, format: 'image/gif'     },
	'ico':  { type: 'image', binary: true, format: 'image/x-icon'  },
	'jp2':  { type: 'image', binary: true, format: 'image/jp2'     },
	'jpeg': { type: 'image', binary: true, format: 'image/jpeg'    },
	'jpg':  { type: 'image', binary: true, format: 'image/jpeg'    },
	'png':  { type: 'image', binary: true, format: 'image/png'     },
	'tif':  { type: 'image', binary: true, format: 'image/tiff'    },
	'tiff': { type: 'image', binary: true, format: 'image/tiff'    },
	'svg':  { type: 'image', binary: true, format: 'image/svg+xml' },
	'webp': { type: 'image', binary: true, format: 'image/webp'    },
	'wmf':  { type: 'image', binary: true, format: 'image/wmf'     },

	// text
	'css':  { type: 'text', binary: false, format: 'text/css'            },
	'csv':  { type: 'text', binary: false, format: 'text/csv'            },
	'htm':  { type: 'text', binary: false, format: 'text/html'           },
	'html': { type: 'text', binary: false, format: 'text/html'           },
	'ical': { type: 'text', binary: false, format: 'text/calendar'       },
	'md':   { type: 'text', binary: false, format: 'text/x-markdown'     },
	'mf':   { type: 'text', binary: false, format: 'text/cache-manifest' },
	'txt':  { type: 'text', binary: false, format: 'text/plain'          },

	// video
	'avi':  { type: 'video', binary: true, format: 'video/x-msvideo' },
	'mpeg': { type: 'video', binary: true, format: 'video/mpeg'      },
	'ogv':  { type: 'video', binary: true, format: 'video/ogg'       },
	'webm': { type: 'video', binary: true, format: 'video/webm'      },

	// other
	'7z':   { type: 'other', binary: true, format: 'application/x-7z-compressed'  },
	'bz':   { type: 'other', binary: true, format: 'application/x-bzip'           },
	'bz2':  { type: 'other', binary: true, format: 'application/x-bzip2'          },
	'epub': { type: 'other', binary: true, format: 'application/epub+zip'         },
	'gz':   { type: 'other', binary: true, format: 'application/x-gzip'           },
	'jar':  { type: 'other', binary: true, format: 'application/jar-archive'      },
	'rar':  { type: 'other', binary: true, format: 'application/x-rar-compressed' },
	'tar':  { type: 'other', binary: true, format: 'application/x-tar'            },
	'zip':  { type: 'other', binary: true, format: 'application/zip'              }

};



const URL = {

	parse: function(url) {

		let protocol  = null;
		let domain    = null;
		let mime      = null;
		let path      = null;
		let query     = null;
		let subdomain = null;


		let tmp1 = url.split('?')[0] || '';
		let tmp2 = url.split('?')[1] || '';

		if (url.includes('://')) {

			protocol = tmp1.substr(0, tmp1.indexOf('://'));
			domain   = tmp1.substr(protocol.length + 3).split('/')[0];
			path     = '/' + tmp1.substr(protocol.length + 3).split('/').slice(1).join('/');
			query    = tmp2 !== '' ? tmp2 : null;

		} else if (url.startsWith('stealth:')) {

			protocol = 'stealth';
			domain   = tmp1.substr(protocol.length + 1).split('/')[0];
			path     = '/' + tmp1.substr(protocol.length + 1).split('/').slice(1).join('/');
			query    = tmp2 !== '' ? tmp2 : null;

		} else if (url.startsWith('/')) {

			protocol = 'file';
			domain   = null;
			path     = tmp1;
			query    = tmp2 !== '' ? tmp2 : null;

		} else {

			domain   = tmp1.split('/')[0];
			path     = '/' + tmp1.split('/').slice(1).join('/');

		}

		if (domain !== null && domain.includes('.') === true) {

			let check = domain.split('.').slice(0, -2);
			if (check.length > 0) {
				domain    = domain.split('.').slice(-2).join('.');
				subdomain = check.join('.');
			}

		}

		if (path !== null && path.includes('.')) {

			let ext  = path.split('.').pop();
			let type = _TYPES[ext] || null;

			if (type !== null) {
				mime = type;
			} else {
				mime = _TYPES['default'];
			}

		}

		return {
			domain:    domain,
			mime:      mime,
			protocol:  protocol,
			path:      path,
			query:     query,
			subdomain: subdomain,
			url:       url
		};

	}

};


export { URL };

