
import { Emitter } from '../Emitter.mjs';



const Host = function(browser, client) {

	Emitter.call(this);


	this.browser = browser;
	this.client  = client || browser.client || null;

};


Host.prototype = Object.assign({}, Emitter.prototype, {

	read: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			let client = this.client || null;
			if (client !== null) {

				this.once('read', data => {
					callback(data);
				});

				client.send({
					headers: {
						service: 'host',
						method:  'read'
					},
					payload: ref
				});

			}

		} else if (callback !== null) {
			callback(null);
		}

	}

});


export { Host };

