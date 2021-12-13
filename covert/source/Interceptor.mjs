
import child_process from 'child_process';
import tls           from 'tls';

import { console, Buffer, Emitter, isArray } from '../extern/base.mjs';
import { Filesystem                        } from '../source/Filesystem.mjs';



export const isInterceptor = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Interceptor]';
};

const connect_tls = function() {

	if (tls.COVERT_INTERCEPTING !== true) {

		let interceptor = this;
		let tls_connect = tls.connect;

		tls.connect = function() {

			let args   = [];
			let socket = undefined;

			for (let a = 0; a < arguments.length; a++) {
				args.push(arguments[a]);
			}

			socket = tls_connect.apply(tls, args);

			socket.on('keylog', (line) => {
				interceptor.emit('keys', [ line ]);
			});

			return socket;

		};

		tls.COVERT_CONNECT      = tls_connect;
		tls.COVERT_INTERCEPTING = true;

	}

};

const disconnect_tls = function() {

	if (tls.COVERT_INTERCEPTING === true) {

		tls.connect = tls.COVERT_CONNECT;

		delete tls.COVERT_CONNECT;
		delete tls.COVERT_INTERCEPTING;

	}

};

const connect_tcpdump = function(ports) {

	ports = isArray(ports) ? ports : [];


	let process = null;
	let args    = [
		'--interface=any',
		'--packet-buffered',
		'-w', '-'
	];

	if (ports.length > 0) {
		args.push('port');
		args.push('(' + ports.join(' or ') + ')');
	}

	try {
		process = child_process.spawn('tcpdump', args);
	} catch (err) {
		process = null;
	}

	if (process !== null) {

		process['stdout'].on('data', (data) => {
			this.emit('pcap', [ data ]);
		});

		process['stderr'].on('data', (data) => {

			let message = data.toString('utf8').trim();
			if (message.includes('Operation not permitted') === true) {
				console.error('Covert Interceptor: Cannot run tcpdump.');
				console.error('Covert Interceptor: Please use "sudo setcap cap_net_raw,cap_net_admin=eip /usr/bin/tcpdump" to allow running as non-root user.');
			}

		});

		process.on('error', (err) => {

			if (err.code === 'ENOENT') {
				console.error('Covert Interceptor: Cannot run tcpdump.');
				console.error('Covert Interceptor: Please install "tcpdump" to intercept and save network traffic into the report file.');
			}

		});

		process.on('close', () => {
			this.__state.process = null;
		});

		this.__state.process = process;

	}

};

const disconnect_tcpdump = function() {

	if (this.__state.process !== null) {

		this.__state.process.kill('SIGTERM');

	}

};



const Interceptor = function(settings) {

	this._settings = Object.freeze(Object.assign({
		report:  null,
		reviews: []
	}, settings));

	this.filesystem = new Filesystem(this._settings);

	this.__state = {
		connected: false,
		keys:      Buffer.alloc(0),
		pcap:      Buffer.alloc(0),
		process:   null
	};


	Emitter.call(this);


	this.on('keys', (data) => {

		this.__state.keys = Buffer.concat([ this.__state.keys, data ]);

		if (this._settings.report !== null) {
			this.filesystem.write(this._settings.report + '.keys', this.__state.keys, 'utf8');
		}

	});

	this.on('pcap', (data) => {

		this.__state.pcap = Buffer.concat([ this.__state.pcap, data ]);

		if (this._settings.report !== null) {
			this.filesystem.write(this._settings.report + '.pcap', this.__state.pcap, 'binary');
		}

	});

};


Interceptor.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Interceptor',

	connect: function() {

		if (this.__state.connected === false) {

			let ports = [];

			this._settings.reviews.forEach((review) => {

				if (isArray(review.flags.ports) === true) {
					review.flags.ports.forEach((port) => {

						if (ports.includes(port) === false) {
							ports.push(port);
						}

					});
				}

			});

			if (ports.length > 0) {
				console.info('Covert Interceptor: Intercepting network traffic on port' + (ports.length > 1 ? 's' : '') + ' ' + ports.join(', ') + '.');
			} else {
				console.info('Covert Interceptor: Intercepting all network traffic.');
			}

			connect_tls.call(this);
			connect_tcpdump.call(this, ports);

			this.__state.connected = true;

			return true;

		}


		return false;

	},

	disconnect: function() {

		if (this.__state.connected === true) {

			disconnect_tls.call(this);
			disconnect_tcpdump.call(this);

			this.__state.connected = false;

			return true;

		}


		return false;

	}

});


export { Interceptor };

