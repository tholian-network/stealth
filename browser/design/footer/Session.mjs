
import { Element } from '../Element.mjs';


const TEMPLATE = `
<article>
	<h3>Sessions</h3>
	<div></div>
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
				<td colspan="4">No Requests</td>
			</tr>
		</tbody>
	</table>
</article>
`;

const render_choice = (session, active) => `
<div>
	<input id="browser-session-choice-${session.domain}" name="browser-session-choice" type="radio" value="${session.domain}" ${active === true ? 'checked' : ''}>
	<label for="browser-session-choice-${session.domain}">${session.domain} (${session.agent.engine} ${session.agent.version} on ${session.agent.system})</label>
</div>
`;


const TEMPLATE_SESSION = (sessions, session) => `
<article>
	<h3>Sessions</h3>
	${sessions.map((session) => '<input type="radio" name="browser-sessions-choice" value="' + session.domain + '">').join('')}
</article>
<article>
	<h3>Requests for Session ${session.domain}</h3>
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

	this.element  = Element.from('browser-session', TEMPLATE);
	this.choices  = this.element.query('article div');
	this.requests = this.element.query('article table tbody');
	this.session  = null;
	this.sessions = [];


	console.log(this);

	this.element.on('contextmenu', (e) => {
		e.preventDefault();
		e.stopPropagation();
	});

	this.element.on('show', () => {

		let service = browser.client.services.session || null;
		if (service !== null) {

			service.read({}, (session) => {

				service.query({
					domain: '*'
				}, (sessions) => {

					// Make sure reference is to same Array
					session = sessions.find((s) => s.domain === session.domain) || null;

					this.session  = session.domain;
					this.sessions = sessions;

					this.choices.value(sessions.map((s) => render_choice(s, s.domain === this.session)));

					// TODO: click/change listener
					// this.choices.query('input').forEach((input) => {
					// console.log(input);
					// });


					console.info(session);
					console.warn(sessions);

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

