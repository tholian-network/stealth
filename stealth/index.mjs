
import { Beacon   as client_service_Beacon   } from './source/client/service/Beacon.mjs';
import { Blocker  as client_service_Blocker  } from './source/client/service/Blocker.mjs';
import { Cache    as client_service_Cache    } from './source/client/service/Cache.mjs';
import { Host     as client_service_Host     } from './source/client/service/Host.mjs';
import { Mode     as client_service_Mode     } from './source/client/service/Mode.mjs';
import { Peer     as client_service_Peer     } from './source/client/service/Peer.mjs';
import { Policy   as client_service_Policy   } from './source/client/service/Policy.mjs';
import { Redirect as client_service_Redirect } from './source/client/service/Redirect.mjs';
import { Session  as client_service_Session  } from './source/client/service/Session.mjs';
import { Settings as client_service_Settings } from './source/client/service/Settings.mjs';

import { DNS   as connection_DNS   } from './source/connection/DNS.mjs';
import { DNSH  as connection_DNSH  } from './source/connection/DNSH.mjs';
import { DNSS  as connection_DNSS  } from './source/connection/DNSS.mjs';
import { HTTP  as connection_HTTP  } from './source/connection/HTTP.mjs';
import { HTTPS as connection_HTTPS } from './source/connection/HTTPS.mjs';
import { MDNS  as connection_MDNS  } from './source/connection/MDNS.mjs';
import { SOCKS as connection_SOCKS } from './source/connection/SOCKS.mjs';
import { WS    as connection_WS    } from './source/connection/WS.mjs';
import { WSS   as connection_WSS   } from './source/connection/WSS.mjs';

import { DNS   as packet_DNS   } from './source/packet/DNS.mjs';
import { HTTP  as packet_HTTP  } from './source/packet/HTTP.mjs';
import { SOCKS as packet_SOCKS } from './source/packet/SOCKS.mjs';
import { WS    as packet_WS    } from './source/packet/WS.mjs';

import { CSS      as parser_CSS      } from './source/parser/CSS.mjs';
import { DATETIME as parser_DATETIME } from './source/parser/DATETIME.mjs';
import { HOSTS    as parser_HOSTS    } from './source/parser/HOSTS.mjs';
import { HTML     as parser_HTML     } from './source/parser/HTML.mjs';
import { IP       as parser_IP       } from './source/parser/IP.mjs';
import { NET      as parser_NET      } from './source/parser/NET.mjs';
import { UA       as parser_UA       } from './source/parser/UA.mjs';
import { URL      as parser_URL      } from './source/parser/URL.mjs';

import { Peerer    as server_Peerer    } from './source/server/Peerer.mjs';
import { Proxy     as server_Proxy     } from './source/server/Proxy.mjs';
import { Router    as server_Router    } from './source/server/Router.mjs';
import { Services  as server_Services  } from './source/server/Services.mjs';
import { Webproxy  as server_Webproxy  } from './source/server/Webproxy.mjs';
import { Webserver as server_Webserver } from './source/server/Webserver.mjs';

import { Beacon   as server_service_Beacon   } from './source/server/service/Beacon.mjs';
import { Blocker  as server_service_Blocker  } from './source/server/service/Blocker.mjs';
import { Cache    as server_service_Cache    } from './source/server/service/Cache.mjs';
import { Host     as server_service_Host     } from './source/server/service/Host.mjs';
import { Mode     as server_service_Mode     } from './source/server/service/Mode.mjs';
import { Peer     as server_service_Peer     } from './source/server/service/Peer.mjs';
import { Policy   as server_service_Policy   } from './source/server/service/Policy.mjs';
import { Redirect as server_service_Redirect } from './source/server/service/Redirect.mjs';
import { Session  as server_service_Session  } from './source/server/service/Session.mjs';
import { Settings as server_service_Settings } from './source/server/service/Settings.mjs';

import { Browser, isBrowser, isMode  } from './source/Browser.mjs';
import { Client, isClient            } from './source/Client.mjs';
import { Download, isDownload        } from './source/Download.mjs';
import { ENVIRONMENT                 } from './source/ENVIRONMENT.mjs';
import { Request, isRequest          } from './source/Request.mjs';
import { Server, isServer            } from './source/Server.mjs';
import { Session, isSession          } from './source/Session.mjs';
import { Settings, isSettings        } from './source/Settings.mjs';
import { Stealth, isStealth, VERSION } from './source/Stealth.mjs';
import { Tab, isTab                  } from './source/Tab.mjs';



export default {

	client: {
		service: {
			Beacon:   client_service_Beacon,
			Blocker:  client_service_Blocker,
			Cache:    client_service_Cache,
			Host:     client_service_Host,
			Mode:     client_service_Mode,
			Peer:     client_service_Peer,
			Policy:   client_service_Policy,
			Redirect: client_service_Redirect,
			Session:  client_service_Session,
			Settings: client_service_Settings
		}
	},

	connection: {
		DNS:   connection_DNS,
		DNSH:  connection_DNSH,
		DNSS:  connection_DNSS,
		HTTP:  connection_HTTP,
		HTTPS: connection_HTTPS,
		MDNS:  connection_MDNS,
		SOCKS: connection_SOCKS,
		WS:    connection_WS,
		WSS:   connection_WSS
	},

	packet: {
		DNS:   packet_DNS,
		HTTP:  packet_HTTP,
		SOCKS: packet_SOCKS,
		WS:    packet_WS
	},

	parser: {
		CSS:      parser_CSS,
		DATETIME: parser_DATETIME,
		HOSTS:    parser_HOSTS,
		HTML:     parser_HTML,
		IP:       parser_IP,
		NET:      parser_NET,
		UA:       parser_UA,
		URL:      parser_URL
	},

	server: {

		Peerer:    server_Peerer,
		Proxy:     server_Proxy,
		Router:    server_Router,
		Services:  server_Services,
		Webproxy:  server_Webproxy,
		Webserver: server_Webserver,

		service: {
			Beacon:   server_service_Beacon,
			Blocker:  server_service_Blocker,
			Cache:    server_service_Cache,
			Host:     server_service_Host,
			Mode:     server_service_Mode,
			Peer:     server_service_Peer,
			Policy:   server_service_Policy,
			Redirect: server_service_Redirect,
			Session:  server_service_Session,
			Settings: server_service_Settings
		}

	},

	isBrowser:  isBrowser,
	isClient:   isClient,
	isDownload: isDownload,
	isMode:     isMode,
	isRequest:  isRequest,
	isServer:   isServer,
	isSession:  isSession,
	isSettings: isSettings,
	isStealth:  isStealth,
	isTab:      isTab,

	Browser:     Browser,
	Client:      Client,
	Download:    Download,
	ENVIRONMENT: ENVIRONMENT,
	Request:     Request,
	Server:      Server,
	Session:     Session,
	Settings:    Settings,
	Stealth:     Stealth,
	Tab:         Tab,

	VERSION:     VERSION

};

