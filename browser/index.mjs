
import { Browser, isBrowser } from './source/Browser.mjs';
import { Client, isClient   } from './source/Client.mjs';
import { ENVIRONMENT        } from './source/ENVIRONMENT.mjs';
import { Session, isSession } from './source/Session.mjs';
import { Tab, isTab         } from './source/Tab.mjs';



export default {

	isBrowser: isBrowser,
	isClient:  isClient,
	isSession: isSession,
	isTab:     isTab,

	Browser:     Browser,
	Client:      Client,
	ENVIRONMENT: ENVIRONMENT,
	Session:     Session,
	Tab:         Tab

};

