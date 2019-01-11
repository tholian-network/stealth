
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
	this.webview = null;

	this.onload = null;

	this.history = [
		this.url,
		'https://old.reddit.com/what/ever',
		'https://old.reddit.com/what/ever',
		'https://old.reddit.com/what/ever',
		'https://old.reddit.com/what/ever',
		'https://old.reddit.com/what/ever'
	];

};


Sandbox.prototype = {

	back: function() {

		let url = this.url;
		if (url !== null) {

			let index = this.history.indexOf(url);
			if (index > 0) {

				this.url = this.history[index - 1];
				this.load();

				return true;

			}

		}


		return false;

	},

	kill: function() {
		// TODO: Cleanup for GC and stuff
	},

	load: function(force) {

		// TODO: this.document = document.createElement('iframe');
		// this.document.setAttribute('src', '/render/?url=url&mode=mode');

		// TODO: Somehow communicate via WebSocket
		// and when file is loaded and response is
		// here, then load the other files in the
		// document. Dunno yet, I guess !?

	},

	next: function() {

		let url = this.url;
		if (url !== null) {

			let index = this.history.indexOf(url);
			if (index < this.history.length - 1) {

				this.url = this.history[index + 1];
				this.load();

				return true;

			}

		}


		return false;

	}

};


export { Sandbox };

