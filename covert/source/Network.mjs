
import { execSync } from 'child_process';
import os           from 'os';
import process      from 'process';

import { console, isString } from '../extern/base.mjs';
import { IP                } from '../../stealth/source/parser/IP.mjs';



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

		console.info('Network connect(' + network + ')');

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

	console.info('Network disconnect()');

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

const HOME = (() => {

	if (process.env.SUDO_USER !== undefined) {

		if (process.env.USER === 'root') {
			return '/home/' + process.env.SUDO_USER;
		} else {
			return '/home/' + process.env.USER;
		}

	} else if (process.env.HOME !== undefined) {

		return process.env.HOME;

	} else if (process.env.USER !== undefined) {

		return '/home/' + process.env.USER;

	} else {

		return execSync('echo ~').trim();

	}

})();

const exec = (cmd, cwd) => {

	cmd = isString(cmd) ? cmd : null;
	cwd = isString(cwd) ? cwd : HOME;


	let error = null;

	try {

		execSync(cmd, {
			cwd: cwd
		});

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

const sudo = (cmd, cwd) => {

	cmd = isString(cmd) ? cmd : null;
	cwd = isString(cwd) ? cwd : HOME;

	if (cmd.startsWith('sudo ') === false) {
		cmd = 'sudo ' + cmd.trim();
	}


	let error = null;

	try {

		execSync(cmd, {
			cwd: cwd
		}).toString('utf8').trim();

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

	connect: function() {

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

