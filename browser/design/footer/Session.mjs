
import { Element } from '../Element.mjs';



const TEMPLATE = (session) => `
<article>
	<h3>Session #${session.id}</h3>
</article>
<article>
	<h3>Requests</h3>
	<table>
		<thead>
			<tr>
				<th>URL</th>
				<th>Timeline</th>
				<th>State</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			<tr data-visible="true">
				<td data-key="url">https://cookie.engineer/index.html</td>
				<td>
					<button disabled data-key="timeline.init" data-val="true" title="25.05.2019 14:58"></button>
					<button disabled data-key="timeline.cache" data-val="true" title="25.05.2019 14:58"></button>
					<button disabled data-key="timeline.stash" data-val="false"></button>
					<button disabled data-key="timeline.block" data-val="false"></button>
					<button disabled data-key="timeline.mode" data-val="false"></button>
					<button disabled data-key="timeline.filter" data-val="false"></button>
					<button disabled data-key="timeline.connect" data-val="true" title="25.05.2019 14:59"></button>
					<button disabled data-key="timeline.download" data-val="true" title="25.05.2019 14:59"></button>
					<button disabled data-key="timeline.optimize" data-val="true" title="25.05.2019 14:59"></button>
				</td>
				<td><button disabled data-key="state" data-val="response"></button></td>
				<td>
					<button data-action="kill"></button>
				</td>
			</tr>
		</tbody>
	</table>
</article>
`;



const Session = function(browser, widgets) {

	this.element = Element.from('browser-session', TEMPLATE);


	this.element.on('contextmenu', (e) => {
		e.preventDefault();
		e.stopPropagation();
	});

	this.element.on('show', () => {

		let service = browser.client.services.session || null;
		if (service !== null) {

			service.read({}, (session) => {

				// TODO: Render session correctly
				this.element.value(TEMPLATE(session));

				console.log('session', session);

			});

		}

		this.element.state('active');

	});

	this.element.on('hide', () => {
		this.element.state('');
	});

};


Session.prototype = {

	emit: function(event, args) {
		this.element.emit(event, args);
	},

	erase: function(target) {
		this.element.erase(target);
	},

	render: function(target) {
		this.element.render(target);
	}

};


export { Session };

