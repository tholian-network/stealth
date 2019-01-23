
const browser = window.browser || parent.browser || null;
const doc     = window.document;
const hosts   = {
	list: doc.querySelector('#hosts-list'),
	menu: doc.querySelector('#hosts-list-menu')
};



const SETTINGS = {

	init: function(browser) {

		browser.settings.read


		console.log('WHAAT', browser);
	}

};


export { SETTINGS };


if (browser !== null) {
	SETTINGS.init(browser);
} else {
	console.error('No Browser accessible :(');
}

