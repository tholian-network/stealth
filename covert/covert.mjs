
import { console    } from './source/console.mjs';
import { initialize } from './source/TESTSUITE.mjs';

import './source/Server.mjs';
import './source/Client.mjs';


initialize((statistics) => {

	console.log(statistics);

});

