
(function(global) {

	global.addEventListener('DOMContentLoaded', _ => {

		const doc   = global.document;
		const links = Array.from(doc.querySelectorAll('a'));


		if (links.length > 0) {

			links.forEach(link => {

				let url = link.getAttribute('href');
				if (url.startsWith('https://')) {
					url = '/stealth/' + url.split('/').slice(2).join('/');
				} else if (url.startsWith('http://')) {
					url = '/stealth/' + url.split('/').slice(2).join('/');
				} else if (url.includes('://')) {
					url = '/stealth/' + url.split('/').slice(2).join('/');
				} else if (url.startsWith('about:')) {

					let file  = url.split('?')[0].split(':')[1];
					let query = url.split('?')[1] || '';

					if (query !== '') {
						url = '/browser/about/' + file + '.html?' + query;
					} else {
						url = '/browser/about/' + file + '.html';
					}

				}

				link.setAttribute('href', url);

			});

		}

	}, true);

})(typeof window !== 'undefined' ? window : this);

