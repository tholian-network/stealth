
import { console, Buffer, isBuffer, isObject, isString } from '../../extern/base.mjs';
import { ENVIRONMENT                                   } from '../../source/ENVIRONMENT.mjs';
import { isStealth, VERSION                            } from '../../source/Stealth.mjs';
import { MDNS                                          } from '../../source/connection/MDNS.mjs';
import { DNS as PACKET                                 } from '../../source/packet/DNS.mjs';
import { isServices                                    } from '../../source/server/Services.mjs';
import { URL                                           } from '../../source/parser/URL.mjs';



const RESERVED_TLDS = [
	'domain',
	'example',
	'invalid',
	'local',
	'localhost',
	'test'
];

const HIGHRISK_TLDS = [
	'belkin',
	'corp',
	'home',
	'lan',
	'localdomain',
	'mail',
	'wpad'
];



const isResolvable = function(packet) {

	if (packet.headers['@type'] === 'request') {

		if (packet.payload.questions.length > 0 && packet.payload.answers.length === 0) {

			let check1 = packet.payload.questions.filter((q) => (q.type === 'A' || q.type === 'AAAA'));
			if (check1.length === packet.payload.questions.length) {

				let check2 = packet.payload.questions.filter((q) => {

					let url    = URL.parse(q.domain);
					let domain = URL.toDomain(url);
					if (domain !== null) {

						let valid  = true;

						RESERVED_TLDS.forEach((tld) => {

							if (domain === tld || domain.endsWith('.' + tld)) {
								valid = false;
							}

						});

						HIGHRISK_TLDS.forEach((tld) => {

							if (domain === tld || domain.endsWith('.' + tld)) {
								valid = false;
							}

						});

						return valid;

					}


					return false;

				});

				if (check1.length === check2.length) {
					return true;
				}

			}

		}

	}


	return false;

};



const Router = function(services, stealth) {
};


Router.prototype = {
};


export { Router };

