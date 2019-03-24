
import { REFERENCE, extract, init, insert, listen, render, reset } from './internal.mjs';



const elements = {
	wizard:  document.querySelector('#fix-filter'),
	filter:  document.querySelector('#fix-filter table tfoot'),
	filters: document.querySelector('#fix-filter table tbody'),
	add:     {
		url:       document.querySelector('#add-filter-url'),
		assistant: document.querySelector('#add-filter-assistant')
	}
};



const _sort_by_domain_and_filter = (a, b) => {

	let a_domains = a.domain.split('.').reverse();
	let b_domains = b.domain.split('.').reverse();

	let max = Math.max(a_domains.length, b_domains.length);

	for (let d = 0; d < max; d++) {

		let a_domain = a_domains[d] || null;
		let b_domain = b_domains[d] || null;

		if (a_domain === null) {

			if (b_domain === null) {
				return 0;
			} else {
				return -1;
			}

		} else if (b_domain === null) {
			return 1;
		}

		if (a_domain > b_domain) return  1;
		if (b_domain > a_domain) return -1;

	}


	let a_prefix = a.filter.prefix || '';
	let b_prefix = b.filter.prefix || '';
	if (a_prefix > b_prefix) return  1;
	if (b_prefix > a_prefix) return -1;

	let a_midfix = a.filter.midfix || '';
	let b_midfix = b.filter.midfix || '';
	if (a_midfix > b_midfix) return  1;
	if (b_midfix > a_midfix) return -1;

	let a_suffix = a.filter.suffix || '';
	let b_suffix = b.filter.suffix || '';
	if (a_suffix > b_suffix) return  1;
	if (b_suffix > a_suffix) return -1;


	return 0;

};

const _on_update = function(filters) {
	elements.filters.innerHTML = filters.sort(_sort_by_domain_and_filter).map((filter) => render('filter', filter, [ 'remove' ])).join('');
};

let _CHOICE_ID = 0;

const _render_choice = function(domain, prefix, midfix, suffix) {

	prefix = typeof prefix === 'string' ? prefix : null;
	midfix = typeof midfix === 'string' ? midfix : null;
	suffix = typeof suffix === 'string' ? suffix : null;


	let id  = 'add-filter-assistant-choice-' + _CHOICE_ID++;
	let str = [];

	str.push('<div>');

	let tmp1 = '<input id="' + id + '" name="add-filter-assistant-choice" type="radio"';
	tmp1    += ' data-key="filter" data-val="';
	tmp1    += (prefix !== null ? prefix : 'null') + ':';
	tmp1    += (midfix !== null ? midfix : 'null') + ':';
	tmp1    += (suffix !== null ? suffix : 'null');
	tmp1    += '">';
	str.push(tmp1);

	let tmp2 = '<label for="' + id + '">';
	let tmp3 = [
		prefix !== null ? ('start with <code>' + prefix + '</code>') : null,
		midfix !== null ? ('include <code>' + midfix + '</code>') : null,
		suffix !== null ? ('end with <code>' + suffix + '</code>') : null
	].filter((v) => v !== null);
	tmp2 += 'Allow URLs that ' + tmp3.join(' and ') + '.';
	tmp2 += '</label>';
	str.push(tmp2);

	str.push('</div>');

	return str.join('\n');

};

const _render_assistant = function(ref) {

	let choices = [];

	let domain = ref.domain;
	if (domain !== null) {

		if (ref.subdomain !== null) {
			domain = ref.subdomain + '.' + ref.domain;
		}

		if (ref.path !== '/') {

			let folders  = ref.path.split('/').filter((v) => v !== '');
			let file     = folders.pop();

			choices.push(_render_choice(domain, '/' + folders.join('/'), null,              null));
			choices.push(_render_choice(domain, '/' + folders.join('/'), null,              file));
			choices.push('<hr>');
			choices.push(_render_choice(domain, null,                    folders.join('/'), null));
			choices.push(_render_choice(domain, null,                    folders.join('/'), file));
			choices.push('<hr>');
			choices.push(_render_choice(domain, null,                    null,              file));
			choices.push(_render_choice(domain, null,                    null,              folders.join('/') + '/' + file));

		}

	}

	return choices.join('\n');

};



init([
	elements.wizard,
	elements.filter,
	elements.filters
], (browser, result) => {

	let site_filters = [];

	if (result === true) {

		listen(elements.filters, (action, data, done) => {

			let service = browser.client.services.filter || null;
			if (service !== null) {

				if (action === 'remove') {

					service.remove(data, (result) => {

						if (result === true) {

							let cache = site_filters.find((f) => {
								return (
									f.domain === data.domain
									&& f.filter.prefix === data.filter.prefix
									&& f.filter.midfix === data.filter.midfix
									&& f.filter.suffix === data.filter.suffix
								);
							}) || null;

							if (cache !== null) {

								let index = site_filters.indexOf(cache);
								if (index !== -1) {
									site_filters.splice(index, 1);
								}

								_on_update(site_filters);

							}

						}

						done(result);

					});

				} else {
					done(false);
				}

			} else {
				done(false);
			}

		});


		if (REFERENCE.domain !== null) {

			if (elements.add.url !== null) {
				elements.add.url.innerHTML = REFERENCE.url;
			}

			if (elements.add.assistant !== null) {

				elements.add.assistant.innerHTML = _render_assistant(REFERENCE);

				Array.from(elements.add.assistant.querySelectorAll('input')).forEach((element) => {

					element.onclick = () => {

						let data = extract(element).filter || null;
						if (data !== null) {

							let domain = REFERENCE.domain;
							let filter = {};

							if (REFERENCE.subdomain !== null) {
								domain = REFERENCE.subdomain + '.' + REFERENCE.domain;
							}

							data.split(':').map((val) => {
								if (val === 'null') return null;
								return val;
							}).forEach((val, v) => {
								if (v === 0) filter.prefix = val;
								if (v === 1) filter.midfix = val;
								if (v === 2) filter.suffix = val;
							});

							reset(elements.filter);
							insert(elements.filter, {
								domain: domain,
								filter: filter
							});

						}

					};

				});

			}


			reset(elements.filter);
			listen(elements.filter, (action, data, done) => {

				let service = browser.client.services.filter || null;
				if (service !== null) {

					if (action === 'confirm') {

						let cache = site_filters.find((f) => {
							return (
								f.domain === data.domain
								&& f.filter.prefix === data.filter.prefix
								&& f.filter.midfix === data.filter.midfix
								&& f.filter.suffix === data.filter.suffix
							);
						}) || null;

						if (cache === null) {

							service.save(data, (result) => {

								if (result === true) {
									site_filters.push(data);
									_on_update(site_filters);
									reset(elements.filter);
								}

								done(result);

							});

						} else {
							done(false);
						}

					} else {
						done(false);
					}

				} else {
					done(false);
				}

			});


			browser.client.services.filter.query({
				domain:    REFERENCE.domain,
				subdomain: REFERENCE.subdomain,
				host:      REFERENCE.host
			}, (filters) => {

				filters.forEach((f) => site_filters.push(f));
				_on_update(site_filters);

			});

		}

	} else {

		let element = elements.wizard || null;
		if (element !== null) {
			element.parentNode.removeChild(element);
		}

	}

});

