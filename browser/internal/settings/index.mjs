
import { access                } from '../index.mjs';
import { init as init_internet } from './internet.mjs';
import { init as init_hosts    } from './hosts.mjs';
import { init as init_peers    } from './peers.mjs';
import { init as init_sites    } from './sites.mjs';



let browser = access('browser');
if (browser !== null) {

	init_internet(browser, browser.settings);
	init_hosts(browser, browser.settings);
	init_peers(browser, browser.settings);
	init_sites(browser, browser.settings);

}

