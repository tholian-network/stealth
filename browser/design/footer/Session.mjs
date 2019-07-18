
import { Element } from '../Element.mjs';



const TEMPLATE = (sessions, session) => `
<article>
	<h3>Sessions</h3>
	${sessions.map((session) => '<input type="radio" name="browser-sessions-choice" value="' + session.id + '">').join('')}
</article>
<article>
	<h3>Requests for Session ${session.id}</h3>
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

		let service  = browser.client.services.session  || null;
		let settings = browser.client.services.settings || null;

		if (service !== null && settings !== null) {

			service.read({}, (session) => {

				console.log('session', session);

				settings.read({ sessions: true }, (data) => {

					console.log('sessions', data.sessions);

					let sessions = data.sessions || [];
					if (sessions.length > 0) {

						let other = sessions.find((s) => s.data.domain === session.domain) || null;
						if (other !== null) {

							console.log('correct?', other);

						} else {
							// TODO: No access to sessions
						}

					} else {

						// TODO: Render blank content for no session data!?

					}


					// TODO: Render session correctly
					// this.element.value(TEMPLATE(data.sessions, session));

				});


			});

		}

		this.element.state('active');

	});

	this.element.on('hide', () => {

		let settings = widgets.settings || null;
		if (settings !== null && settings.session !== null) {
			settings.session.state('');
		}

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

