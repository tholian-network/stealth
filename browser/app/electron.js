
const { app, BrowserWindow } = require('electron');
const process                = require('process');



const FLAGS = (() => {

	let flags = {
		'user-data-dir': '/tmp/browser-electron'
	};

	Array.from(process.argv).slice(1).forEach((arg) => {

		let tmp1 = arg.trim();
		if (tmp1.startsWith('--')) {

			tmp1 = tmp1.substr(2);

			if (tmp1.includes('=')) {

				let key = tmp1.split('=')[0].trim();
				let val = tmp1.split('=').slice(1).join('=').trim();

				let num = parseInt(val, 10);
				if (!isNaN(num) && (num).toString() === val) {
					val = num;
				}

				if (val === 'true')  val = true;
				if (val === 'false') val = false;
				if (val === 'null')  val = null;

				flags[key] = val;

			}

		}

	});

	return flags;

})();



app.setPath('appData',  FLAGS['user-data-dir']);
app.setPath('userData', FLAGS['user-data-dir'] + '/user');

app.on('ready', () => {

	let window = new BrowserWindow({
		width:  1280,
		height: 960
	});

	window.loadURL('http://localhost:65432/browser/index.html');
	window.setMenuBarVisibility(false);

	window.on('closed', () => {
		window = null;
	});

});

app.on('window-all-closed', () => {
	app.quit();
});

