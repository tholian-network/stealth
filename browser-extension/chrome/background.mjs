

// function setProxyIcon() {
//
//     var icon = {
//         path: "design/other/popup-128x128.png",
//     }
//
//     chrome.proxy.settings.get(
//                 {'incognito': false},
//         function(config) {
//             if (config["value"]["mode"] == "system") {
//                 chrome.browserAction.setIcon(icon);
//             } else if (config["value"]["mode"] == "direct") {
//                 chrome.browserAction.setIcon(icon);
//             } else {
//                 icon["path"] = "images/on.png";
//                 chrome.browserAction.setIcon(icon);
//             }
//         }
//     );
// }
//
// var proxySetting = {
//     'pac_script_url' : {'http': '', 'https': '', 'file' : ''},
//     'pac_type'   : 'file://',
//     'http_host'  : '',
//     'http_port'  : '',
//     'https_host' : '',
//     'https_port' : '',
//     'socks_host' : '',
//     'socks_port' : '',
//     'socks_type' : 'socks5',
//     'bypasslist' : '<local>,192.168.0.0/16,172.16.0.0/12,169.254.0.0/16,10.0.0.0/8',
//     'proxy_rule' : 'singleProxy',
//     'internal'   : '',
//     'auth'       : {'enable': '', 'user': '', 'pass': ''}
// }
//
// var chinaList = ['*.cn'];
//
// chrome.storage.sync.get('proxySetting', function(val) {
//     if (typeof val.proxySetting !== "undefined")
//         localStorage.proxySetting = val.proxySetting;
// });
//
// chrome.proxy.onProxyError.addListener(function(details) {
//     console.log("fatal: ", details.fatal);
//     console.log("error: ", details.error);
//     console.log("details: ", details.details)
// });
//
// setProxyIcon();






const view_page = (url) => {

	let ref = chrome.extension.getURL(url);

	chrome.tabs.query({}, (tabs) => {

		let tab = tabs.find((t) => t.url === ref) || null;
		if (tab !== null) {
			chrome.tabs.reload(tab.id);
		} else {
			chrome.tabs.getSelected(null, (tab) => {
				chrome.tabs.create({
					url:   url,
					index: tab.index + 1
				});
			});
		}

	});

};

(function(chrome) {

	chrome.browserAction.setIcon({
		path: 'design/other/popup-128x128.png'
	});

	chrome.commands.onCommand.addListener((cmd) => {

		console.log(cmd);

		if (cmd === 'open-options') {
			view_page('chrome/options.html');
		}

	});

	chrome.runtime.onInstalled.addListener((event) => {

		if (event.reason === 'install') {
			view_page('chrome/options.html');
		}

	});

})(chrome);

