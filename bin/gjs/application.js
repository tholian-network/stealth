#!/usr/bin/env gjs

imports.gi.versions.GLib    = '2.0';
imports.gi.versions.Gtk     = '3.0';
imports.gi.versions.WebKit2 = '4.0';


const GLib   = imports.gi.GLib;
const Gtk    = imports.gi.Gtk;
const WebKit = imports.gi.WebKit2;
const rmdir  = function(path) {

	path = typeof path === 'string' ? path : null;


	if (path !== null) {

		let tmp = path.split('/').slice(0, -1);
		let cwd = tmp.join('/');
		if (tmp.length >= 2) {

			try {
				GLib.spawn_sync(cwd, [ "/usr/bin/rm", "-rf", path ], null, GLib.SpawnFlags.DEFAULT, () => {});
			} catch (err) {
			}

		}

	}

};


Gtk.init(null);


const settings  = new WebKit.Settings();
const webview   = new WebKit.WebView();
const inspector = webview.get_inspector();
const window    = new Gtk.Window({ title: 'Stealth' });


window.connect('destroy', () => {

	let data = webview.get_website_data_manager();
	if (data !== null) {

		let folder1 = data.get_disk_cache_directory();
		let folder2 = data.get_indexeddb_directory();
		let folder3 = data.get_local_storage_directory();
		let folder4 = data.get_websql_directory();

		if (folder1 !== null) rmdir(folder1);
		if (folder2 !== null) rmdir(folder2);
		if (folder3 !== null) rmdir(folder3);
		if (folder4 !== null) rmdir(folder4);

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
settings.set_property('enable-plugins',             false);
settings.set_property('enable-java',                false);
settings.set_property('enable-smooth-scrolling',    true);

webview.set_settings(settings);
webview.load_uri('http://localhost:65432/browser/index.html');

window.add(webview);
window.set_size_request(640, 480);
window.show_all();

Gtk.main();

