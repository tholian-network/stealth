
const _TYPES = {
	'default':  { binary: true,  type: 'application/octet-stream'      },
	'appcache': { binary: false, type: 'text/cache-manifest'           },
	'css':      { binary: false, type: 'text/css'                      },
	'env':      { binary: false, type: 'application/json'              },
	'eot':      { binary: false, type: 'application/vnd.ms-fontobject' },
	'gz':       { binary: true,  type: 'application/x-gzip'            },
	'fnt':      { binary: false, type: 'application/json'              },
	'html':     { binary: false, type: 'text/html'                     },
	'ico':      { binary: true,  type: 'image/x-icon'                  },
	'jpg':      { binary: true,  type: 'image/jpeg'                    },
	'js':       { binary: false, type: 'application/javascript'        },
	'json':     { binary: false, type: 'application/json'              },
	'md':       { binary: false, type: 'text/x-markdown'               },
	'mf':       { binary: false, type: 'text/cache-manifest'           },
	'mjs':      { binary: false, type: 'application/javascript'        },
	'mp3':      { binary: true,  type: 'audio/mp3'                     },
	'ogg':      { binary: true,  type: 'application/ogg'               },
	'pkg':      { binary: false, type: 'application/json'              },
	'store':    { binary: false, type: 'application/json'              },
	'tar':      { binary: true,  type: 'application/x-tar'             },
	'ttf':      { binary: false, type: 'application/x-font-truetype'   },
	'txt':      { binary: false, type: 'text/plain'                    },
	'png':      { binary: true,  type: 'image/png'                     },
	'svg':      { binary: true,  type: 'image/svg+xml'                 },
	'woff':     { binary: true,  type: 'application/font-woff'         },
	'woff2':    { binary: true,  type: 'application/font-woff'         },
	'xml':      { binary: false, type: 'text/xml'                      },
	'zip':      { binary: true,  type: 'application/zip'               }
};



const MIME = {

	get: function(url) {

		let ext  = url.split('.').pop().split('?')[0];
		let mime = _TYPES[ext] || null;
		if (mime !== null) {
			return mime;
		}


		return _TYPES['default'];

	}

};


export { MIME };

