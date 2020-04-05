
export const WebSocket = (function(global) {

	if (typeof global.WebSocket !== 'function') {

		const WebSocket = function(url, protocols) {

			this.__on = {
				close:   null,
				error:   null,
				message: null,
				open:    null,
				timeout: null
			};


			// setTimeout(() => {
			//  TODO: connect to url
			// }, 0);

		};

		[ 'close', 'error', 'message', 'open', 'timeout' ].forEach((property) => {

			Object.defineProperty(WebSocket.prototype, property, {

				get: function() {
					return this.__on[property] || null;
				},

				set: function(callback) {

					if (isFunction(callback)) {

						this.__on[property] = callback;

						return true;

					}


					return false;

				}

			});

		});

		WebSocket.prototype = {

			close: function() {

			},

			send: function(data) {

			}

		};

		global.WebSocket = WebSocket;

	}


	return global.WebSocket;

})(typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this));

