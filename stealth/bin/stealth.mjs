
import process from 'process';

import { console } from '../source/BASE.mjs';
import { Stealth } from '../source/Stealth.mjs';
import { flags   } from '../source/ENVIRONMENT.mjs';



console.log('');
console.info('Stealth');
console.log('');


let stealth = new Stealth({
	debug:   flags.debug,
	host:    flags.host,
	profile: flags.profile
});

stealth.on('disconnect', (result) => {
	process.exit(result === true ? 0 : 1);
});

stealth.connect();

