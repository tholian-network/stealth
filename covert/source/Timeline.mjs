
export const Timeline = function(length) {

	length = typeof length === 'number' ? length : 0;


	this.data   = new Array(length).fill(null);
	this.index  = 0;
	this.length = length;
	this.start  = null;

};


Timeline.from = function(data) {

	let length = 0;

	if (typeof data === 'function') {

		let body = data.toString().split('\n').slice(1, -1);
		if (body.length > 0) {

			body.map((line) => line.trim()).forEach((line) => {

				if (line.startsWith('assert(')) {
					length++;
				}

			});

		}

	} else if (typeof data === 'number') {

		if (Number.isNaN(data) === false) {
			length = (data | 0);
		}

	}


	return new Timeline(length);

};


Timeline.prototype = {

	progress: function() {

		if (this.start !== null) {
			return Date.now() - this.start;
		}


		return 0;

	},

	time: function(reset) {

		reset = typeof reset === 'boolean' ? reset : false;


		if (reset === true) {

			this.index = 0;
			this.start = Date.now();

			for (let d = 0, dl = this.data.length; d < dl; d++) {
				this.data[d] = null;
			}

		} else {

			if (this.index < this.data.length) {
				this.data[this.index] = Date.now();
				this.index++;
			}

		}

	}

};

