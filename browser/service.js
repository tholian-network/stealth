
self.addEventListener('install', (event) => {

	event.waitUntil(
		caches.open('v1:static').then((cache) => cache.addAll([
			'browser.mjs',
			'index.html',
			'index.webmanifest',
			'favicon.ico',
			'favicon.png',
			'design/font/icon.woff',
			'design/font/index.css',
			'design/font/museo.woff',
			'design/font/museo-bold.woff',
			'design/font/vera-mono.woff',
			'design/header.css',
			'design/header.js',
			'design/edit.css',
			'design/edit.js',
			'design/main.css',
			'design/main.js',
			'design/navi.css',
			'design/navi.js',
			'design/site.css',
			'design/site.js',
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
			'source/client/Session.mjs',
			'source/client/Settings.mjs',
			'source/client/Stash.mjs',
			'source/parser/IP.mjs',
			'source/parser/URL.mjs'
		]).catch((err) => {
			console.error(err);
		}))
	);

});

self.addEventListener('fetch', (event) => {

	event.respondWith(caches.match(event.request, {
		ignoreSearch: true
	}).then((response) => {

		if (response !== undefined) {
			return response;
		} else {
			return fetch(event.request);
		}

	}).catch((err) => {
		console.error(err);
	}));

});

