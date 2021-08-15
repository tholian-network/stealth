
import { console, isBuffer } from '../../extern/base.mjs';
import { isStealth         } from '../../source/Stealth.mjs';
import { MDNS              } from '../../source/connection/MDNS.mjs';
import { DNS as PACKET     } from '../../source/packet/DNS.mjs';
import { isServices        } from '../../source/server/Services.mjs';


export const isRouter = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Proxy]';
};



const Router = function(services, stealth) {

	services = isServices(services) ? services : null;
	stealth  = isStealth(stealth)   ? stealth  : null;


	this.services = services;
	this.stealth  = stealth;

};


Router.prototype = {

	can: function(buffer) {

		buffer = isBuffer(buffer) ? buffer : null;


		if (buffer !== null) {

			if (PACKET.isPacket(buffer) === true) {

				let packet = PACKET.decode(null, buffer);
				if (packet !== null) {
					return true;
				}

			}

		}


		return false;

	},

	upgrade: function(buffer, socket, rinfo) {

		buffer = isBuffer(buffer) ? buffer : null;
		socket = isSocket(socket) ? socket : null;

		let packet = PACKET.decode(null, buffer);
		if (packet !== null) {

			// TODO: Send response to remote address (in rinfo)

		} else {

			// Do Nothing

		}


		return null;

	}

};


export { Router };

