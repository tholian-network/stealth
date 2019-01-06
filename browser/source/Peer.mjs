
const Peer = function(data) {

	let settings = Object.assign({}, data);


};


Peer.prototype = {

	load: function(url, callback) {

	},

	meta: function(url, callback) {
		// TODO: Does this make sense to get HTML meta
		// data? Should it be generic? or html specific?
	}

};


export { Peer };

