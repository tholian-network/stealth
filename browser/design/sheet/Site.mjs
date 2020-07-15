
import { Element } from '../Element.mjs';
import { Widget  } from '../Widget.mjs';



const update = function(/* tab, tabs */) {
	// TODO: Update according to tab meta info
};


const Site = function(browser) {

	this.element = new Element('browser-sheet-site', [
		'<article>',
		'\t<h3>Site Modes</h3>',
		'</article>',
		'<article>',
		'\t<h3>Site Beacons</h3>',
		'</article>',
		'<article>',
		'\t<h3>Site Echoes</h3>',
		'</article>'
	].join(''));


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


	browser.on('show',    (tab) => update.call(this, tab));
	browser.on('refresh', (tab) => update.call(this, tab));


	Widget.call(this);

};


Site.prototype = Object.assign({}, Widget.prototype);


export { Site };

