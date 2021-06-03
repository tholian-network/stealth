
import { describe, finish } from '../../covert/index.mjs';
import { Download         } from '../../stealth/source/Download.mjs';
import { URL              } from '../../stealth/source/parser/URL.mjs';



describe('new Download()', function(assert) {

	let url      = URL.parse('http://example.com/index.html');
	let download = new Download(url);

	download.once('response', (response) => {

		console.log(response);
		assert(true);

	});

	assert(download.start(), true);

});


export default finish('stealth/Download', {
	internet: true,
	network:  false,
	ports:    [ 80, 443, 1080 ]
});

