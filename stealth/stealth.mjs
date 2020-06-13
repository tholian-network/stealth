
import process from 'process';

import { Stealth     } from './source/Stealth.mjs';
import { ENVIRONMENT } from './source/ENVIRONMENT.mjs';



let stealth = new Stealth({
	debug:   ENVIRONMENT.flags.debug,
	host:    ENVIRONMENT.flags.host,
	profile: ENVIRONMENT.flags.profile
});

stealth.on('disconnect', (result) => {
	process.exit(result === true ? 0 : 1);
});

stealth.connect();

