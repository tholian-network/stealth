
const { app, BrowserWindow } = require('electron');
const child_process          = require('child_process');
const process                = require('process');



const FLAGS = (() => {

	let flags = {
		debug:   false,
		host:    null,
		profile: null
	};

	Array.from(process.argv).filter((v) => v.startsWith('--') === true).forEach((flag) => {

		let tmp = flag.substr(2).split('=');
		if (tmp.length === 2) {

			let key = tmp[0];
			let val = tmp[1];

			let num = parseInt(val, 10);
			if (Number.isNaN(num) === false && (num).toString() === val) {
				val = num;
			}

			if (val === 'true')  val = true;
			if (val === 'false') val = false;
			if (val === 'null')  val = null;

			flags[key] = val;

		}

	});

	return flags;

})();

const PATH    = Array.from(process.argv).shift();
const STEALTH = child_process.fork('./stealth/stealth.mjs', [
	'serve'
], {
	cwd: ROOT
});

app.setPath('appData',  '/tmp/tholian-stealth');
app.setPath('userData', '/tmp/tholian-stealth/userdata');

app.whenReady().then(() => {

	setTimeout(() => {

		let BROWSER = new BrowserWindow({
			width:  800,
			height: 600
		});

		BROWSER.loadURL('http://localhost:65432/browser/index.html');
		BROWSER.removeMenu();
		BROWSER.setMenuBarVisibility(false);

		BROWSER.on('closed', () => {
			BROWSER = null;
		});

	}, 1000);

});

app.on('window-all-closed', () => {

	STEALTH.kill('SIGTERM');

	app.quit();

});

