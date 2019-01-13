
const Sandbox = function(data) {

	let settings = Object.assign({}, data);


	this.history = [];

	this.url  = settings.url  || null;
	this.mode = settings.mode || null;
	this.peer = settings.peer || null;

	this.document = null;
	this.requests = [{
		url:     'https://wat/is/this.jpg',
		loading: true
	}];
	this.history = [];
	this.onload  = null;
	this.webview = null;

	let url = this.url;
	if (url !== null) {
		this.history.push(url);
	}

};


Sandbox.prototype = {

	kill: function() {
		// TODO: Cleanup for GC and stuff
	},

	load: function(force) {

		force = force === true;


		// let url = _get_url(this);
		// if (url !== '') {

		// 	if (url !== this.url) {
		// 		this.url = url;
		// 		this.history.push(url);
		// 		_WEBVIEW.src = url;
		// 		console.log('what', _WEBVIEW.src);
		// 	}

		// }


		// TODO: this.document = document.createElement('iframe');
		// this.document.setAttribute('src', '/render/?url=url&mode=mode');

		// TODO: Somehow communicate via WebSocket
		// and when file is loaded and response is
		// here, then load the other files in the
		// document. Dunno yet, I guess !?

	}

};


export { Sandbox };

