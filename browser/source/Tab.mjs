
import { URL } from './parser/URL.mjs';


let _id = 0;

const Tab = function(data) {

	let settings = Object.assign({}, data);


	this.id       = '' + _id++;
	this.history  = [];
	this.config   = settings.config || {
		domain: null,
		mode: {
			text:  false,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};
	this.ref      = null;
	this.requests = [];
	this.url      = null;


	let ref = settings.ref || null;
	let url = settings.url || null;

	if (ref !== null) {

		this.ref = ref;
		this.url = this.ref.url;
		this.history.push(this.ref.url);

	} else if (url !== null) {

		this.ref = URL.parse(url);
		this.url = this.ref.url;
		this.history.push(this.ref.url);

	}

};


Tab.prototype = {

	kill: function() {
		// TODO: Cleanup for GC and stuff
	}

};


export { Tab };

