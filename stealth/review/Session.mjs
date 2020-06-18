
import { isArray, isString         } from '../../base/index.mjs';
import { describe, finish, EXAMPLE } from '../../covert/index.mjs';
import { Request                   } from '../../stealth/source/Request.mjs';
import { Session, isSession        } from '../../stealth/source/Session.mjs';
import { isTab                     } from '../../stealth/source/Tab.mjs';



const mock_date_prefix = () => {
	return (Date.now()).toString().substr(0, 10);
};


describe('new Session()', function(assert) {

	let session = new Session(null);


	assert(session.agent,                                 null);
	assert(isString(session.domain),                      true);
	assert(session.domain.startsWith(mock_date_prefix()), true);
	assert(session.domain.endsWith('.tholian.network'),   true);
	assert(session.tabs,                                  []);
	assert(session.warning,                               0);

	assert(Session.isSession(session), true);
	assert(isSession(session),         true);

});

describe('Session.from()', function(assert) {

	let session = Session.from({
		type: 'Session',
		data: {
			agent: {
				engine:   'safari',
				platform: 'browser',
				system:   'desktop',
				version:  '12.0'
			},
			domain: 'peer.tholian.network',
			warning: 1,
			tabs:    [{
				type: 'Tab',
				data: {
					id: '1337',
					history: [{
						config: {
							domain: 'example.com',
							mode: {
								text:  true,
								image: false,
								audio: false,
								video: false,
								other: true
							}
						},
						time: Date.now(),
						url: 'https://example.com/index.html'
					}]
				}
			}]
		}
	});

	assert(session.agent,   {
		engine:   'safari',
		platform: 'browser',
		system:   'desktop',
		version:  '12.0'
	});
	assert(session.domain,  'peer.tholian.network');
	assert(session.warning, 1);

	assert(isArray(session.tabs),  true);
	assert(isTab(session.tabs[0]), true);

	assert(session.tabs[0].id,     '1337');
	assert(session.tabs[0].url,    'stealth:welcome');
	assert(session.tabs[0].config, {
		domain: 'welcome',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: true,
			other: true
		}
	});

	assert(session.tabs[0].history.length,    1);
	assert(session.tabs[0].history[0].url,    'https://example.com/index.html');
	assert(session.tabs[0].history[0].config, {
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: true
		}
	});

});

describe('Session.isSession()', function(assert) {

	let session = new Session(null);

	assert(typeof Session.isSession, 'function');

	assert(Session.isSession(session), true);

});

describe('isSession()', function(assert) {

	let session = new Session(null);

	assert(typeof isSession, 'function');

	assert(isSession(session), true);

});

describe('Session.prototype.toJSON()', function(assert) {

	let session = Session.from({
		type: 'Session',
		data: {
			agent: {
				engine:   'safari',
				platform: 'browser',
				system:   'desktop',
				version:  '12.0'
			},
			domain: 'peer.tholian.network',
			tabs:    [{
				type: 'Tab',
				data: {
					id: '1337',
					history: [{
						config: {
							domain: 'example.com',
							mode: {
								text:  true,
								image: false,
								audio: false,
								video: false,
								other: true
							}
						},
						time: Date.now(),
						url: 'https://example.com/index.html'
					}]
				}
			}],
			warning: 1
		}
	});

	let json = session.toJSON();

	assert(json.type, 'Session');
	assert(json.data, {
		agent: {
			engine:   'safari',
			platform: 'browser',
			system:   'desktop',
			version:  '12.0'
		},
		domain: 'peer.tholian.network',
		tabs:    [{
			type: 'Tab',
			data: {
				id: '1337',
				config: {
					domain: 'welcome',
					mode: {
						text:  true,
						image: true,
						audio: true,
						video: true,
						other: true
					}
				},
				history: [{
					config: {
						domain: 'example.com',
						mode: {
							text:  true,
							image: false,
							audio: false,
							video: false,
							other: true
						}
					},
					time: Date.now(),
					url: 'https://example.com/index.html'
				}],
				requests: [],
				url: 'stealth:welcome'
			}
		}],
		warning: 1
	});

});

describe('Session.prototype.destroy()', function(assert) {

	let session = Session.from({
		type: 'Session',
		data: {
			agent: {
				engine:   'safari',
				platform: 'browser',
				system:   'desktop',
				version:  '12.0'
			},
			domain: 'peer.tholian.network',
			tabs:    [{
				type: 'Tab',
				data: {
					id: '1337',
					history: [{
						config: {
							domain: 'example.com',
							mode: {
								text:  true,
								image: false,
								audio: false,
								video: false,
								other: true
							}
						},
						time: Date.now(),
						url: 'https://example.com/index.html'
					}]
				}
			}],
			warning: 1
		}
	});

	assert(session.destroy(), true);

	assert(session.agent,                                 null);
	assert(isString(session.domain),                      true);
	assert(session.domain.startsWith(mock_date_prefix()), true);
	assert(session.domain.endsWith('.tholian.network'),   true);
	assert(session.stealth,                               null);
	assert(session.tabs,                                  []);
	assert(session.warning,                               0);

});

describe('Session.prototype.dispatch()', function(assert) {

	let session = new Session(null);

	assert(session.dispatch({
		'domain': 'remote.tholian.network'
	}), true);
	assert(session.domain, 'remote.tholian.network');

	assert(session.dispatch({
		'@remote': '192.168.0.1',
	}), true);
	assert(session.domain, '192.168.0.1');

	assert(session.dispatch({
		'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:66.0) Gecko/20100101 Firefox/66.0'
	}), true);
	assert(session.agent, {
		engine:   'firefox',
		platform: 'browser',
		system:   'desktop',
		version:  '66.0'
	});

});

describe('Session.prototype.get()', function(assert) {

	let request = Request.from({
		type: 'Request',
		data: {
			url: 'https://example.com/does-not-exist.html',
			config: EXAMPLE.config('https://example.com/does-not-exist.html'),
			flags: {
				connect:   false,
				proxy:     true,
				refresh:   true,
				useragent: 'Some User/Agent 13.37',
				webview:   true
			}
		}
	});

	let session = Session.from({
		type: 'Session',
		data: {
			agent: {
				engine:   'safari',
				platform: 'browser',
				system:   'desktop',
				version:  '12.0'
			},
			domain: 'peer.tholian.network',
			tabs:    [{
				type: 'Tab',
				data: {
					id: '1337',
					history: [{
						config: {
							domain: 'example.com',
							mode: {
								text:  true,
								image: false,
								audio: false,
								video: false,
								other: true
							}
						},
						time: Date.now(),
						url: 'https://example.com/index.html'
					}]
				}
			}],
			warning: 1
		}
	});

	assert(session.get('https://example.com/does-not-exist.html'), null);

	assert(session.track(request, '1337'),                         true);
	assert(session.get('https://example.com/does-not-exist.html'), request);

	assert(session.untrack(request, '1337'),                       true);
	assert(session.get('https://example.com/does-not-exist.html'), null);

});

describe('Session.prototype.track()', function(assert) {

	let request = Request.from({
		type: 'Request',
		data: {
			url: 'https://example.com/does-not-exist.html',
			config: EXAMPLE.config('https://example.com/does-not-exist.html'),
			flags: {
				connect:   false,
				proxy:     true,
				refresh:   true,
				useragent: 'Some User/Agent 13.37',
				webview:   true
			}
		}
	});

	let session1 = new Session(null);
	let session2 = new Session(null);
	let session3 = new Session(null);
	let session4 = Session.from({
		type: 'Session',
		data: {
			tabs:    [{
				type: 'Tab',
				data: {
					id: '1337',
					history: []
				}
			}],
			warning: 1
		}
	});

	assert(session1.track(null), false);

	assert(session2.track(request),            true);
	assert(isTab(session2.tabs[0]),            true);
	assert(session2.tabs[0].id,                '0');
	assert(session2.tabs[0].includes(request), true);

	assert(session3.track(request, null),      true);
	assert(isTab(session3.tabs[0]),            true);
	assert(session3.tabs[0].id,                '0');
	assert(session3.tabs[0].includes(request), true);

	assert(session4.track(request, '1337'),    true);
	assert(isTab(session4.tabs[0]),            true);
	assert(session4.tabs[0].id,                '1337');
	assert(session4.tabs[0].includes(request), true);

});

describe('Session.prototype.untrack()', function(assert) {

	let request = Request.from({
		type: 'Request',
		data: {
			url: 'https://example.com/does-not-exist.html',
			config: EXAMPLE.config('https://example.com/does-not-exist.html'),
			flags: {
				connect:   false,
				proxy:     true,
				refresh:   true,
				useragent: 'Some User/Agent 13.37',
				webview:   true
			}
		}
	});

	let session = new Session(null);

	assert(session.track(request),            true);
	assert(isTab(session.tabs[0]),            true);
	assert(session.tabs[0].id,                '0');
	assert(session.tabs[0].includes(request), true);

	assert(session.untrack(request),          true);
	assert(isTab(session.tabs[0]),            true);
	assert(session.tabs[0].id,                '0');
	assert(session.tabs[0].includes(request), false);

});

describe('Session.prototype.warn()', function(assert) {

	let session = Session.from({
		type: 'Session',
		data: {
			domain: 'peer.tholian.network'
		}
	});

	assert(session.warn(null), true);
	assert(session.warning,    1);
	assert(session.domain,     'peer.tholian.network');

	assert(session.warn('service'), true);
	assert(session.warning,         2);
	assert(session.domain,          'peer.tholian.network');

	assert(session.warn('service', 'method'), true);
	assert(session.warning,                   3);
	assert(session.domain,                    'peer.tholian.network');

	assert(session.warn('service', null, 'event'),        true);
	assert(session.warning,                               0);
	assert(isString(session.domain),                      true);
	assert(session.domain.startsWith(mock_date_prefix()), true);
	assert(session.domain.endsWith('.tholian.network'),   true);

});


export default finish('stealth/Session');

