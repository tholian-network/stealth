
import process from 'process';

import { console     } from '../base/index.mjs';
import { Stealth     } from './source/Stealth.mjs';
import { ENVIRONMENT } from './source/ENVIRONMENT.mjs';



console.clear();

console.log('');
console.info('Stealth');
console.log('');

let stealth = new Stealth({
	debug:   ENVIRONMENT.flags.debug,
	host:    ENVIRONMENT.flags.host,
	profile: ENVIRONMENT.flags.profile
});

stealth.on('disconnect', (result) => {
	process.exit(result === true ? 0 : 1);
});

stealth.connect();

