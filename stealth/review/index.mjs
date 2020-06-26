
import Browser            from './Browser.mjs';
import Client             from './Client.mjs';
import MODULE             from './MODULE.mjs';
import Request            from './Request.mjs';
import Server             from './Server.mjs';
import Session            from './Session.mjs';
import Settings           from './Settings.mjs';
import Stealth            from './Stealth.mjs';
import Tab                from './Tab.mjs';
import client_Beacon      from './client/Beacon.mjs';
import client_Blocker     from './client/Blocker.mjs';
import client_Cache       from './client/Cache.mjs';
import client_Host        from './client/Host.mjs';
import client_Mode        from './client/Mode.mjs';
import client_Peer        from './client/Peer.mjs';
import client_Redirect    from './client/Redirect.mjs';
import client_Session     from './client/Session.mjs';
import client_Settings    from './client/Settings.mjs';
import client_Stash       from './client/Stash.mjs';
import optimizer_CSS      from './optimizer/CSS.mjs';
import other_ERROR        from './other/ERROR.mjs';
import other_FILE         from './other/FILE.mjs';
import other_PAC          from './other/PAC.mjs';
import other_REDIRECT     from './other/REDIRECT.mjs';
import other_ROUTER       from './other/ROUTER.mjs';
import parser_CSS         from './parser/CSS.mjs';
import parser_HOSTS       from './parser/HOSTS.mjs';
import parser_IP          from './parser/IP.mjs';
import parser_UA          from './parser/UA.mjs';
import parser_URL         from './parser/URL.mjs';
import peer_Cache         from './peer/Cache.mjs';
import protocol_DNS       from './protocol/DNS.mjs';
import protocol_HTTP      from './protocol/HTTP.mjs';
import protocol_HTTPS     from './protocol/HTTPS.mjs';
import protocol_SOCKS     from './protocol/SOCKS.mjs';
import protocol_WS        from './protocol/WS.mjs';
import protocol_WSS       from './protocol/WSS.mjs';
import request_Downloader from './request/Downloader.mjs';
import request_Optimizer  from './request/Optimizer.mjs';
import server_Beacon      from './server/Beacon.mjs';
import server_Blocker     from './server/Blocker.mjs';
import server_Cache       from './server/Cache.mjs';
import server_Host        from './server/Host.mjs';
import server_Mode        from './server/Mode.mjs';
import server_Peer        from './server/Peer.mjs';
import server_Redirect    from './server/Redirect.mjs';
import server_Session     from './server/Session.mjs';
import server_Settings    from './server/Settings.mjs';
import server_Stash       from './server/Stash.mjs';



export default {

	reviews: [

		MODULE,

		// Parsers
		parser_CSS,
		parser_HOSTS,
		parser_IP,
		parser_UA,
		parser_URL,

		// Server Modules
		other_ERROR,
		other_FILE,
		other_PAC,
		other_REDIRECT,
		other_ROUTER,

		// Optimizers
		optimizer_CSS,

		// Network Protocols
		protocol_DNS,
		protocol_HTTP,
		protocol_HTTPS,
		protocol_SOCKS,
		protocol_WS,
		protocol_WSS,

		// Requests
		Request,
		request_Downloader,
		request_Optimizer,

		// Stealth
		Session,
		Settings,
		Stealth,
		Client,
		Server,
		Tab,
		Browser,

		// Network Services
		server_Beacon,
		server_Blocker,
		server_Cache,
		server_Host,
		server_Mode,
		server_Peer,
		server_Redirect,
		server_Session,
		server_Settings,
		server_Stash,

		client_Beacon,
		client_Blocker,
		client_Cache,
		client_Host,
		client_Mode,
		client_Peer,
		client_Redirect,
		client_Session,
		client_Settings,
		client_Stash,

		// Peer-to-Peer
		peer_Cache

	],

	sources: {

		// Ignore
		'ENVIRONMENT':          null,
		'parser/CSS/NORMAL':    null,
		'parser/CSS/SHORTHAND': null

	}

};

