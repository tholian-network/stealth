
# Stealth Browser

The Stealth Browser is a Browser User Interface that is
implemented using Web Technologies, so that it is possible
to change the Browser Engine (to render everything) without
problems.

Currently, there's only the `webview` implementation
available - which is using `nw.js`. But in a later age
of this infant project, there will probably be alternative
UIs available (e.g. a `webkit-gtk` or `qt-webkit` port).


## Installation and Usage

Quickstart:

- Install a Web Browser of your choice.

```bash
cd /path/to/stealth-browser;

bash ./bin/stealth.sh;

# Open in web browser
gio open http://localhost:65432;
```

