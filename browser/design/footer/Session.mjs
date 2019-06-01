
import { Element } from '../Element.mjs';



const TEMPLATE = `
<article>
	<h3>Requests</h3>
</article>
`;


const Session = function(browser, widgets) {

	this.element = Element.from('browser-session', TEMPLATE);


	this.element.on('contextmenu', (e) => {
		e.preventDefault();
		e.stopPropagation();
	});

	this.element.on('show', () => {
		this.element.state('active');
	});

	this.element.on('hide', () => {
		this.element.state('');
	});

};


Session.prototype = {

	emit: function(event, args) {
		this.element.emit(event, args);
	},

	erase: function(target) {
		this.element.erase(target);
	},

	render: function(target) {
		this.element.render(target);
	}

};


export { Session };

