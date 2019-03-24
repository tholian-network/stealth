
import QtQuick.Controls 1.4
import QtWebView 1.1

ApplicationWindow {
	width:   800
	height:  600
	title:   "Stealth"
	visible: true

	WebView {
		id:           webview
		anchors.fill: parent
		url:          "http://localhost:65432/browser/index.html"
	}
}

