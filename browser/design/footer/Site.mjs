
import { Element } from '../Element.mjs';



const TEMPLATE = `
<article>
	<h3>Site Modes</h3>
</article>
`;


const Site = function(browser, widgets) {

	this.element = Element.from('browser-site', TEMPLATE);


	this.element.on('contextmenu', (e) => {
		e.preventDefault();
		e.stopPropagation();
	});

	this.element.on('show', () => {
		this.element.state('active');
	});

	this.element.on('hide', () => {

		let settings = widgets.settings || null;
		if (settings !== null && settings.site !== null) {
			settings.site.state('');
		}

		this.element.state('');

	});

};


Site.prototype = {

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


export { Site };

