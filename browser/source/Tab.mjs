
let _id = 0;

const Tab = function(data) {

	let settings = Object.assign({}, data);


	this.id       = 'sandbox-' + _id++;
	this.history  = [];
	this.url      = settings.url  || null;
	this.mode     = settings.mode || null;
	this.requests = [{
		url:     'https://wat/is/this.jpg',
		loading: true
	}];

	let url = this.url;
	if (url !== null) {
		this.history.push(url);
	}

};


Tab.prototype = {

	kill: function() {
		// TODO: Cleanup for GC and stuff
	}

};


export { Tab };

