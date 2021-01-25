
import { after, before, describe, finish, EXAMPLE } from '../../../covert/index.mjs';
import { Request                                  } from '../../../stealth/source/Request.mjs';
import { DATETIME                                 } from '../../../stealth/source/parser/DATETIME.mjs';
import { connect, disconnect                      } from '../Server.mjs';


before(connect);

describe('new Request()/github/http', function(assert, console) {

	let mode    = EXAMPLE.toMode('http://github.com/');
	let url     = EXAMPLE.toURL('http://github.com/');
	let request = new Request({
		mode: mode,
		url:  url
	}, this.server);

	let events = {
		response: false,
		error:    false
	};

	request.once('error', () => {
		events.error = true;
	});

	request.once('response', () => {
		events.response = true;
	});

	request.once('redirect', (redirect) => {

		assert(events.error,    false);
		assert(events.response, false);

		assert(redirect, {
			headers: {
				'@status':        '301 Moved Permanently',
				'content-length': '0',
				'location':       'https://github.com/'
			}
		});

	});

	assert(request.start(), true);


	// TODO: Expect redirect to https://github.com
	// TODO: Expect redirect event
	// TODO: Expect NO response event
	// TODO: Expect cache to be NOT written at cache/<DATETIME>/github.com/index.html
	// TODO: Expect stealth.settings.redirects to contain new redirect

});

after(disconnect);


export default finish('stealth/request/Redirect', {
	internet: true,
	network:  true
});

