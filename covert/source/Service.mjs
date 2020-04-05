
import { Emitter } from '../../stealth/source/Emitter.mjs';



export const Service = function() {

	Emitter.call(this);

	this.on('event', (payload) => {

		return {
			headers: {
				service: 'mockup',
				event:   'event'
			},
			payload: payload
		};

	});

};


Service.prototype = Object.assign({}, Emitter.prototype, {

	'method': function(payload, callback) {

		callback({
			headers: {
				service: 'mockup',
				method:  'method'
			},
			payload: payload
		});

	}

});

