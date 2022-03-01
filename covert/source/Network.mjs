
import { execSync } from 'child_process';
import net          from 'net';
import os           from 'os';

import { console, isFunction, isNumber, isString } from '../extern/base.mjs';
import { IP                                      } from '../../stealth/source/parser/IP.mjs';



export const isNetwork = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Network]';
};

const PROFILES = {
	'1G': {
		rx:  64,
		tx:  64,
		rtt: 10000
	},
	'2G': {
		rx:  280,
		tx:  256,
		rtt: 420
	},
	'3G': {
		rx:  1600,
		tx:  768,
		rtt: 75
	},
	'4G': {
		rx:  21600,
		tx:  21600,
		rtt: 80
	},
	'5G': {
		rx:  250000,
		tx:  250000,
		rtt: 30
	}
};

const STATE = {
	network: null
};

const connect = (network) => {

	let profile = PROFILES[network] || null;
	if (profile !== null) {

		console.info('Covert Network: Enabling ' + network + ' network bandwidth throttling.');

		if (exec('lsmod | grep ifb') === false) {

			let check = sudo('modprobe ifb');
			if (check === false) {
				return false;
			}

		}


		let iface = get_interface();
		if (iface !== null) {

			let result = sudo('ip link add ifb0 type ifb');
			if (result === true) {

				sudo('ip link set dev ifb0 up');

				sudo('tc qdisc add dev ' + iface + ' ingress');
				sudo('tc filter add dev ' + iface + ' parent ffff: protocol ip u32 match u32 0 0 flowid 1:1 action mirred egress redirect dev ifb0');

				sudo('tc qdisc add dev ifb0 root handle 1:0 netem delay ' + profile.rtt + 'ms rate ' + profile.rx + 'kbit');
				sudo('tc qdisc add dev ' + iface + ' root handle 1:0 netem delay ' + profile.rtt + 'ms rate ' + profile.tx + 'kbit');

				return true;

			}

		}

	}


	return false;

};

const disconnect = () => {

	console.info('Covert Network: Disabling network bandwidth throttling.');

	if (exec('ip link | grep ifb0') === true) {

		let iface = get_interface();
		if (iface !== null) {

			sudo('tc qdisc del dev ' + iface + ' root');
			sudo('tc qdisc del dev ' + iface + ' ingress');

		}

		sudo('tc qdisc del dev ifb0 root');
		sudo('ip link delete dev ifb0');

		return true;

	}


	return false;

};

const exec = (cmd) => {

	cmd = isString(cmd) ? cmd : null;


	let error = null;

	try {

		execSync(cmd);

	} catch (err) {

		if (err.status !== 0) {
			error = err;
		}

	}

	if (error === null) {
		return true;
	}


	return false;

};

const get_interface = () => {

	let found      = null;
	let interfaces = os.networkInterfaces();

	for (let iface in interfaces) {

		interfaces[iface].forEach((entry) => {

			if (found === null) {

				let ip = IP.parse(entry.address);
				if (ip.scope === 'public') {
					found = iface;
				} else if (ip.type !== null && entry.internal === false) {
					found = iface;
				}

			}

		});

		if (found !== null) {
			break;
		}

	}

	return found;

};

const sudo = (cmd) => {

	cmd = isString(cmd) ? cmd : null;

	if (cmd.startsWith('sudo ') === false) {
		cmd = 'sudo ' + cmd.trim();
	}


	let error = null;

	try {

		execSync(cmd);

	} catch (err) {

		if (err.status !== 0) {
			error = err;
		}

	}

	if (error === null) {
		return true;
	}


	return false;

};



const Network = function(settings) {

	this._settings = Object.freeze(Object.assign({
		network: null
	}, settings));

};


Network.prototype = {

	[Symbol.toStringTag]: 'Network',

	check: function(port, callback) {

		port     = isNumber(port)       ? port     : null;
		callback = isFunction(callback) ? callback : null;


		if (
			port !== null
			&& port > 0x0000
			&& port < 0xffff
			&& callback !== null
		) {

			let socket = new net.Socket();
			let status = null;

			socket.on('connect', () => {
				status = 'used';
				socket.destroy();
			});

			socket.on('timeout', () => {
				status = 'free';
				socket.destroy();
			});

			socket.on('error', (err) => {

				if (err.code === 'ECONNREFUSED') {
					status = 'free';
				} else {
					status = 'used';
				}

			});

			socket.on('close', () => {

				if (status === 'free') {
					callback(true);
				} else {
					callback(false);
				}

			});

			socket.connect(port, '127.0.0.1');

		}

	},

	connect: function() {

		console.info('Covert Network: Connect local peer network');

		if (os.platform() === 'darwin') {

			sudo('ifconfig lo0 alias 127.0.0.2 up');
			sudo('ifconfig lo1 alias 127.0.0.3 up');

		} else if (os.platform() === 'linux') {

			sudo('ifconfig lo:0 127.0.0.2 up');
			sudo('ifconfig lo:1 127.0.0.3 up');

		}


		if (
			STATE.network !== null
			&& STATE.network !== this._settings.network
		) {

			let result = disconnect();
			if (result === true) {
				STATE.network = null;
			}

		}


		if (STATE.network === null) {

			let network = this._settings.network || null;
			if (network !== null) {

				let result = connect(network);
				if (result === true) {
					STATE.network = network;
				}

			}

		}

	},

	disconnect: function() {

		console.info('Covert Network: Disconnect local peer network');

		if (os.platform() === 'darwin') {

			sudo('ifconfig lo0 -alias 127.0.0.2');
			sudo('ifconfig lo1 -alias 127.0.0.3');

		} else if (os.platform() === 'linux') {

			sudo('ifconfig lo:0 down');
			sudo('ifconfig lo:1 down');

		}


		if (STATE.network !== null) {

			let network = this._settings.network || null;
			if (network !== null) {

				let result = disconnect(network);
				if (result === true) {
					STATE.network = null;
				}

			}

		}

	}

};


export { Network };

