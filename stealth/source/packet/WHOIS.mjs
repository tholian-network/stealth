
import { console, Buffer, isArray, isBoolean, isBuffer, isNumber, isObject, isString } from '../../extern/base.mjs';
import { DATETIME                                                           } from '../../source/parser/DATETIME.mjs';
import { IP                                                                 } from '../../source/parser/IP.mjs';
import { NET                                                                } from '../../source/parser/NET.mjs';


const SCHEMA = {
	'ARIN': {
		'NetRange': {
			'%type':         'network',
			'Organization':  { name: 'organization', type: 'String' },
			'NetRange':      { name: 'network',      type: 'NET'    },
			'Updated':       { name: 'date',         type: 'DATE'   },
			'registry':      'ARIN'
		},
		'OrgName': {
			'%type':         'organization',
			'OrgId':         { name: 'id',      type: 'String' },
			'Address':       { name: 'address', type: 'String' },
			'City':          { name: 'address', type: 'String' },
			'StateProv':     { name: 'address', type: 'String' },
			'PostalCode':    { name: 'address', type: 'String' },
			'Country':       { name: 'country', type: 'String' },
			'Updated':       { name: 'date',    type: 'DATE'   },
			'registry':      'ARIN'
		}
	},
	'LACNIC': {
		'inetnum': {
			'%type':    'network',
			'ownerid':  { name: 'organization', type: 'String' },
			'inetnum':  { name: 'network',      type: 'NET'    },
			'changed':  { name: 'date',         type: 'DATE'   },
			'registry': 'LACNIC',

			// XXX: LACNIC has no separate organization database entry
			'owner':   { name: '%name',    type: 'String' },
			'address': { name: '%address', type: 'String' },
			'country': { name: '%country', type: 'String' }
		}
	},
	'RIPE': {
		'inetnum': {
			'%type':         'network',
			'org':           { name: 'organization', type: 'String' },
			'inetnum':       { name: 'network',      type: 'NET'    },
			'last-modified': { name: 'date',         type: 'DATE'   },
			'source':        { name: 'registry',     type: 'String' }
		},
		'organisation': {
			'%type':         'organization',
			'organisation':  { name: 'id',       type: 'String' },
			'org-name':      { name: 'name',     type: 'String' },
			'address':       { name: 'address',  type: 'String' },
			'country':       { name: 'country',  type: 'String' },
			'last-modified': { name: 'date',     type: 'DATE'   },
			'source':        { name: 'registry', type: 'String' }
		},
		'route': {
			'%type':         'route',
			'route':         { name: 'network',  type: 'NET'    },
			'origin':        { name: 'origin',   type: 'String' },
			'last-modified': { name: 'date',     type: 'DATE'   },
			'source':        { name: 'registry', type: 'String' }
		}
	}
};


const toFormat = function(buffer) {

	let format = null;
	let str    = buffer.toString('utf8');

	if (str.includes('# ARIN WHOIS data and services are subject to the Terms of Use') === true) {

		format = 'ARIN';

	} else if (
		str.includes('% This is the AfriNIC Whois server.') === true
		|| str.includes('% [whois.apnic.net]') === true
		|| str.includes('% This is the RIPE Database query service.') === true
		|| str.includes('% This query was served by the') === true
	) {

		format = 'RIPE';

	} else if (
		str.includes('% whois.lacnic.net accepts only direct match queries') === true
		|| str.includes('changed:') === true
	) {

		format = 'LACNIC';

	}

	return format;

};



const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};

const isDomain = function(domain) {

	if (isString(domain) === true) {

		let tmp   = domain.split('.');
		let check = domain.split('.').filter((label) => {
			return label.length > 0 && label.length < 64;
		});

		return check.length === tmp.length;

	}


	return false;

};



const WHOIS = {

	decode: function(connection, buffer) {

		connection = isConnection(connection) ? connection : null;
		buffer     = isBuffer(buffer)         ? buffer     : null;


		if (buffer !== null) {

			if (buffer.length < 3) {
				return null;
			}


			let packet = {
				headers: {
					'@type': null
				},
				overflow: null,
				payload: null
			};


			let message = null;

			if (buffer.toString('utf8').includes('\n\n') === true) {
				message = buffer;
			}

			// TODO: Parse Request (domain or IP)

			let format = toFormat(buffer);
			if (format !== null && message !== null) {

				packet.headers['@type'] = 'response';

				let lines = message.toString('utf8').trim().split('\n').map((line) => line.trim()).filter((line) => {
					return (
						line.startsWith('%') === false
						&& line.startsWith('#') === false
					);
				});

				if (lines.length > 0) {

					let database = [];
					let object   = null;
					let schema   = null;

					lines.forEach((line) => {

						if (line.includes('#') === true) {
							line = line.split('#').shift();
						}

						if (line.includes(':') === true) {

							let key = line.split(':').shift().trim();
							let val = line.split(':').slice(1).join(':').trim();

							let tpl = SCHEMA[format][key] || null;
							if (tpl !== null) {

								object = {};
								schema = tpl;

								Object.keys(tpl).forEach((key) => {

									if (isString(tpl[key]) === true) {

										object[key] = tpl[key];

									} else if (isObject(tpl[key]) === true) {

										let name = tpl[key]['name'];
										let type = tpl[key]['type'];

										if (type === 'Array') {
											object[name] = [];
										} else {
											object[name] = null;
										}

									}

								});

								if (database.includes(object) === false) {
									database.push(object);
								}

							}

							if (object !== null && schema !== null) {

								if (isObject(schema[key]) === true) {

									let name = schema[key]['name'];
									let type = schema[key]['type'];

									if (type === 'Array') {

										if (object[name].includes(val) === false) {
											object[name].push(val);
										}

									} else if (type === 'String') {

										if (object[name] === null) {
											object[name] = val;
										} else if (isString(object[name]) === true) {
											object[name] += '\n' + val;
										}

									} else if (type === 'DATE') {

										let date = DATETIME.toDate(DATETIME.parse(val));
										if (date !== null) {
											object[name] = date;
										}

									} else if (type === 'DATETIME') {

										let datetime = DATETIME.parse(val);
										if (DATETIME.isDATETIME(datetime) === true) {
											object[name] = datetime;
										}

									} else if (type === 'NET') {

										object[name] = 'NET.parse("' + val + '")';
										// let net = NET.parse(val);
										// if (NET.isNET(net) === true) {
										// 	object[name] = net;
										// }

									}

								} else {

									// console.warn(key, val);

								}

							}

						} else if (line.trim() === '') {

							object = null;
							schema = null;

						}

					});

					if (database.length > 0) {

						let network      = database.find((entry) => entry['%type'] === 'network')      || null;
						let organization = database.find((entry) => entry['%type'] === 'organization') || null;
						let routes       = database.filter((entry) => entry['%type'] === 'route')      || null;

						if (format === 'ARIN') {

							if (network !== null) {
								network['organization'] = organization.id;
							}

						} else if (format === 'LACNIC') {

							if (network !== null) {

								organization = {
									id:       network['organization'],
									name:     network['%name'],
									address:  network['%address'],
									country:  network['%country'],
									date:     network['date'],
									registry: network['registry']
								};

							}

						}

						if (network !== null) {

							if (network['date'] === null) {
								network['date'] = DATETIME.toDate(DATETIME.parse(new Date()));
							}

							Object.keys(network).forEach((key) => {
								if (key.charAt(0) === '%') {
									delete network[key];
								}
							});

						}

						if (organization !== null) {

							if (organization['date'] === null) {
								organization['date'] = DATETIME.toDate(DATETIME.parse(new Date()));
							}

							Object.keys(organization).forEach((key) => {
								if (key.charAt(0) === '%') {
									delete organization[key];
								}
							});

						}

						if (routes.length > 0) {
							routes.forEach((route) => {

								if (route['date'] === null) {
									route['date'] = organization['date'];
								}

								Object.keys(route).forEach((key) => {
									if (key.charAt(0) === '%') {
										delete route[key];
									}
								});

							});
						}


						if (network !== null) {

							packet.payload = {
								network:      network,
								organization: organization,
								routes:       routes
							};

							return packet;

						}

					}

				}

			}

		}


		return null;

	},

	encode: function(connection, packet) {

		connection = isConnection(connection) ? connection : null;
		packet     = isObject(packet)         ? packet     : null;


		let type = 'server';

		if (connection !== null) {
			type = connection.type;
		}

		if (packet !== null) {

			let headers = {};
			let message = Buffer.alloc(0);

			if (type === 'client') {

				if (isObject(packet.headers) === true) {

					if (
						packet.headers['@type'] === 'request'
						|| packet.headers['@type'] === 'response'
					) {
						headers['@type'] = packet.headers['@type'];
					} else {
						headers['@type'] = 'request';
					}

				}

				if (isDomain(packet.payload) === true) {
					message = Buffer.from(packet.payload, 'utf8');
				} else if (IP.isIP(packet.payload) === true) {
					message = Buffer.from(packet.payload.ip, 'utf8');
				}

			} else if (type === 'server') {

				if (isObject(packet.headers) === true) {

					if (
						packet.headers['@type'] === 'request'
						|| packet.headers['@type'] === 'response'
					) {
						headers['@type'] = packet.headers['@type'];
					} else {
						headers['@type'] = 'response';
					}

				}

				if (isObject(packet.payload) === true) {

					packet.payload = {
						network: {
							id:       'SBI-GENERAL-APNIC-IN',
							subnet:   NET.parse('202.59.244.0 - 202.59.244.255'),
							datetime: DATETIME.parse('2020-08-04T13:07:28Z')
						},
						organization: {
							id:      'ORG-SG4-AP',
							name:    'SBI General',
							address: '3rd and 4th Floor, Lotus IT park, Plot No 18-19, Road No 16, Wagle Industrial Estate, Thane 400604',
							country: 'IN'
						}
					};

					// TODO: Render packet.payload into field: value structure
					// TODO: Use RIPE format by default

				}

			}


			if (headers['@type'] === 'request') {
				return Buffer.concat([ message ]);
			} else if (headers['@type'] === 'response') {
				return Buffer.concat([ message ]);
			}

		}


		return null;

	},

	isPacket: function(buffer) {

		buffer = isBuffer(buffer) ? buffer : null;


		if (buffer !== null) {

			// TODO: Validate Request
			// TODO: Validate Response

		}


		return false;

	}

};


export { WHOIS };

