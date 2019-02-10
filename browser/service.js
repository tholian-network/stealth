
self.addEventListener('install', event => {

	event.waitUntil(
		caches.open('v1:static').then(cache => cache.addAll([
			'index.html',
			'browser.mjs',
			'favicon.ico',
			'favicon.png',
			'manifest.json',
			'design/font/icon.woff',
			'design/font/index.css',
			'design/font/museo.woff',
			'design/font/museo-bold.woff',
			'design/header.css',
			'design/header.js',
			'design/main.css',
			'design/main.js',
			'design/navi.css',
			'design/navi.js',
			'design/site.css',
			'design/site.js',
			'internal/fix-host.html',
			'internal/fix-host.mjs',
			'internal/fix-request.html',
			'internal/fix-request.mjs',
			'internal/fix-site.html',
			'internal/fix-site.mjs',
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
			'source/parser/URL.mjs',
			'source/parser/IP.mjs',
			'source/service/Cache.mjs',
			'source/service/Filter.mjs',
			'source/service/Host.mjs',
			'source/service/Peer.mjs',
			'source/service/Settings.mjs',
			'source/service/Site.mjs'
		]).catch(err => {
			console.error(err);
		}))
	);

});

self.addEventListener('fetch', event => {

	event.respondWith(caches.match(event.request, {
		ignoreSearch: true
	}).then(response => {

		if (response !== undefined) {
			return response;
		} else {
			console.warn('Not cached: ' + event.request.url);
			return fetch(event.request);
		}

	}).catch(err => {
		console.error(err);
	}));
});

