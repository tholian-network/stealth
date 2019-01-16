
const browser = window.browser || parent.browser || null;


const SETTINGS = {

	init: function(browser) {



		console.log('WHAAT', browser);
	}

};



export { SETTINGS };

if (browser !== null) {
	SETTINGS.init(browser);
} else {
	console.error('No Browser accessible :(');
}


