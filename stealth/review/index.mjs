
import Browser                  from './Browser.mjs';
import Client                   from './Client.mjs';
import Download                 from './Download.mjs';
import MODULE                   from './MODULE.mjs';
import Request                  from './Request.mjs';
import Server                   from './Server.mjs';
import Session                  from './Session.mjs';
import Settings                 from './Settings.mjs';
import Stealth                  from './Stealth.mjs';
import Tab                      from './Tab.mjs';
import client_service_Beacon    from './client/service/Beacon.mjs';
import client_service_Blocker   from './client/service/Blocker.mjs';
import client_service_Cache     from './client/service/Cache.mjs';
import client_service_Host      from './client/service/Host.mjs';
import client_service_Mode      from './client/service/Mode.mjs';
import client_service_Peer      from './client/service/Peer.mjs';
import client_service_Policy    from './client/service/Policy.mjs';
import client_service_Redirect  from './client/service/Redirect.mjs';
import client_service_Session   from './client/service/Session.mjs';
import client_service_Settings  from './client/service/Settings.mjs';
import connection_DNS           from './connection/DNS.mjs';
import connection_DNSH          from './connection/DNSH.mjs';
import connection_DNSS          from './connection/DNSS.mjs';
import connection_HTTP          from './connection/HTTP.mjs';
import connection_HTTPS         from './connection/HTTPS.mjs';
import connection_MDNS          from './connection/MDNS.mjs';
import connection_SOCKS         from './connection/SOCKS.mjs';
import connection_WS            from './connection/WS.mjs';
import connection_WSS           from './connection/WSS.mjs';
// import optimizer_CSS            from './optimizer/CSS.mjs';
import parser_CSS               from './parser/CSS.mjs';
import parser_DATETIME          from './parser/DATETIME.mjs';
import parser_HOSTS             from './parser/HOSTS.mjs';
import parser_IP                from './parser/IP.mjs';
import parser_UA                from './parser/UA.mjs';
import parser_URL               from './parser/URL.mjs';
import peer_Cache               from './peer/Cache.mjs';
import request_Unicode          from './request/Unicode.mjs';
// import server_RESOLVER  from './server/RESOLVER.mjs';
import server_Webproxy          from './server/Webproxy.mjs';
import server_Webserver         from './server/Webserver.mjs';
import server_service_Beacon    from './server/service/Beacon.mjs';
import server_service_Blocker   from './server/service/Blocker.mjs';
import server_service_Cache     from './server/service/Cache.mjs';
import server_service_Host      from './server/service/Host.mjs';
import server_service_Mode      from './server/service/Mode.mjs';
import server_service_Peer      from './server/service/Peer.mjs';
import server_service_Policy    from './server/service/Policy.mjs';
import server_service_Redirect  from './server/service/Redirect.mjs';
import server_service_Session   from './server/service/Session.mjs';
import server_service_Settings  from './server/service/Settings.mjs';



export const REVIEWS = [

	MODULE,

	// Parsers
	parser_CSS,
	parser_DATETIME,
	parser_HOSTS,
	parser_IP,
	parser_UA,
	parser_URL,

	// Optimizers
	// optimizer_CSS,

	// Network
	connection_DNS,
	connection_DNSH,
	connection_DNSS,
	connection_MDNS,

	connection_HTTP,
	connection_HTTPS,
	connection_SOCKS,
	connection_WS,
	connection_WSS,

	// Requests
	Download,
	Request,
	request_Unicode,

	// Stealth
	Session,
	Settings,
	Stealth,
	Client,
	Server,
	Tab,
	Browser,

	// Stealth Server
	// server_Proxy,
	// server_Router,
	// server_Services,
	server_Webproxy,
	server_Webserver,

	// Server Services
	server_service_Beacon,
	server_service_Blocker,
	server_service_Cache,
	server_service_Host,
	server_service_Mode,
	server_service_Peer,
	server_service_Policy,
	server_service_Redirect,
	server_service_Session,
	server_service_Settings,

	// Client Services
	client_service_Beacon,
	client_service_Blocker,
	client_service_Cache,
	client_service_Host,
	client_service_Mode,
	client_service_Peer,
	client_service_Policy,
	client_service_Redirect,
	client_service_Session,
	client_service_Settings,

	// Peer-to-Peer
	peer_Cache

];

export const SOURCES = {

	'stealth/ENVIRONMENT': null

};

