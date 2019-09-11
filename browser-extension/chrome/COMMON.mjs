
export const HOSTS = {
	stealth: {
		host: '127.0.0.1',
		port: 65432
	},
	i2p: {
		host: '127.0.0.1',
		port: 4444
	},
	tor: {
		host: '127.0.0.1',
		port: 9050
	}
};

export const SETTINGS = {
	direct: {
		mode: 'direct'
	},
	stealth: {
		mode:      'pac_script',
		pacScript: {
			url: 'http://localhost:65432/proxy.pac'
		}
	},
	i2p: {
		mode:  'fixed_servers',
		rules: {
			singleProxy: {
				scheme: 'socks4',
				host:   '127.0.0.1',
				port:   4444
			}
		}
	},
	tor: {
		mode:  'fixed_servers',
		rules: {
			singleProxy: {
				scheme: 'socks4',
				host:   '127.0.0.1',
				port:   9050
			}
		}
	}
};

export const check = (proxy, callback) => {

	chrome.proxy.settings.get({
		incognito: false
	}, (config) => {

		chrome.proxy.settings.set({
			value: SETTINGS.direct,
			scope: 'regular'
		}, () => {

			fetch('http://' + proxy.host + ':' + proxy.port).then((response) => {
				return response.text();
			}).then(() => {
				callback(true);
			}).catch(() => {
				callback(false);
			});

			setTimeout(() => {

				chrome.proxy.settings.set({
					value: config.value,
					scope: 'regular'
				});

			}, 1000);

		});

	});

};

