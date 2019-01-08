
const Sandbox = function(data) {

	let settings = Object.assign({}, data);


	this.url  = settings.url  || null;
	this.mode = settings.mode || null;
	this.peer = settings.peer || null;

	this.document = null;
	this.requests = [];

	this.onload = null;

};


Sandbox.prototype = {

	load: function() {

		// TODO: this.document = document.createElement('iframe');
		// this.document.setAttribute('src', '/render/?url=url&mode=mode');

		// TODO: Somehow communicate via WebSocket
		// and when file is loaded and response is
		// here, then load the other files in the
		// document. Dunno yet, I guess !?

	},

	kill: function() {
		// TODO: Cleanup for GC and stuff
	}

};


export { Sandbox };

