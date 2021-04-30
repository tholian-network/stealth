#!/usr/bin/env gjs

imports.gi.versions.GLib    = '2.0';
imports.gi.versions.Gtk     = '3.0';
imports.gi.versions.WebKit2 = '4.0';

const GLib   = imports.gi.GLib;
const Gtk    = imports.gi.Gtk;
const WebKit = imports.gi.WebKit2;



const FLAGS = (function() {

	let flags = {
		'app':           'http://localhost:65432',
		'user-data-dir': '/tmp/browser-gjs'
	};

	Array.from(ARGV).forEach((arg) => {

		let tmp1 = arg.trim();
		if (tmp1.startsWith('--')) {

			tmp1 = tmp1.substr(2);

			if (tmp1.includes('=')) {

				let key = tmp1.split('=')[0].trim();
				let val = tmp1.split('=').slice(1).join('=').trim();

				let num = parseInt(val, 10);
				if (!isNaN(num) && (num).toString() === val) {
					val = num;
				}

				if (val === 'true')  val = true;
				if (val === 'false') val = false;
				if (val === 'null')  val = null;

				flags[key] = val;

			}

		}

	});

	return flags;

})();

const remove = function(path) {

	path = typeof path === 'string' ? path : null;


	if (path !== null) {

		let tmp = path.split('/').slice(0, -1);
		let cwd = tmp.join('/');
		if (tmp.length >= 2) {

			try {
				GLib.spawn_sync(cwd, [ '/usr/bin/rm', '-rf', path ], null, GLib.SpawnFlags.DEFAULT, () => {});
			} catch (err) {
				// Do nothing
			}

		}

	}

};


Gtk.init(null);


const webdata    = new WebKit.WebsiteDataManager({
	base_cache_directory: FLAGS['user-data-dir'],
	base_data_directory:  FLAGS['user-data-dir']
});
const webcontext = new WebKit.WebContext({ website_data_manager: webdata });
const webview    = new WebKit.WebView({ web_context: webcontext });
const settings   = new WebKit.Settings();
const inspector  = webview.get_inspector();
const window     = new Gtk.Window({ title: 'Stealth' });


window.connect('destroy', () => {

	let data = webview.get_website_data_manager();
	if (data !== null) {

		let folder1 = data.get_disk_cache_directory();
		let folder2 = data.get_indexeddb_directory();
		let folder3 = data.get_local_storage_directory();
		let folder4 = data.get_websql_directory();

		if (folder1 !== null) remove(folder1);
		if (folder2 !== null) remove(folder2);
		if (folder3 !== null) remove(folder3);
		if (folder4 !== null) remove(folder4);

	}

	Gtk.main_quit();

});


settings.set_property('allow-file-access-from-file-urls',      false);
settings.set_property('allow-universal-access-from-file-urls', false);

settings.set_property('allow-modal-dialogs',        false);
settings.set_property('enable-developer-extras',    true);
settings.set_property('enable-fullscreen',          true);
settings.set_property('enable-html5-database',      false);
settings.set_property('enable-html5-local-storage', false);
settings.set_property('enable-javascript',          true);
settings.set_property('enable-page-cache',          false);
settings.set_property('enable-plugins',             false);
settings.set_property('enable-java',                false);
settings.set_property('enable-smooth-scrolling',    true);

webview.set_settings(settings);
webview.load_uri(FLAGS['app']);
inspector.attach();
inspector.show();


window.add(webview);
window.set_size_request(800, 600);
window.show_all();

Gtk.main();

