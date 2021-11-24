
import { isArray, isNumber, isObject, isString } from '../../extern/base.mjs';



const parse_version = function(prefix, agent) {

	let version = null;

	let tmp = agent.split(';').join(' ').split(' ').map((v) => v.trim()).find((v) => {
		return v.startsWith(prefix + '/') === true;
	}) || null;

	if (tmp !== null) {

		tmp = tmp.split('/').pop();
		tmp = tmp.split('.').slice(0, 2).join('.');

		if (tmp.includes('.') === true) {

			let num = parseFloat(tmp);
			if (Number.isNaN(num) === false) {
				version = (num).toFixed(1);
			}

		} else {

			let num = parseInt(tmp, 10);
			if (Number.isNaN(num) === false) {
				version = (num).toString() + '.0';
			}

		}

	}

	return version;

};

const randomize = function(values) {

	if (isNumber(values[0]) === true && Number.isNaN(values[0]) === false) {

		values = values.map((v) => {

			let str = (v).toString();
			if (str.includes('.') === false) {
				return str + '.0';
			} else {
				return str;
			}

		});

		let index = (Math.random() * values.length) | 0;
		return values[index];

	} else {

		let index = (Math.random() * values.length) | 0;
		return values[index];

	}

};



const BROWSER = {

	chrome: {

		parse: function(agent) {

			let engine  = null;
			let system  = null;
			let version = null;

			if (agent.includes('Chrome') === true) {
				engine = 'chrome';
			} else if (agent.includes('Chromium') === true) {
				engine = 'chrome';
			}

			if (agent.includes('Macintosh') === true || agent.includes('Ubuntu') === true || agent.includes('Windows') === true) {
				system = 'desktop';
			} else if (agent.includes('Android') === true) {
				system = 'mobile';
			} else if (agent.includes('iPad') === true || agent.includes('iPhone') === true) {
				system = 'mobile';
			} else if (agent.includes('Linux') === true) {
				system = 'desktop';
			}

			if (agent.includes('Chrome/') === true) {
				version = parse_version('Chrome', agent);
			} else if (agent.includes('Chromium/') === true) {
				version = parse_version('Chromium', agent);
			}

			if (engine !== null && system !== null && version !== null) {

				return {
					engine:  engine,
					system:  system,
					version: version
				};

			}


			return null;

		},

		render: function(data) {

			if (data.engine === 'chrome') {

				if (data.system === null) {
					data.system = randomize([ 'desktop', 'mobile' ]);
				}

				if (data.version === null) {

					if (data.system === 'desktop') {
						data.version = randomize([ 44.0, 46.0, 60.0, 63.0, 69.0, 70.0, 71.0, 72.0, 73.0, 74.0 ]);
					} else if (data.system === 'mobile') {
						data.version = randomize([ 28.0, 53.0, 63.0, 67.0, 68.0, 69.0, 70.0 ]);
					}

				}

				if (data.system === 'desktop') {

					return randomize([
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Safari/537.36',
						'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Safari/537.36',
						'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Safari/537.36',
						'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Safari/537.36',
						'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Safari/537.36',
						'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Safari/537.36',
						'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Safari/537.36',
						'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Safari/537.36',
						'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Safari/537.36'
					]);

				} else if (data.system === 'mobile') {

					return randomize([
						'Mozilla/5.0 (Linux; Android 8.1.0; Moto G (5)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Mobile Safari/537.36',
						'Mozilla/5.0 (Linux; Android 8.0.0; WAS-LX3 Build/HUAWEIWAS-LX3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Mobile Safari/537.36',
						'Mozilla/5.0 (Linux; Android 7.1.1; Moto G (5S) Build/NPPS26.102-49-11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Mobile Safari/537.36',
						'Mozilla/5.0 (Linux; Android 7.0; Moto G (4) Build/NPJS25.93-14-18) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Mobile Safari/537.36',
						'Mozilla/5.0 (Linux; Android 6.0.1; SM-G532G Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Mobile Safari/537.36',
						'Mozilla/5.0 (Linux; Android 6.0; vivo 1713 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Mobile Safari/537.36',
						'Mozilla/5.0 (Linux; Android 5.1.1; A37fw Build/LMY47V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Mobile Safari/537.36',
						'Mozilla/5.0 (Linux; Android 4.4.2; SM-G7102 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Mobile Safari/537.36',
						'Mozilla/5.0 (Linux; Android 4.3; MediaPad 7 Youth 2 Build/HuaweiMediaPad) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + data.version + ' Safari/537.36'
					]);

				}

			}

			return null;

		}

	},

	firefox: {

		parse: function(agent) {

			let engine  = null;
			let system  = null;
			let version = null;

			if (agent.includes('Fennec') === true) {
				engine = 'firefox';
				system = 'mobile';
			} else if (agent.includes('Firefox') === true) {
				engine = 'firefox';
				system = 'desktop';
			}

			if (agent.includes('Fennec/') === true) {
				version = parse_version('Fennec', agent);
			} else if (agent.includes('Firefox/') === true) {
				version = parse_version('Firefox', agent);
			}

			if (engine !== null && system !== null && version !== null) {

				return {
					engine:  engine,
					system:  system,
					version: version
				};

			}

			return null;

		},

		render: function(data) {

			if (data.engine === 'firefox') {

				if (data.system === null) {
					data.system = randomize([ 'desktop', 'mobile' ]);
				}

				if (data.version === null) {

					if (data.system === 'desktop') {
						data.version = randomize([ 7.0, 18.0, 36.0, 38.0, 40.1, 54.0, 65.0, 66.0, 67.0, 68.0, 91.0, 92.0, 93.0 ]);
					} else if (data.system === 'mobile') {
						data.version = randomize([ 7.0, 8.0, 9.0, 10.0, 68.0, 91.0, 92.0, 93.0, 94.0 ]);
					}

				}

				if (data.system === 'desktop') {

					if (data.version > 50) {
						return 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:' + data.version + ') Gecko/20100101 Firefox/' + data.version;
					} else if (data.version > 18) {
						return 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:' + data.version + ') Gecko/20100101 Firefox/' + data.version;
					} else {
						return 'Mozilla/5.0 (Windows NT 5.1; rv:' + data.version + ') Gecko/20100101 Firefox/' + data.version;
					}

				} else if (data.system === 'mobile') {

					if (data.version > 10) {

						return randomize([
							'Mozilla/5.0 (Android 8; Mobile; rv:' + data.version + ') Gecko/' + data.version + ' Firefox/' + data.version,
							'Mozilla/5.0 (Android 9; Mobile; rv:' + data.version + ') Gecko/' + data.version + ' Firefox/' + data.version,
							'Mozilla/5.0 (Android 10; Mobile; rv:' + data.version + ') Gecko/' + data.version + ' Firefox/' + data.version,
						]);

					} else {

						return randomize([
							'Mozilla/5.0 (Android; Linux armv7l; rv:' + data.version + ') Gecko/20111216 Firefox/' + data.version + ' Fennec/' + data.version,
							'Mozilla/5.0 (Android; Mobile; rv:' + data.version + ') Gecko/' + data.version + ' Firefox/' + data.version + ' Fennec/' + data.version,
							'Mozilla/5.0 (Android; Tablet; rv:' + data.version + ') Gecko/' + data.version + ' Firefox/' + data.version + ' Fennec/' + data.version,
						]);

					}

				}

			}

			return null;

		}

	},

	safari: {

		parse: function(agent) {

			let engine  = null;
			let system  = null;
			let version = null;

			if (agent.includes('Safari') === true) {

				if (agent.includes('iPhone') === true || agent.includes('iPad') === true) {
					engine = 'safari';
					system = 'mobile';
				} else if (agent.includes('Mac OS X') === true) {
					engine = 'safari';
					system = 'desktop';
				}

			}

			if (agent.includes('Safari/') === true && agent.includes('Version/') === true) {
				version = parse_version('Version', agent);
			}

			if (engine !== null && system !== null && version !== null) {

				return {
					engine:  engine,
					system:  system,
					version: version
				};

			}

			return null;

		},

		render: function(data) {

			if (data.engine === 'safari') {

				if (data.system === null) {
					data.system = randomize([ 'desktop', 'mobile' ]);
				}

				if (data.version === null) {

					if (data.system === 'desktop') {
						data.version = randomize([ 9.1, 10.1, 11.1, 12.0, 13.0, 14.0, 15.0 ]);
					} else if (data.system === 'mobile') {
						data.version = randomize([ 9.0, 10.0, 11.0, 12.0, 13.0, 14.1 ]);
					}

				}

				if (data.system === 'desktop') {

					if (data.version === '15.0') {
						return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15';
					} else if (data.version === '14.0') {
						return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15';
					} else if (data.version === '13.0') {
						return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15';
					} else if (data.version === '12.0') {
						return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15';
					} else if (data.version === '11.1') {
						return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15';
					} else if (data.version === '10.1') {
						return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8';
					} else if (data.version === '9.1') {
						return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.7 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7';
					}

				} else if (data.system === 'mobile') {

					if (data.version === '14.1') {
						return 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1';
					} else if (data.version === '13.0') {
						return 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1';
					} else if (data.version === '12.0') {
						return 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1';
					} else if (data.version === '11.0') {

						return randomize([
							'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1',
							'Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1'
						]);

					} else if (data.version === '10.0') {

						return randomize([
							'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.0 Mobile/14G60 Safari/602.1',
							'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_2 like Mac OS X) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.0 Mobile/14F89 Safari/602.1',
							'Mozilla/5.0 (iPhone; CPU iPhone OS 10_2_1 like Mac OS X) AppleWebKit/602.4.6 (KHTML, like Gecko) Version/10.0 Mobile/14D27 Safari/602.1',
							'Mozilla/5.0 (iPad; CPU OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.0 Mobile/14G60 Safari/602.1',
							'Mozilla/5.0 (iPad; CPU OS 10_2_1 like Mac OS X) AppleWebKit/602.4.6 (KHTML, like Gecko) Version/10.0 Mobile/14D27 Safari/602.1'
						]);

					} else if (data.version === '9.0') {

						return randomize([
							'Mozilla/5.0 (iPad; CPU OS 9_3_5 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13G36 Safari/601.1',
							'Mozilla/5.0 (iPad; CPU OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13F69 Safari/601.1'
						]);

					}

				}

			}

			return null;

		}

	}

};

const SPIDER = {

	baidu: {

		parse: function(agent) {

			let engine  = null;
			let system  = null;
			let version = null;

			if (agent.includes('Baiduspider') === true || agent.includes('baiduboxapp') === true) {
				engine = 'baidu';
			}

			if (agent.includes('iPhone') === true || agent.includes('Android') === true) {
				system = 'mobile';
			} else {
				system = 'desktop';
			}

			if (agent.includes('Baiduspider+') === true) {
				version = '2.0';
			} else if (agent.includes('Baiduspider/') === true) {
				version = parse_version('Baiduspider', agent);
			} else if (agent.includes('baiduboxapp/') === true) {
				version = parse_version('baiduboxapp', agent);
			}

			if (engine !== null && system !== null && version !== null) {

				return {
					engine:  engine,
					system:  system,
					version: version
				};

			}

			return null;

		},

		render: function(data) {

			if (data.engine === 'baidu') {

				if (data.system === null) {
					data.system = randomize([ 'desktop', 'mobile' ]);
				}

				if (data.version === null) {

					if (data.system === 'desktop') {
						data.version = randomize([ 2.0 ]);
					} else if (data.system === 'mobile') {
						data.version = randomize([ 5.0, 8.6, 11.0, 11.1 ]);
					}

				}

				if (data.system === 'desktop') {

					return randomize([
						'Baiduspider+(+http://www.baidu.com/search/spider.htm)',
						'Mozilla/5.0 (compatible; Baiduspider/' + data.version + '; +http://www.baidu.com/search/spider.html)'
					]);

				} else if (data.system === 'mobile') {

					return randomize([
						'Mozilla/5.0 (Linux; Android 5.1.1; vivo X7 Build/LMY47V; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/48.0.2564.116 Mobile Safari/537.36 baiduboxapp/' + data.version + ' (Baidu; P1 5.1.1)',
						'Mozilla/5.0 (Linux; Android 6.0; BLN-AL10 Build/HONORBLN-AL10; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/63.0.3239.83 Mobile Safari/537.36 T7/11.0 baiduboxapp/' + data.version + ' (Baidu; P1 6.0)',
						'Mozilla/5.0 (Linux; U; Android 4.2.2; en-us; HUAWEI G730-U00 Build/HuaweiG730-U00) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 baiduboxapp/' + data.version + ' (Baidu; P1 4.2.2)',
						'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Mobile/14A403 baiduboxapp/' + data.version + ' (Baidu; P2 10.0.1)',
						'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16B92 baiduboxapp/' + data.version + ' (Baidu; P2 12.1)'
					]);

				}

			}

			return null;

		}

	},

	bing: {

		parse: function(agent) {

			let engine  = null;
			let system  = null;
			let version = null;

			if (agent.includes('bingbot') === true || agent.includes('bingbot-media') === true) {
				engine = 'bing';
			}

			if (agent.includes('iPhone') === true) {
				system = 'mobile';
			} else {
				system = 'desktop';
			}

			if (agent.includes('bingbot/') === true) {
				version = parse_version('bingbot', agent);
			} else if (agent.includes('bingbot-media/') === true) {
				version = parse_version('bingbot-media', agent);
			}

			if (engine !== null && system !== null && version !== null) {

				return {
					engine:  engine,
					system:  system,
					version: version
				};

			}

			return null;

		},

		render: function(data) {

			if (data.engine === 'bing') {

				if (data.system === null) {
					data.system = randomize([ 'desktop', 'mobile' ]);
				}

				if (data.version === null) {
					data.version = randomize([ 1.0, 2.0, 3.0 ]);
				}

				if (data.system === 'desktop') {

					return randomize([
						'Mozilla/5.0 (compatible; bingbot/' + data.version + '; +http://www.bing.com/bingbot.htm)',
						'Mozilla/5.0 (compatible; bingbot-media/' + data.version + '; +http://www.bing.com/bingbot.htm)'
					]);

				} else if (data.system === 'mobile') {

					return randomize([
						'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53 (compatible; bingbot/' + data.version + '; +http://www.bing.com/bingbot.htm)',
						'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 (compatible; bingbot/' + data.version + '; +http://www.bing.com/bingbot.htm)'
					]);

				}

			}

			return null;

		}

	},

	facebook: {

		parse: function(agent) {

			let engine  = null;
			let system  = null;
			let version = null;

			if (agent.includes('facebook') === true) {
				engine = 'facebook';
			}

			if (agent.includes('FBAN') === true || agent.includes('FBIOS') === true) {
				system = 'mobile';
			} else {
				system = 'desktop';
			}

			if (agent.includes('facebookexternalhit/') === true) {
				version = parse_version('facebookexternalhit', agent);
			} else if (agent.includes('FBAN') === true || agent.includes('FBIOS') === true) {
				version = parse_version('FBAV', agent);
			}

			if (engine !== null && system !== null && version !== null) {

				return {
					engine:  engine,
					system:  system,
					version: version
				};

			}

			return null;

		},

		render: function(data) {

			if (data.engine === 'facebook') {

				if (data.system === null) {
					data.system = randomize([ 'desktop', 'mobile' ]);
				}

				if (data.version === null) {

					if (data.system === 'desktop') {
						data.version = randomize([ 1.0, 1.1 ]);
					} else if (data.system === 'mobile') {
						data.version = randomize([ 90.0, 153.0, 183.0, 196.0 ]);
					}

				}

				if (data.system === 'desktop') {

					return randomize([
						'facebookexternalhit/' + data.version + ' (+http://www.facebook.com/externalhit_uatext.php)',
						'facebookexternalhit/' + data.version
					]);

				} else if (data.system === 'mobile') {

					if (data.version > 180) {

						return randomize([
							'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15G77 [FBAN/FBIOS;FBAV/' + data.version + ';FBBV/129677436;FBDV/iPhone8,1;FBMD/iPhone;FBSN/iOS;FBSV/11.4.1;FBSS/2;FBCR/Oi;FBID/phone;FBLC/pt_BR;FBOP/5;FBRV/129981955]',
							'Mozilla/5.0 (iPad; CPU OS 11_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15G77 [FBAN/FBIOS;FBAV/' + data.version + ';FBBV/129677436;FBDV/iPad7,5;FBMD/iPad;FBSN/iOS;FBSV/11.4.1;FBSS/2;FBCR/Oi;FBID/tablet;FBLC/pt_BR;FBOP/5;FBRV/129981955]'
						]);

					} else if (data.version > 160) {

						return randomize([
							'Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E302 [FBAN/FBIOS;FBAV/' + data.version + ';FBBV/104829965;FBDV/iPhone9,2;FBMD/iPhone;FBSN/iOS;FBSV/11.3.1;FBSS/3;FBCR/Oi;FBID/phone;FBLC/pt_BR;FBOP/5;FBRV/0]',
							'Mozilla/5.0 (iPad; CPU OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E302 [FBAN/FBIOS;FBAV/' + data.version + ';FBBV/104829965;FBDV/iPad3,5;FBMD/iPad;FBSN/iOS;FBSV/11.3.1;FBSS/3;FBCR/Oi;FBID/tablet;FBLC/pt_BR;FBOP/5;FBRV/0]'
						]);

					} else if (data.version > 150) {

						return randomize([
							'Mozilla/5.0 (iPhone; CPU iPhone OS 11_2_1 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Mobile/15C153 [FBAN/FBIOS;FBAV/' + data.version + ';FBBV/84268146;FBDV/iPhone7,2;FBMD/iPhone;FBSN/iOS;FBSV/11.2.1;FBSS/2;FBCR/VIVO;FBID/phone;FBLC/pt_BR;FBOP/5;FBRV/0]',
							'Mozilla/5.0 (iPad; CPU OS 11_2_1 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Mobile/15C153 [FBAN/FBIOS;FBAV/' + data.version + ';FBBV/84268146;FBDV/iPad3,1;FBMD/iPad;FBSN/iOS;FBSV/11.2.1;FBSS/2;FBCR/VIVO;FBID/tablet;FBLC/pt_BR;FBOP/5;FBRV/0]'
						]);

					} else {

						return randomize([
							'Mozilla/5.0 (iPhone; CPU iPhone OS 10_2_1 like Mac OS X) AppleWebKit/602.4.6 (KHTML, like Gecko) Mobile/14D27 [FBAN/FBIOS;FBAV/' + data.version + ';FBBV/56254015;FBDV/iPhone8,1;FBMD/iPhone;FBSN/iOS;FBSV/10.2.1;FBSS/2;FBCR/Carrier;FBID/phone;FBLC/pt_BR;FBOP/5;FBRV/0]',
							'Mozilla/5.0 (iPad; CPU OS 10_2_1 like Mac OS X) AppleWebKit/602.4.6 (KHTML, like Gecko) Mobile/14D27 [FBAN/FBIOS;FBAV/' + data.version + ';FBBV/56254015;FBDV/iPad3,5;FBMD/iPad;FBSN/iOS;FBSV/10.2.1;FBSS/2;FBCR/Carrier;FBID/tablet;FBLC/pt_BR;FBOP/5;FBRV/0]'
						]);

					}

				}

			}

			return null;

		}

	},

	google: {

		parse: function(agent) {

			let engine  = null;
			let system  = null;
			let version = null;

			if (agent.includes('Googlebot') === true) {
				engine = 'google';
			}

			if (agent.includes('Mobile') === true) {
				system = 'mobile';
			} else {
				system = 'desktop';
			}

			if (agent.includes('Googlebot/') === true) {
				version = parse_version('Googlebot', agent);
			}

			if (engine !== null && system !== null && version !== null) {

				return {
					engine:  engine,
					system:  system,
					version: version
				};

			}

			return null;

		},

		render: function(data) {

			if (data.engine === 'google') {

				if (data.system === null) {
					data.system = randomize([ 'desktop', 'mobile' ]);
				}

				if (data.version === null) {
					data.version = randomize([ 2.1, 1.0 ]);
				}

				if (data.system === 'desktop') {

					return randomize([
						'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/' + data.version + '; +http://www.google.com/bot.html) Safari/537.36',
						'Mozilla/5.0 (compatible; Googlebot/' + data.version + '; +http://www.google.com/bot.html)',
						'Googlebot/' + data.version + ' (+http://www.google.com/bot.html)'
					]);

				} else if (data.system === 'mobile') {

					return randomize([
						'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Googlebot/' + data.version + '; +http://www.google.com/bot.html)',
						'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 (compatible; Googlebot/' + data.version + '; +http://www.google.com/bot.html)'
					]);

				}

			}

			return null;

		}

	},

	twitter: {

		parse: function(agent) {

			let engine  = null;
			let system  = 'desktop';
			let version = null;

			if (agent.includes('Twitterbot') === true) {
				engine = 'twitter';
			}

			if (agent.includes('Twitterbot/') === true) {
				version = parse_version('Twitterbot', agent);
			}

			if (engine !== null && system !== null && version !== null) {

				return {
					engine:  engine,
					system:  system,
					version: version
				};

			}

			return null;

		},

		render: function(data) {

			if (data.engine === 'twitter') {

				if (data.system === null) {
					data.system = 'desktop';
				}

				if (data.version === null) {
					data.version = randomize([ 1.0 ]);
				}

				return randomize([
					'Mozilla/5.0 (compatible; Twitterbot/' + data.version + ')',
					'Twitterbot/' + data.version
				]);

			}

			return null;

		}

	},

	yahoo: {

		parse: function(agent) {

			let engine  = null;
			let system  = 'desktop';
			let version = null;

			if (agent.includes('Yahoo! Slurp') === true) {
				engine = 'yahoo';
			} else if (agent.includes('YahooMailProxy') === true) {
				engine = 'yahoo';
			}

			if (agent.includes('Yahoo! Slurp/') === true) {
				version = parse_version('Yahoo! Slurp', agent);
			} else if (agent.includes('Yahoo! Slurp;') === true) {
				version = '3.0';
			} else if (agent.includes('YahooMailProxy;') === true) {
				version = '3.0';
			}

			if (engine !== null && system !== null && version !== null) {

				return {
					engine:  engine,
					system:  system,
					version: version
				};

			}

			return null;

		},

		render: function(data) {

			if (data.engine === 'yahoo') {

				if (data.system === null) {
					data.system = 'desktop';
				}

				if (data.version === null) {
					data.version = randomize([ 3.0 ]);
				}

				return randomize([
					'Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)',
					'Mozilla/5.0 (compatible; Yahoo! Slurp/' + data.version + '; http://help.yahoo.com/help/us/ysearch/slurp)',
					'YahooMailProxy; https://help.yahoo.com/kb/yahoo-mail-proxy-SLN28749.html'
				]);

			}

			return null;

		}

	},

	yandex: {

		parse: function(agent) {

			let engine  = null;
			let system  = 'desktop';
			let version = null;

			if (agent.includes('YandexBot') === true || agent.includes('YaBrowser') === true) {
				engine = 'yandex';
			}

			if (agent.includes('YandexBot/') === true) {
				version = parse_version('YandexBot', agent);
			} else if (agent.includes('YaBrowser/') === true) {
				version = parse_version('YaBrowser', agent);
			}

			if (engine !== null && system !== null && version !== null) {

				return {
					engine:  engine,
					system:  system,
					version: version
				};

			}

			return null;

		},

		render: function(data) {

			if (data.engine === 'yandex') {

				if (data.system === null) {
					data.system = 'desktop';
				}

				if (data.version === null) {
					data.version = randomize([ 3.0, 17.1, 17.3, 17.6, 18.3 ]);
				}

				if (data.version === '3.0') {

					return randomize([
						'Mozilla/5.0 (compatible; YandexBot/' + data.version + '; +http://yandex.com/bots)',
						'Mozilla/5.0 (compatible; YandexBot/' + data.version + '; MirrorDetector; +http://yandex.com/bots)'
					]);

				} else if (data.version === '17.1') {
					return 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 YaBrowser/17.1.0.2034 Yowser/2.5 Safari/537.36';
				} else if (data.version === '17.3') {
					return 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 YaBrowser/17.3.1.840 Yowser/2.5 Safari/537.36';
				} else if (data.version === '17.6') {
					return 'Mozilla/5.0 (Windows NT 6.3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 YaBrowser/17.6.1.749 Yowser/2.5 Safari/537.36';
				} else if (data.version === '18.3') {
					return 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 YaBrowser/18.3.1.1232 Yowser/2.5 Safari/537.36';
				}

			}

			return null;

		}

	}

};



const UA = {

	compare: function(a, b) {

		let is_ua_a = UA.isUA(a) === true;
		let is_ua_b = UA.isUA(b) === true;

		if (is_ua_a === true && is_ua_b === true) {

			if (a.platform === 'browser' && b.platform === 'spider') return -1;
			if (b.platform === 'browser' && a.platform === 'spider') return 1;

			if (a.system === 'desktop' && b.system === 'mobile') return -1;
			if (b.system === 'desktop' && a.system === 'mobile') return 1;

			if (a.engine < b.engine) return -1;
			if (b.engine < a.engine) return 1;

			let a_ver = parseFloat(a.version);
			let b_ver = parseFloat(b.version);

			if (Number.isNaN(a_ver) === false && Number.isNaN(b_ver) === false) {

				if (a_ver < b_ver) return -1;
				if (b_ver < a_ver) return 1;

			}

			return 0;

		} else if (is_ua_a === true) {
			return -1;
		} else if (is_ua_b === true) {
			return 1;
		}


		return 0;

	},

	isUA: function(payload) {

		payload = isObject(payload) ? payload : null;


		if (payload !== null) {

			let engine   = payload.engine   || null;
			let platform = payload.platform || null;
			let system   = payload.system   || null;
			let version  = payload.version  || null;

			if (platform === 'browser') {

				let browser = BROWSER[engine] || null;
				if (browser !== null) {

					if (
						(system === 'desktop' || system === 'mobile')
						&& isString(version) === true
					) {
						return true;
					}

				}

			} else if (platform === 'spider') {

				let spider = SPIDER[engine] || null;
				if (spider !== null) {

					if (
						(system === 'desktop' || system === 'mobile')
						&& isString(version) === true
					) {
						return true;
					}

				}

			}

		}


		return false;

	},

	parse: function(agent) {

		agent = isString(agent) ? agent : null;


		let engine   = null;
		let platform = null;
		let system   = null;
		let version  = null;

		if (agent !== null) {

			if (platform === null) {

				for (let eng in SPIDER) {

					let browser = SPIDER[eng];
					let ref     = browser.parse(agent);
					if (ref !== null) {
						engine   = ref.engine;
						platform = 'spider';
						system   = ref.system;
						version  = ref.version;
						break;
					}

				}

			}

			if (platform === null) {

				for (let eng in BROWSER) {

					let browser = BROWSER[eng];
					let ref     = browser.parse(agent);
					if (ref !== null) {
						engine   = ref.engine;
						platform = 'browser';
						system   = ref.system;
						version  = ref.version;
						break;
					}

				}

			}

		}


		return {
			engine:   engine,
			platform: platform,
			system:   system,
			version:  version
		};

	},

	render: function(ua) {

		ua = isObject(ua) ? ua : null;


		if (ua !== null) {

			let useragent = null;
			let data      = Object.assign({
				engine:   null,
				platform: null,
				system:   null,
				version:  null
			}, ua);


			if (data.platform === null) {

				if (data.engine !== null) {

					if (Object.keys(BROWSER).includes(data.engine) === true) {
						data.platform = 'browser';
					} else if (Object.keys(SPIDER).includes(data.engine) === true) {
						data.platform = 'spider';
					}

				} else {
					data.platform = randomize([ 'browser', 'spider' ]);
				}

			}


			if (data.platform === 'browser') {

				if (data.engine === null) {
					data.engine = randomize(Object.keys(BROWSER));
				}

				for (let engine in BROWSER) {

					let browser = BROWSER[engine];
					let agent   = browser.render(data);
					if (agent !== null) {
						useragent = agent;
						break;
					}

				}

			} else if (data.platform === 'spider') {

				if (data.engine === null) {
					data.engine = randomize(Object.keys(SPIDER));
				}

				for (let engine in SPIDER) {

					let spider = SPIDER[engine];
					let agent  = spider.render(data);
					if (agent !== null) {
						useragent = agent;
						break;
					}

				}

			}

			return useragent;

		}


		return null;

	},

	sort: function(array) {

		array = isArray(array) ? array : null;


		if (array !== null) {

			return array.filter((ua) => {
				return UA.isUA(ua) === true;
			}).sort((a, b) => {
				return UA.compare(a, b);
			});

		}


		return [];

	}

};


export { UA };

