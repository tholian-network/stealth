
import { console } from '../../extern/base.mjs';
import { Element } from '../Element.mjs';
import { Widget  } from '../Widget.mjs';



const Session = function(browser) {

	this.element = new Element('browser-sheet-session', [
		'<article>',
		'\t<h3>Sessions</h3>',
		'</article>',
		'<article>',
		'\t<h3>Tabs</h3>',
		'</article>',
	]);

	this.session  = null;
	this.sessions = [];


	this.element.on('contextmenu', (e) => {
		e.preventDefault();
		e.stopPropagation();
	});

	this.element.on('show', () => {

		browser.client.services.session.read({}, (session) => {

			browser.client.services.session.query({
				domain: '*'
			}, (sessions) => {

				// Make sure reference is to same Array
				session = sessions.find((s) => s.domain === session.domain) || null;

				this.session  = session.domain;
				this.sessions = sessions;

				console.info(session);
				console.warn(sessions);

			});


		});

		this.element.state('active');

	});

	this.element.on('hide', () => {
		this.element.state('');
	});


	Widget.call(this);

};


Session.prototype = Object.assign({}, Widget.prototype);


export { Session };

