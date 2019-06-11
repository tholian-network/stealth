
import { init as init_internet } from './internet.mjs';
import { init as init_hosts    } from './hosts.mjs';
import { init as init_peers    } from './peers.mjs';

const global = (typeof window !== 'undefined' ? window : this);



setTimeout(() => {

	let browser = global.parent.BROWSER || global.BROWSER || null;
	if (browser !== null) {
		init_internet(browser);
		init_hosts(browser);
		init_peers(browser);
	}

}, 500);

