
const { app, BrowserWindow } = require('electron');
const child_process          = require('child_process');
const process                = require('process');



const PATH    = Array.from(process.argv).shift();
const STEALTH = child_process.fork('./stealth/stealth.mjs', [
	'serve'
], {
	cwd: ROOT
});

app.whenReady().then(() => {

	setTimeout(() => {

		const BROWSER = new BrowserWindow({
			width:  800,
			height: 600
		});

		BROWSER.loadURL('http://localhost:65432/browser/index.html');
		BROWSER.removeMenu();

	}, 1000);

});

app.on('window-all-closed', () => {

	STEALTH.kill('SIGTERM');

	app.quit();

});

