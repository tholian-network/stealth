
import { init as init_internet } from './internet.mjs';
import { init as init_hosts    } from './hosts.mjs';

const global = (typeof window !== 'undefined' ? window : this);



setTimeout(() => {

	let browser = global.parent.BROWSER || global.BROWSER || null;
	if (browser !== null) {
		init_internet(browser);
		init_hosts(browser);
	}

}, 500);

