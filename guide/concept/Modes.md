
# Site Modes

The `Site Modes` decide what type of content to load from a specific URL
and what to optimize in the loaded HTML content in regards to what is being
displayed and what not.


## Media Types

Media Types and their representations in Stealth are compliant with
[IANA Assignments](https://www.iana.org/assignments/media-types).

Media Types are represented by the `MIME Object` that is returned by the
[URL Parser](../../stealth/source/parser/URL.mjs)'s `parse(url)` method.

A typical `MIME` Object looks like this:

```json
{
	"ext":    "abw",
	"type":   "other",
	"binary": true,
	"format": "application/x-abiword"
}
```

The Definition of a `MIME` Object's `type` property influences the loading
behaviour (and is equivalent to the `Site Modes` menu bar in the Browser UI).

- `text` loads text files.
- `image` loads image files.
- `audio` loads audio files.
- `video` loads video files.
- `other` downloads files that cannot be rendered.

