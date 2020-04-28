
import { describe, finish } from '../../../covert/index.mjs';
import { URL              } from '../../../stealth/source/parser/URL.mjs';
import { Blocker          } from '../../../stealth/source/request/Blocker.mjs';



describe('Blocker.check()', function(assert) {

	let blockers = [{
		domain: 'tracker.example.com'
	}, {
		domain: '1.3.3.7'
	}];

	let ref1 = URL.parse('https://example.com/index.html');
	let ref2 = URL.parse('https://tracker.example.com/index.html');
	let ref3 = URL.parse('https://malicious.tracker.example.com/index.html');
	let ref4 = URL.parse('http://1.0.0.1/api/');
	let ref5 = URL.parse('ftp://1.3.3.7/some-evil-download.exe');

	Blocker.check(blockers, null, (result) => {
		assert(result, true);
	});

	Blocker.check(blockers, ref1, (result) => {
		assert(result, false);
	});

	Blocker.check(blockers, ref2, (result) => {
		assert(result, true);
	});

	Blocker.check(blockers, ref3, (result) => {
		assert(result, true);
	});

	Blocker.check(blockers, ref4, (result) => {
		assert(result, false);
	});

	Blocker.check(blockers, ref5, (result) => {
		assert(result, true);
	});

});


export default finish('stealth/request/Blocker');

