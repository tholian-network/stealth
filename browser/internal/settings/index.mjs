
import { access                 } from '../index.mjs';
import { init as init_interface } from './interface.mjs';
import { init as init_internet  } from './internet.mjs';
import { init as init_hosts     } from './hosts.mjs';
import { init as init_peers     } from './peers.mjs';
import { init as init_sites     } from './sites.mjs';



let browser = access('browser');
if (browser !== null) {

	init_interface(browser);
	init_internet(browser);
	init_hosts(browser);
	init_peers(browser);
	init_sites(browser);

}

