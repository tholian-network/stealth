
import { Element } from '../Element.mjs';



const TEMPLATE = (session) => `
<article>
	<h3>Session #${session.id}</h3>
	<h3>History</h3>
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

		let service = browser.client.services.session || null;
		if (service !== null) {

			service.read({}, (session) => {
				console.log('session', session);
			});

		}

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

