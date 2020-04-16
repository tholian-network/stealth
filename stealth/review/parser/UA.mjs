
import { describe, finish } from '../../../covert/index.mjs';
import { UA               } from '../../../stealth/source/parser/UA.mjs';



describe('UA.isUA', function(assert) {

	let ua1 = UA.parse('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15');
	let ua2 = UA.parse('Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1');
	let ua3 = UA.parse('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0 Safari/537.36');
	let ua4 = UA.parse('Mozilla/5.0 (Linux; Android 7.0; Moto G (4) Build/NPJS25.93-14-18) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0 Mobile Safari/537.36');
	let ua5 = UA.parse('Mozilla/5.0 (Android; Tablet; rv:10.0) Gecko/10.0 Firefox/10.0 Fennec/10.0');
	let ua6 = UA.parse('Mozilla/5.0 (Windows NT 10.0; WOW64; rv:66.0) Gecko/20100101 Firefox/66.0');
	let ua7 = UA.parse('Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)');
	let ua8 = UA.parse('Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53 (compatible; bingbot/3.0; +http://www.bing.com/bingbot.htm)');

	assert(UA.isUA(ua1), true);
	assert(UA.isUA(ua2), true);
	assert(UA.isUA(ua3), true);
	assert(UA.isUA(ua4), true);
	assert(UA.isUA(ua5), true);
	assert(UA.isUA(ua6), true);
	assert(UA.isUA(ua7), true);
	assert(UA.isUA(ua8), true);

});

describe('UA.parse', function(assert) {

	let ua1 = UA.parse('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15');
	let ua2 = UA.parse('Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1');
	let ua3 = UA.parse('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0 Safari/537.36');
	let ua4 = UA.parse('Mozilla/5.0 (Linux; Android 7.0; Moto G (4) Build/NPJS25.93-14-18) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0 Mobile Safari/537.36');
	let ua5 = UA.parse('Mozilla/5.0 (Windows NT 10.0; WOW64; rv:66.0) Gecko/20100101 Firefox/66.0');
	let ua6 = UA.parse('Mozilla/5.0 (Android; Tablet; rv:10.0) Gecko/10.0 Firefox/10.0 Fennec/10.0');
	let ua7 = UA.parse('Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)');
	let ua8 = UA.parse('Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53 (compatible; bingbot/3.0; +http://www.bing.com/bingbot.htm)');

	assert(ua1 !== null);
	assert(ua1.engine,   'safari');
	assert(ua1.platform, 'browser');
	assert(ua1.system,   'desktop');
	assert(ua1.version,  '12.0');

	assert(ua2 !== null);
	assert(ua2.engine,   'safari');
	assert(ua2.platform, 'browser');
	assert(ua2.system,   'mobile');
	assert(ua2.version,  '12.0');

	assert(ua3 !== null);
	assert(ua3.engine,   'chrome');
	assert(ua3.platform, 'browser');
	assert(ua3.system,   'desktop');
	assert(ua3.version,  '70.0');

	assert(ua4 !== null);
	assert(ua4.engine,   'chrome');
	assert(ua4.platform, 'browser');
	assert(ua4.system,   'mobile');
	assert(ua4.version,  '44.0');

	assert(ua5 !== null);
	assert(ua5.engine,   'firefox');
	assert(ua5.platform, 'browser');
	assert(ua5.system,   'desktop');
	assert(ua5.version,  '66.0');

	assert(ua6 !== null);
	assert(ua6.engine,   'firefox');
	assert(ua6.platform, 'browser');
	assert(ua6.system,   'mobile');
	assert(ua6.version,  '10.0');

	assert(ua7 !== null);
	assert(ua7.engine,   'baidu');
	assert(ua7.platform, 'spider');
	assert(ua7.system,   'desktop');
	assert(ua7.version,  '2.0');

	assert(ua8 !== null);
	assert(ua8.engine,   'bing');
	assert(ua8.platform, 'spider');
	assert(ua8.system,   'mobile');
	assert(ua8.version,  '3.0');

});

describe('UA.render', function(assert) {

	let ua1 = UA.render({ engine: 'safari',  platform: 'browser', system: 'desktop', version: '12.0' });
	let ua2 = UA.render({ engine: 'safari',  platform: 'browser', system: 'mobile',  version: '12.0' });
	let ua3 = UA.render({ engine: 'chrome',  platform: 'browser', system: 'desktop', version: '70.0' });
	let ua4 = UA.render({ engine: 'chrome',  platform: 'browser', system: 'mobile',  version: '44.0' });
	let ua5 = UA.render({ engine: 'firefox', platform: 'browser', system: 'desktop', version: '66.0' });
	let ua6 = UA.render({ engine: 'firefox', platform: 'browser', system: 'mobile',  version: '10.0' });
	let ua7 = UA.render({ engine: 'baidu',   platform: 'spider',  system: 'desktop', version:  '2.0' });
	let ua8 = UA.render({ engine: 'bing',    platform: 'spider',  system: 'mobile',  version:  '3.0' });

	let result1 = UA.parse(ua1);
	let result2 = UA.parse(ua2);
	let result3 = UA.parse(ua3);
	let result4 = UA.parse(ua4);
	let result5 = UA.parse(ua5);
	let result6 = UA.parse(ua6);
	let result7 = UA.parse(ua7);
	let result8 = UA.parse(ua8);

	assert(result1 !== null);
	assert(result1.engine,   'safari');
	assert(result1.platform, 'browser');
	assert(result1.system,   'desktop');
	assert(result1.version,  '12.0');

	assert(result2 !== null);
	assert(result2.engine,   'safari');
	assert(result2.platform, 'browser');
	assert(result2.system,   'mobile');
	assert(result2.version,  '12.0');

	assert(result3 !== null);
	assert(result3.engine,   'chrome');
	assert(result3.platform, 'browser');
	assert(result3.system,   'desktop');
	assert(result3.version,  '70.0');

	assert(result4 !== null);
	assert(result4.engine,   'chrome');
	assert(result4.platform, 'browser');
	assert(result4.system,   'mobile');
	assert(result4.version,  '44.0');

	assert(result5 !== null);
	assert(result5.engine,   'firefox');
	assert(result5.platform, 'browser');
	assert(result5.system,   'desktop');
	assert(result5.version,  '66.0');

	assert(result6 !== null);
	assert(result6.engine,   'firefox');
	assert(result6.platform, 'browser');
	assert(result6.system,   'mobile');
	assert(result6.version,  '10.0');

	assert(result7 !== null);
	assert(result7.engine,   'baidu');
	assert(result7.platform, 'spider');
	assert(result7.system,   'desktop');
	assert(result7.version,  '2.0');

	assert(result8 !== null);
	assert(result8.engine,   'bing');
	assert(result8.platform, 'spider');
	assert(result8.system,   'mobile');
	assert(result8.version,  '3.0');

});

describe('UA.sort', function(assert) {

	let sorted = UA.sort([
		UA.parse('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15'),
		UA.parse('Mozilla/5.0 (Windows NT 10.0; WOW64; rv:66.0) Gecko/20100101 Firefox/66.0'),
		UA.parse('Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'),
		UA.parse('Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53 (compatible; bingbot/3.0; +http://www.bing.com/bingbot.htm)'),
		UA.parse('Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)'),
		UA.parse('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0 Safari/537.36'),
		UA.parse('Mozilla/5.0 (Android; Tablet; rv:10.0) Gecko/10.0 Firefox/10.0 Fennec/10.0'),
		UA.parse('Mozilla/5.0 (Linux; Android 7.0; Moto G (4) Build/NPJS25.93-14-18) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0 Mobile Safari/537.36')
	]);

	assert(sorted[0].platform, 'browser');
	assert(sorted[1].platform, 'browser');
	assert(sorted[2].platform, 'browser');
	assert(sorted[3].platform, 'browser');
	assert(sorted[4].platform, 'browser');
	assert(sorted[5].platform, 'browser');
	assert(sorted[6].platform, 'spider');
	assert(sorted[7].platform, 'spider');

	assert(sorted[0].system, 'desktop');
	assert(sorted[1].system, 'desktop');
	assert(sorted[2].system, 'desktop');
	assert(sorted[3].system, 'mobile');
	assert(sorted[4].system, 'mobile');
	assert(sorted[5].system, 'mobile');
	assert(sorted[6].system, 'desktop');
	assert(sorted[7].system, 'mobile');

	assert(sorted[0].engine, 'chrome');
	assert(sorted[1].engine, 'firefox');
	assert(sorted[2].engine, 'safari');
	assert(sorted[3].engine, 'chrome');
	assert(sorted[4].engine, 'firefox');
	assert(sorted[5].engine, 'safari');
	assert(sorted[6].engine, 'baidu');
	assert(sorted[7].engine, 'bing');

	assert(sorted[0].version, '70.0');
	assert(sorted[1].version, '66.0');
	assert(sorted[2].version, '12.0');
	assert(sorted[3].version, '44.0');
	assert(sorted[4].version, '10.0');
	assert(sorted[5].version, '12.0');
	assert(sorted[6].version, '2.0');
	assert(sorted[7].version, '3.0');

});


export default finish('stealth/parser/UA');

