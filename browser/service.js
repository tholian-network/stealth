
const VERSION = 'X0:2019-05';
const ASSETS  = [
	'index.html',
	'index.webmanifest',
	'design/content.css',
	'design/control.css',
	'design/control.mjs',
	'design/index.css',
	'design/index.mjs',
	'design/Element.mjs',
	'design/footer/Beacon.css',
	'design/footer/Beacon.mjs',
	'design/footer/Context.css',
	'design/footer/Context.mjs',
	'design/footer/Help.css',
	'design/footer/Help.mjs',
	'design/footer/Session.css',
	'design/footer/Session.mjs',
	'design/footer/Site.css',
	'design/footer/Site.mjs',
	'design/footer/Tabs.css',
	'design/footer/Tabs.mjs',
	'design/header/Address.css',
	'design/header/Address.mjs',
	'design/header/History.css',
	'design/header/History.mjs',
	'design/header/Mode.css',
	'design/header/Mode.mjs',
	'design/header/Settings.css',
	'design/header/Settings.mjs',
	'design/main/Webview.css',
	'design/main/Webview.mjs',
	'design/other/android-chrome-192x192.png',
	'design/other/android-chrome-256x256.png',
	'design/other/apple-touch-icon-120x120.png',
	'design/other/apple-touch-icon-152x152.png',
	'design/other/apple-touch-icon-180x180.png',
	'design/other/apple-touch-icon-60x60.png',
	'design/other/apple-touch-icon-76x76.png',
	'design/other/apple-touch-icon.png',
	'design/other/browserconfig.xml',
	'design/other/favicon-16x16.png',
	'design/other/favicon-32x32.png',
	'design/other/favicon.ico',
	'design/other/favicon.png',
	'design/other/icon.woff',
	'design/other/index.css',
	'design/other/mstile-150x150.png',
	'design/other/museo-bold.woff',
	'design/other/museo.woff',
	'design/other/safari-pinned-tab.svg',
	'design/other/vera-mono.woff',
	'internal/fix-filter.html',
	'internal/fix-filter.mjs',
	'internal/fix-host.html',
	'internal/fix-host.mjs',
	'internal/fix-mode.html',
	'internal/fix-mode.mjs',
	'internal/fix-request.html',
	'internal/fix-request.mjs',
	'internal/internal.css',
	'internal/internal.mjs',
	'internal/settings.html',
	'internal/settings.mjs',
	'internal/welcome.html',
	'source/console.mjs',
	'source/POLYFILLS.mjs',
	'source/Browser.mjs',
	'source/Client.mjs',
	'source/Emitter.mjs',
	'source/Tab.mjs',
	'source/client/Cache.mjs',
	'source/client/Filter.mjs',
	'source/client/Host.mjs',
	'source/client/Mode.mjs',
	'source/client/Peer.mjs',
	'source/client/Redirect.mjs',
	'source/client/Settings.mjs',
	'source/client/Stash.mjs',
	'source/parser/IP.mjs',
	'source/parser/URL.mjs'
];

const autofetch = (request) => {

	if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
		return null;
	} else {

		return fetch(request).then((response) => {

			let url = response.url || null;
			if (url !== null) {

				if (new URL(response.url).origin !== location.origin) {

					return response;

				} else {

					return caches.open(VERSION).then((cache) => {
						cache.put(request, response.clone());
						return response;
					});

				}

			} else {
				return response;
			}

		});

	}

};



self.addEventListener('activate', (event) => {

	event.waitUntil(caches.keys().then((keys) => {

		return Promise.all(keys.map((key) => {

			if (key !== VERSION) {
				return caches.delete(key);
			}

		}));

	}));

});

self.addEventListener('fetch', (event) => {

	event.respondWith(caches.open(VERSION).then((cache) => {

		return cache.match(event.request, {
			ignoreMethod: true,
			ignoreSearch: true
		}).then((response) => {

			if (response) {
				return response;
			} else {
				return autofetch(event.request);
			}

		});

	}));

});

self.addEventListener('install', (event) => {

	event.waitUntil(caches.open(VERSION).then((cache) => {

		return cache.addAll(ASSETS).catch((err) => {
			console.error(err);
		});

	}));

});

