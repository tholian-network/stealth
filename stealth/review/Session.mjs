
import { isArray, isFunction, isString } from '../../base/index.mjs';
import { describe, finish              } from '../../covert/index.mjs';
import { Request                       } from '../../stealth/source/Request.mjs';
import { Session, isSession            } from '../../stealth/source/Session.mjs';
import { isTab                         } from '../../stealth/source/Tab.mjs';
import { DATETIME                      } from '../../stealth/source/parser/DATETIME.mjs';
import { IP                            } from '../../stealth/source/parser/IP.mjs';
import { URL                           } from '../../stealth/source/parser/URL.mjs';



const mock_date_prefix = () => {
	return (Date.now()).toString().substr(0, 10);
};


describe('new Session()', function(assert) {

	let session = new Session(null);

	assert(isString(session.domain),                  true);
	assert(session.domain.endsWith('.tholian.local'), true);
	assert(session.hosts,                             []);
	assert(session.tabs,                              []);
	assert(session.ua,                                null);
	assert(session.warnings,                          []);

	assert(Session.isSession(session), true);
	assert(isSession(session),         true);

});

describe('Session.from()', function(assert) {

	assert(isFunction(Session.from), true);

	let session = Session.from({
		type: 'Session',
		data: {
			domain: 'peer-id.tholian.local',
			hosts: [
				'192.168.13.37'
			],
			tabs: [{
				type: 'Tab',
				data: {
					id: '1337',
					history: [{
						date: '2020-12-31',
						link: 'https://example.com/index.html',
						mode: {
							domain: 'example.com',
							mode: {
								text:  true,
								image: false,
								audio: false,
								video: false,
								other: true
							}
						},
						time: '01:02:03'
					}]
				}
			}],
			ua: {
				engine:   'safari',
				platform: 'browser',
				system:   'desktop',
				version:  '12.0'
			},
			warnings: [{
				date:   '2020-12-31',
				time:   '01:02:00',
				origin: 'Webproxy:request',
				reason: null
			}]
		}
	});

	assert(session.domain, 'peer-id.tholian.local');
	assert(session.hosts, [
		IP.parse('192.168.13.37')
	]);
	assert(session.ua, {
		engine:   'safari',
		platform: 'browser',
		system:   'desktop',
		version:  '12.0'
	});
	assert(session.warnings, [{
		date:   DATETIME.parse('2020-12-31'),
		time:   DATETIME.parse('01:02:00'),
		origin: 'Webproxy:request',
		reason: null
	}]);

	assert(isArray(session.tabs),  true);
	assert(isTab(session.tabs[0]), true);

	assert(session.tabs[0].id,   '1337');
	assert(session.tabs[0].url,  URL.parse('stealth:welcome'));
	assert(session.tabs[0].mode, {
		domain: 'welcome',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: true,
			other: true
		}
	});

	assert(isArray(session.tabs[0].history), true);
	assert(session.tabs[0].history,          [{
		date: DATETIME.parse('2020-12-31'),
		link: 'https://example.com/index.html',
		mode: {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: true
			}
		},
		time: DATETIME.parse('01:02:03')
	}]);

});

describe('Session.merge()', function(assert) {

	assert(isFunction(Session.merge), true);

	let session1 = new Session();
	let session2 = Session.from({
		type: 'Session',
		data: {
			domain: 'peer-id.tholian.local',
			hosts: [
				'192.168.13.37'
			],
			tabs: [{
				type: 'Tab',
				data: {
					id: '1337',
					history: [{
						date: '2020-12-31',
						link: 'https://example.com/index.html',
						mode: {
							domain: 'example.com',
							mode: {
								text:  true,
								image: false,
								audio: false,
								video: false,
								other: true
							}
						},
						time: '01:02:03'
					}]
				}
			}],
			ua: {
				engine:   'safari',
				platform: 'browser',
				system:   'desktop',
				version:  '12.0'
			},
			warnings: [{
				date:   '2020-12-31',
				time:   '01:02:00',
				origin: 'Webproxy:request',
				reason: null
			}]
		}
	});

	assert(Session.merge(session1, session2), session1);

	assert(session1.domain, 'peer-id.tholian.network');
	assert(session1.hosts,  [
		IP.parse('192.168.13.37')
	]);
	assert(session1.ua, {
		engine:   'safari',
		platform: 'browser',
		system:   'desktop',
		version:  '12.0'
	});
	assert(session1.warnings, [{
		date:   DATETIME.parse('2020-12-31'),
		time:   DATETIME.parse('01:02:00'),
		origin: 'Webproxy:request',
		reason: null
	}]);

	assert(isArray(session1.tabs),  true);
	assert(isTab(session1.tabs[0]), true);

	assert(session1.tabs[0].id,   '1337');
	assert(session1.tabs[0].url,  URL.parse('stealth:welcome'));
	assert(session1.tabs[0].mode, {
		domain: 'welcome',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: true,
			other: true
		}
	});

	assert(isArray(session1.tabs[0].history), true);
	assert(session1.tabs[0].history,          [{
		date: DATETIME.parse('2020-12-31'),
		link: 'https://example.com/index.html',
		mode: {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: true
			}
		},
		time: DATETIME.parse('01:02:03')
	}]);

});

describe('Session.merge()/complex', function(assert) {

	assert(isFunction(Session.merge), true);

	let session1 = Session.from({
		type: 'Session',
		data: {
			domain: 'session-' + Date.now() + '.tholian.local',
			hosts: [
				'127.0.0.1'
			],
			tabs: [{
				type: 'Tab',
				data: {
					id: '1337',
					history: [{
						date: '2020-12-30',
						link: 'https://some-website.com/index.html',
						mode: {
							domain: 'some-website.com',
							mode: {
								text:  true,
								image: true,
								audio: false,
								video: true,
								other: false
							}
						},
						time: '23:59:59'
					}]
				}
			}, {
				type: 'Tab',
				data: {
					id:   '1338',
					url:  'https://tholian.network/index.html',
					mode: {
						domain: 'tholian.network',
						mode: {
							text:  true,
							image: true,
							audio: true,
							video: true,
							other: true
						}
					},
					history: [{
						date: '2020-12-31',
						link: 'https://other-website.com/index.html',
						mode: {
							domain: 'other-website.com',
							mode: {
								text:  true,
								image: true,
								audio: false,
								video: false,
								other: true
							}
						},
						time: '01:30:00'
					}]
				}
			}],
			ua: null,
			warnings: [{
				date:   '2020-12-30',
				time:   '23:59:59',
				origin: 'Webserver:request',
				reason: null
			}]
		}
	});
	let session2 = Session.from({
		type: 'Session',
		data: {
			domain: 'peer-id.tholian.local',
			hosts: [
				'192.168.13.37'
			],
			tabs: [{
				type: 'Tab',
				data: {
					id: '1337',
					history: [{
						date: '2020-12-31',
						link: 'https://example.com/index.html',
						mode: {
							domain: 'example.com',
							mode: {
								text:  true,
								image: false,
								audio: true,
								video: false,
								other: true
							}
						},
						time: '01:02:03'
					}]
				}
			}, {
				type: 'Tab',
				data: {
					id: '1339',
					history: [{
						date: '2020-12-31',
						link: 'https://example.com/index.html',
						mode: {
							domain: 'example.com',
							mode: {
								text:  true,
								image: false,
								audio: false,
								video: false,
								other: true
							}
						},
						time: '02:03:04'
					}]
				}
			}],
			ua: {
				engine:   'safari',
				platform: 'browser',
				system:   'desktop',
				version:  '12.0'
			},
			warnings: [{
				date:   '2020-12-31',
				time:   '01:02:00',
				origin: 'Webproxy:request',
				reason: null
			}]
		}
	});

	assert(Session.merge(session1, session2), session1);

	assert(session1.domain, 'peer-id.tholian.local');
	assert(session1.hosts, [
		IP.parse('127.0.0.1'),
		IP.parse('192.168.13.37')
	]);
	assert(session1.ua, {
		engine:   'safari',
		platform: 'browser',
		system:   'desktop',
		version:  '12.0'
	});

	assert(session1.warnings, [{
		date:   DATETIME.parse('2020-12-30'),
		time:   DATETIME.parse('23:59:59'),
		origin: 'Webserver:request',
		reason: null
	}, {
		date:   DATETIME.parse('2020-12-31'),
		time:   DATETIME.parse('01:02:00'),
		origin: 'Webproxy:request',
		reason: null
	}]);

	assert(isArray(session1.tabs),  true);
	assert(isTab(session1.tabs[0]), true);
	assert(isTab(session1.tabs[1]), true);
	assert(isTab(session1.tabs[2]), true);

	assert(session1.tabs[0].id,   '1337');
	assert(session1.tabs[0].url,  URL.parse('stealth:welcome'));
	assert(session1.tabs[0].mode, {
		domain: 'welcome',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: true,
			other: true
		}
	});

	assert(isArray(session1.tabs[0].history), true);
	assert(session1.tabs[0].history, [{
		date: DATETIME.parse('2020-12-30'),
		link: 'https://some-website.com/index.html',
		mode: {
			domain: 'some-website.com',
			mode: {
				text:  true,
				image: true,
				audio: false,
				video: true,
				other: false
			}
		},
		time: DATETIME.parse('23:59:59')
	}, {
		date: DATETIME.parse('2020-12-31'),
		link: 'https://example.com/index.html',
		mode: {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: true,
				video: false,
				other: true
			}
		},
		time: DATETIME.parse('01:02:03')
	}]);

	assert(session1.tabs[1].id,   '1338');
	assert(session1.tabs[1].url,  URL.parse('https://tholian.network/index.html'));
	assert(session1.tabs[1].mode, {
		domain: 'tholian.network',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: true,
			other: true
		}
	});

	assert(isArray(session1.tabs[1].history), true);
	assert(session1.tabs[1].history, [{
		date: DATETIME.parse('2020-12-31'),
		link: 'https://other-website.com/index.html',
		mode: {
			domain: 'other-website.com',
			mode: {
				text:  true,
				image: true,
				audio: false,
				video: false,
				other: true
			}
		},
		time: DATETIME.parse('01:30:00')
	}, {
		date: DATETIME.toDate(DATETIME.parse(new Date())),
		link: 'https://tholian.network/index.html',
		mode: {
			domain: 'tholian.network',
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: true,
				other: true
			}
		},
		time: DATETIME.toTime(DATETIME.parse(new Date()))
	}]);

	assert(session1.tabs[2].id,   '1339');
	assert(session1.tabs[2].url,  URL.parse('stealth:welcome'));
	assert(session1.tabs[2].mode, {
		domain: 'welcome',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: true,
			other: true
		}
	});

	assert(isArray(session1.tabs[2].history), true);
	assert(session1.tabs[2].history, [{
		date: DATETIME.parse('2020-12-31'),
		link: 'https://example.com/index.html',
		mode: {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: true
			}
		},
		time: DATETIME.parse('02:03:04')
	}]);

});

describe('Session.isSession()', function(assert) {

	let session = new Session(null);

	assert(isFunction(Session.isSession), true);

	assert(Session.isSession(session), true);

});

describe('isSession()', function(assert) {

	let session = new Session(null);

	assert(isFunction(isSession), true);

	assert(isSession(session), true);

});

















describe('Session.prototype.toJSON()', function(assert) {

	let session = Session.from({
		type: 'Session',
		data: {
			domain: 'peer.tholian.network',
			tabs:    [{
				type: 'Tab',
				data: {
					id: '1337',
					history: [{
						link: 'https://example.com/index.html',
						mode: {
							domain: 'example.com',
							mode: {
								text:  true,
								image: false,
								audio: false,
								video: false,
								other: true
							}
						},
						time: Date.now()
					}]
				}
			}],
			ua: {
				engine:   'safari',
				platform: 'browser',
				system:   'desktop',
				version:  '12.0'
			},
			warning: 1
		}
	});

	let json = session.toJSON();

	assert(json.type, 'Session');
	assert(json.data, {
		domain: 'peer.tholian.network',
		tabs:    [{
			type: 'Tab',
			data: {
				id: '1337',
				mode: {
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
					link: 'https://example.com/index.html',
					mode: {
						domain: 'example.com',
						mode: {
							text:  true,
							image: false,
							audio: false,
							video: false,
							other: true
						}
					},
					time: Date.now()
				}],
				requests: [],
				url: 'stealth:welcome'
			}
		}],
		ua: {
			engine:   'safari',
			platform: 'browser',
			system:   'desktop',
			version:  '12.0'
		},
		warning: 1
	});

});

describe('Session.prototype.destroy()', function(assert) {

	let session = Session.from({
		type: 'Session',
		data: {
			domain: 'peer.tholian.network',
			tabs:    [{
				type: 'Tab',
				data: {
					id: '1337',
					history: [{
						link: 'https://example.com/index.html',
						mode: {
							domain: 'example.com',
							mode: {
								text:  true,
								image: false,
								audio: false,
								video: false,
								other: true
							}
						},
						time: Date.now()
					}]
				}
			}],
			ua: {
				engine:   'safari',
				platform: 'browser',
				system:   'desktop',
				version:  '12.0'
			},
			warning: 1
		}
	});

	assert(session.destroy(), true);

	assert(isString(session.domain),                      true);
	assert(session.domain.startsWith(mock_date_prefix()), true);
	assert(session.domain.endsWith('.tholian.network'),   true);
	assert(session.stealth,                               null);
	assert(session.tabs,                                  []);
	assert(session.ua,                                    null);
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
	assert(session.ua, {
		engine:   'firefox',
		platform: 'browser',
		system:   'desktop',
		version:  '66.0'
	});

});

describe('Session.prototype.get()', function(assert) {

	let mode    = { domain: 'example.com', mode: { text: true, image: false, audio: false, video: false, other: false }};
	let request = Request.from({
		type: 'Request',
		data: {
			url:  'https://example.com/does-not-exist.html',
			mode: mode
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
						link: 'https://example.com/index.html',
						mode: {
							domain: 'example.com',
							mode: {
								text:  true,
								image: false,
								audio: false,
								video: false,
								other: true
							}
						},
						time: Date.now()
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

	let mode    = { domain: 'example.com', mode: { text: true, image: false, audio: false, video: false, other: false }};
	let request = Request.from({
		type: 'Request',
		data: {
			url:  'https://example.com/does-not-exist.html',
			mode: mode
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

	let mode    = { domain: 'example.com', mode: { text: true, image: false, audio: false, video: false, other: false }};
	let request = Request.from({
		type: 'Request',
		data: {
			url:  'https://example.com/does-not-exist.html',
			mode: mode
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


export default finish('stealth/Session', {
	internet: true,
	network:  true
});

