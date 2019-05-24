
import { Element } from '../Element.mjs';



const TEMPLATE = `
<article>
	<h3>Beacons</h3>
	<p>
		Beacons allow Stealth to understand Sites and their Content.
		<br><br>
		This feature will arrive soon with the X1/X2 Release.
	</p>
</article>
`;


const Beacon = function(browser, widgets) {

	this.element = Element.from('browser-beacon', TEMPLATE);


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


Beacon.prototype = {

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


export { Beacon };

