#!/usr/bin/env node

import process from 'process';

import { console     } from '../base/index.mjs';
import { Stealth     } from './source/Stealth.mjs';
import { ENVIRONMENT } from './source/ENVIRONMENT.mjs';



const show_help = () => {

	console.info('');
	console.info('Stealth');
	console.info('');

	console.log('');
	console.log('Usage: stealth [Action] [--Flag=Value...]');
	console.log('');
	console.log('Usage Notes:');
	console.log('');
	console.log('    Network Port 65432 must be available.');
	console.log('');
	console.log('Available Actions:');
	console.log('');
	console.log('    Action     | Description                                                     ');
	console.log('    -----------|-----------------------------------------------------------------');
	console.log('    serve      | Serves the stealth service, proxy service and websocket service.');
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
	console.log('    stealth serve --debug=true --host=myhostname;');
	console.log('    stealth serve --profile=/tmp/stealth-profile;');
	console.log('');

};



if (ENVIRONMENT.action === 'serve') {

	let stealth = new Stealth({
		debug:   ENVIRONMENT.flags.debug   || false,
		host:    ENVIRONMENT.flags.host    || null,
		profile: ENVIRONMENT.flags.profile || null
	});

	stealth.on('disconnect', (result) => {
		process.exit(result === true ? 0 : 1);
	});

	stealth.connect();


} else {

	show_help();
	process.exit(1);

}

