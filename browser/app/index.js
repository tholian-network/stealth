
const { app, BrowserWindow } = require('electron');
const child_process          = require('child_process');
const path                   = require('path');
const process                = require('process');
const console                = require('./console.js');



const FLAGS = (() => {

	let flags = {
		'debug':         false,
		'help':          null,
		'host':          null,
		'profile':       null,
		'app':           'http://localhost:65432/browser/index.html',
		'user-data-dir': '/tmp/tholian-stealth'
	};

	Array.from(process.argv).filter((v) => v.startsWith('--') === true).forEach((flag) => {

		let tmp = flag.substr(2).split('=');
		if (tmp.length === 1) {

			if (tmp[0] === 'help') {
				flags.help = true;
			}

		} else if (tmp.length === 2) {

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

	Array.from(process.argv).filter((v) => v.startsWith('-') === true && v.startsWith('--') === false).forEach((flag) => {

		if (flag === '-h' || flag === '-help') {
			flags.help = true;
		}

	});

	return flags;

})();



if (FLAGS.help === true) {

	console.info('');
	console.info('Tholian Stealth (electron build)');
	console.info('');

	console.log('');
	console.log('Usage: tholian-stealth [--Flag=Value...]');
	console.log('');
	console.log('Usage Notes:');
	console.log('');
	console.log('    The following Network Ports must be available:');
	console.log('');
	console.log('    - 5353  (Multicast/UDP)');
	console.log('    - 65432 (Multicast/UDP and Unicast/TCP)');
	console.log('');
	console.log('Available Flags:');
	console.log('');
	console.log('    Flag       | Default | Values          | Description                                                    ');
	console.log('    -----------|---------|-----------------|----------------------------------------------------------------');
	console.log('    --debug    | false   | true, false     | Enable/Disable stealth:debug page. Defaulted with false. [1]   ');
	console.log('    --host     | null    | "(Host Name)"   | Overrides the Server Host to listen on. Defaulted with null.   ');
	console.log('    --profile  | null    | "(Folder Path)" | Overrides the Stealth Profile folder path. Defaulted with null.');
	console.log('');
	console.log('    [1] Additionally ensures that Browser Settings for the domain "tholian.network" are correct.');
	console.log('');
	console.log('Examples:');
	console.log('');
	console.log('    tholian-stealth --debug=true --host=myhostname;');
	console.log('    tholian-stealth --profile=/tmp/stealth-profile;');
	console.log('');

	process.exit(1);

} else {

	const ARGS = [ 'serve' ];

	if (FLAGS.debug === true) {
		ARGS.push('--debug=true');
	}

	if (FLAGS.host !== null) {
		ARGS.push('--host=' + FLAGS.host);
	}

	if (FLAGS.profile !== null) {
		ARGS.push('--profile=' + FLAGS.profile);
	}

	console.log(FLAGS);


	const ROOT    = path.resolve(__dirname, '../../');
	const STEALTH = child_process.fork(ROOT + '/stealth/stealth.mjs', ARGS, { cwd: ROOT });

	app.setPath('appData',  FLAGS['user-data-dir']);
	app.setPath('userData', FLAGS['user-data-dir'] + '/userdata');

	app.whenReady().then(() => {

		setTimeout(() => {

			let BROWSER = new BrowserWindow({
				width:  800,
				height: 600,
				webPreferences: {
					plugins:    false,
					spellcheck: false
				}
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

		process.exit(0);

	});

}

