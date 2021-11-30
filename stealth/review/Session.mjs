
import { isArray, isFunction, isString } from '../../base/index.mjs';
import { describe, finish              } from '../../covert/index.mjs';
import { Session, isSession            } from '../../stealth/source/Session.mjs';
import { isTab                         } from '../../stealth/source/Tab.mjs';
import { DATETIME                      } from '../../stealth/source/parser/DATETIME.mjs';
import { IP                            } from '../../stealth/source/parser/IP.mjs';
import { URL                           } from '../../stealth/source/parser/URL.mjs';



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
				reason: {
					'@method': 'GET',
					'@url': 'https://malware.com/download.exe'
				}
			}]
		}
	});

	let json = session.toJSON();

	assert(json.type, 'Session');
	assert(json.data, {
		domain: 'peer-id.tholian.local',
		hosts: [
			'192.168.13.37'
		],
		tabs: [{
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
		warnings: [{
			date:   '2020-12-31',
			time:   '01:02:00',
			origin: 'Webproxy:request',
			reason: {
				'@method': 'GET',
				'@url': 'https://malware.com/download.exe'
			}
		}]
	});

});

describe('Session.prototype.forget()/forever', function(assert) {

	let year_ago = Date.now() - (1000 * 60 * 60 * 24 * 31 * 12);
	let datetime = DATETIME.parse(new Date(year_ago));
	let session  = Session.from({
		type: 'Session',
		data: {
			tabs: [{
				type: 'Tab',
				data: {
					id: '1337',
					history: [{
						date: DATETIME.render(DATETIME.toDate(datetime)),
						link: 'https://a-year-ago.com/index.html',
						time: DATETIME.render(DATETIME.toTime(datetime))
					}]
				}
			}],
			warnings: [{
				date:   DATETIME.render(DATETIME.toDate(datetime)),
				time:   DATETIME.render(DATETIME.toTime(datetime)),
				origin: 'Webproxy:request',
				reason: {
					'@method': 'GET',
					'@url':    'https://a-year-ago.com/index.html'
				}
			}]
		}
	});

	assert(session.forget('forever'), true);

	assert(session.tabs.length,             1);
	assert(session.tabs[0].history.length,  1);
	assert(session.tabs[0].history[0].link, 'https://a-year-ago.com/index.html');
	assert(session.warnings.length,         1);
	assert(session.warnings[0].reason,      { '@method': 'GET', '@url': 'https://a-year-ago.com/index.html' });

});

describe('Session.prototype.forget()/month', function(assert) {

	let month_ago = Date.now() - (1000 * 60 * 60 * 24 * 31);
	let datetime  = DATETIME.parse(new Date(month_ago));
	let before    = DATETIME.parse(new Date(month_ago - (1000 * 60)));
	let after     = DATETIME.parse(new Date(month_ago + (1000 * 60)));
	let session   = Session.from({
		type: 'Session',
		data: {
			tabs: [{
				type: 'Tab',
				data: {
					id: '1337',
					history: [{
						date: DATETIME.render(DATETIME.toDate(before)),
						link: 'https://a-month-ago.com/a-minute-earlier.html',
						time: DATETIME.render(DATETIME.toTime(before))
					}, {
						date: DATETIME.render(DATETIME.toDate(datetime)),
						link: 'https://a-month-ago.com/index.html',
						time: DATETIME.render(DATETIME.toTime(datetime))
					}, {
						date: DATETIME.render(DATETIME.toDate(after)),
						link: 'https://a-month-ago.com/a-minute-later.html',
						time: DATETIME.render(DATETIME.toTime(after))
					}]
				}
			}],
			warnings: [{
				date:   DATETIME.render(DATETIME.toDate(before)),
				time:   DATETIME.render(DATETIME.toTime(before)),
				origin: 'Webproxy:request',
				reason: {
					'@method': 'GET',
					'@url':    'https://a-month-ago.com/a-minute-earlier.html'
				}
			}, {
				date:   DATETIME.render(DATETIME.toDate(datetime)),
				time:   DATETIME.render(DATETIME.toTime(datetime)),
				origin: 'Webproxy:request',
				reason: {
					'@method': 'GET',
					'@url':    'https://a-month-ago.com/index.html'
				}
			}, {
				date:   DATETIME.render(DATETIME.toDate(after)),
				time:   DATETIME.render(DATETIME.toTime(after)),
				origin: 'Webproxy:request',
				reason: {
					'@method': 'GET',
					'@url':    'https://a-month-ago.com/a-minute-later.html'
				}
			}]
		}
	});

	assert(session.forget('month'), true);

	assert(session.tabs.length,             1);
	assert(session.tabs[0].history.length,  2);
	assert(session.tabs[0].history[0].link, 'https://a-month-ago.com/index.html');
	assert(session.tabs[0].history[1].link, 'https://a-month-ago.com/a-minute-later.html');
	assert(session.warnings.length,         2);
	assert(session.warnings[0].reason,      { '@method': 'GET', '@url': 'https://a-month-ago.com/index.html' });
	assert(session.warnings[1].reason,      { '@method': 'GET', '@url': 'https://a-month-ago.com/a-minute-later.html' });

});

describe('Session.prototype.forget()/week', function(assert) {

	let week_ago = Date.now() - (1000 * 60 * 60 * 24 * 7);
	let datetime = DATETIME.parse(new Date(week_ago));
	let before   = DATETIME.parse(new Date(week_ago - (1000 * 60)));
	let after    = DATETIME.parse(new Date(week_ago + (1000 * 60)));
	let session  = Session.from({
		type: 'Session',
		data: {
			tabs: [{
				type: 'Tab',
				data: {
					id: '1337',
					history: [{
						date: DATETIME.render(DATETIME.toDate(before)),
						link: 'https://a-week-ago.com/a-minute-earlier.html',
						time: DATETIME.render(DATETIME.toTime(before))
					}, {
						date: DATETIME.render(DATETIME.toDate(datetime)),
						link: 'https://a-week-ago.com/index.html',
						time: DATETIME.render(DATETIME.toTime(datetime))
					}, {
						date: DATETIME.render(DATETIME.toDate(after)),
						link: 'https://a-week-ago.com/a-minute-later.html',
						time: DATETIME.render(DATETIME.toTime(after))
					}]
				}
			}],
			warnings: [{
				date:   DATETIME.render(DATETIME.toDate(before)),
				time:   DATETIME.render(DATETIME.toTime(before)),
				origin: 'Webproxy:request',
				reason: {
					'@method': 'GET',
					'@url':    'https://a-week-ago.com/a-minute-earlier.html'
				}
			}, {
				date:   DATETIME.render(DATETIME.toDate(datetime)),
				time:   DATETIME.render(DATETIME.toTime(datetime)),
				origin: 'Webproxy:request',
				reason: {
					'@method': 'GET',
					'@url':    'https://a-week-ago.com/index.html'
				}
			}, {
				date:   DATETIME.render(DATETIME.toDate(after)),
				time:   DATETIME.render(DATETIME.toTime(after)),
				origin: 'Webproxy:request',
				reason: {
					'@method': 'GET',
					'@url':    'https://a-week-ago.com/a-minute-later.html'
				}
			}]
		}
	});

	assert(session.forget('week'), true);

	assert(session.tabs.length,             1);
	assert(session.tabs[0].history.length,  2);
	assert(session.tabs[0].history[0].link, 'https://a-week-ago.com/index.html');
	assert(session.tabs[0].history[1].link, 'https://a-week-ago.com/a-minute-later.html');
	assert(session.warnings.length,         2);
	assert(session.warnings[0].reason,      { '@method': 'GET', '@url': 'https://a-week-ago.com/index.html' });
	assert(session.warnings[1].reason,      { '@method': 'GET', '@url': 'https://a-week-ago.com/a-minute-later.html' });

});

describe('Session.prototype.forget()/day', function(assert) {

	let day_ago  = Date.now() - (1000 * 60 * 60 * 24);
	let datetime = DATETIME.parse(new Date(day_ago));
	let before   = DATETIME.parse(new Date(day_ago - (1000 * 60)));
	let after    = DATETIME.parse(new Date(day_ago + (1000 * 60)));
	let session  = Session.from({
		type: 'Session',
		data: {
			tabs: [{
				type: 'Tab',
				data: {
					id: '1337',
					history: [{
						date: DATETIME.render(DATETIME.toDate(before)),
						link: 'https://a-day-ago.com/a-minute-earlier.html',
						time: DATETIME.render(DATETIME.toTime(before))
					}, {
						date: DATETIME.render(DATETIME.toDate(datetime)),
						link: 'https://a-day-ago.com/index.html',
						time: DATETIME.render(DATETIME.toTime(datetime))
					}, {
						date: DATETIME.render(DATETIME.toDate(after)),
						link: 'https://a-day-ago.com/a-minute-later.html',
						time: DATETIME.render(DATETIME.toTime(after))
					}]
				}
			}],
			warnings: [{
				date:   DATETIME.render(DATETIME.toDate(before)),
				time:   DATETIME.render(DATETIME.toTime(before)),
				origin: 'Webproxy:request',
				reason: {
					'@method': 'GET',
					'@url':    'https://a-day-ago.com/a-minute-earlier.html'
				}
			}, {
				date:   DATETIME.render(DATETIME.toDate(datetime)),
				time:   DATETIME.render(DATETIME.toTime(datetime)),
				origin: 'Webproxy:request',
				reason: {
					'@method': 'GET',
					'@url':    'https://a-day-ago.com/index.html'
				}
			}, {
				date:   DATETIME.render(DATETIME.toDate(after)),
				time:   DATETIME.render(DATETIME.toTime(after)),
				origin: 'Webproxy:request',
				reason: {
					'@method': 'GET',
					'@url':    'https://a-day-ago.com/a-minute-later.html'
				}
			}]
		}
	});

	assert(session.forget('day'), true);

	assert(session.tabs.length,             1);
	assert(session.tabs[0].history.length,  2);
	assert(session.tabs[0].history[0].link, 'https://a-day-ago.com/index.html');
	assert(session.tabs[0].history[1].link, 'https://a-day-ago.com/a-minute-later.html');
	assert(session.warnings.length,         2);
	assert(session.warnings[0].reason,      { '@method': 'GET', '@url': 'https://a-day-ago.com/index.html' });
	assert(session.warnings[1].reason,      { '@method': 'GET', '@url': 'https://a-day-ago.com/a-minute-later.html' });

});

describe('Session.prototype.forget()/stealth', function(assert) {

	let year_ago  = DATETIME.parse(new Date(Date.now() - (1000 * 60 * 60 * 24 * 31 * 12)));
	let month_ago = DATETIME.parse(new Date(Date.now() - (1000 * 60 * 60 * 24 * 31)));
	let week_ago  = DATETIME.parse(new Date(Date.now() - (1000 * 60 * 60 * 24 * 7)));
	let day_ago   = DATETIME.parse(new Date(Date.now() - (1000 * 60 * 60 * 24)));
	let session1  = Session.from({
		type: 'Session',
		data: {
			tabs: [{
				type: 'Tab',
				data: {
					id: '1337',
					history: [{
						date: DATETIME.render(DATETIME.toDate(year_ago)),
						link: 'https://a-year-ago.com/index.html',
						time: DATETIME.render(DATETIME.toTime(year_ago))
					}, {
						date: DATETIME.render(DATETIME.toDate(month_ago)),
						link: 'https://a-month-ago.com/index.html',
						time: DATETIME.render(DATETIME.toTime(month_ago))
					}, {
						date: DATETIME.render(DATETIME.toDate(week_ago)),
						link: 'https://a-week-ago.com/index.html',
						time: DATETIME.render(DATETIME.toTime(week_ago))
					}, {
						date: DATETIME.render(DATETIME.toDate(day_ago)),
						link: 'https://a-day-ago.com/index.html',
						time: DATETIME.render(DATETIME.toTime(day_ago))
					}]
				}
			}],
			warnings: [{
				date:   DATETIME.render(DATETIME.toDate(year_ago)),
				time:   DATETIME.render(DATETIME.toTime(year_ago)),
				origin: 'Webproxy:request',
				reason: {
					'@method': 'GET',
					'@url':    'https://a-year-ago.com/index.html'
				}
			}, {
				date:   DATETIME.render(DATETIME.toDate(month_ago)),
				time:   DATETIME.render(DATETIME.toTime(month_ago)),
				origin: 'Webproxy:request',
				reason: {
					'@method': 'GET',
					'@url':    'https://a-month-ago.com/index.html'
				}
			}, {
				date:   DATETIME.render(DATETIME.toDate(week_ago)),
				time:   DATETIME.render(DATETIME.toTime(week_ago)),
				origin: 'Webproxy:request',
				reason: {
					'@method': 'GET',
					'@url':    'https://a-week-ago.com/index.html'
				}
			}, {
				date:   DATETIME.render(DATETIME.toDate(day_ago)),
				time:   DATETIME.render(DATETIME.toTime(day_ago)),
				origin: 'Webproxy:request',
				reason: {
					'@method': 'GET',
					'@url':    'https://a-day-ago.com/index.html'
				}
			}]
		}
	});
	let session2 = Session.from(session1.toJSON());

	assert(session1.forget('stealth'), true);

	assert(session1.tabs.length,             1);
	assert(session1.tabs[0].history.length,  1);
	assert(session1.tabs[0].history[0].link, 'stealth:welcome');
	assert(session1.warnings.length,         0);

	assert(session2.forget('stealth', true), true);

	assert(session2.tabs.length,             0);
	assert(session2.warnings.length,         0);

});

describe('Session.prototype.warn()', function(assert) {

	let session = Session.from({
		type: 'Session',
		data: {
			domain: 'peer-id.tholian.network'
		}
	});

	assert(session.warnings.length, 0);

	session.warn('Webproxy:request', null);

	assert(session.warnings.length,  1);
	assert(session.warnings[0],      [{
		date:   DATETIME.toDate(DATETIME.parse(new Date())),
		time:   DATETIME.toTime(DATETIME.parse(new Date())),
		origin: 'Webproxy:request',
		reason: null
	}]);

	session.warn('Webproxy:error', {
		type:  'connection',
		cause: 'socket-stability'
	});

	assert(session.warnings.length,  2);
	assert(session.warnings[1],      [{
		date:   DATETIME.toDate(DATETIME.parse(new Date())),
		time:   DATETIME.toTime(DATETIME.parse(new Date())),
		origin: 'Webproxy:error',
		reason: {
			type:  'connection',
			cause: 'socket-stability'
		}
	}]);

});


export default finish('stealth/Session', {
	internet: false,
	network:  false
});

