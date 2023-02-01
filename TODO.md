
# TODO

- `progress` event's payload is `null` probably due to packet parser.
- `response` event has wrong `@transfer` headers, these need to be fixed.
- Webproxy Review needs more tests for webview requests.


# Cache Service

- Cache needs meta information that contains a map of datetime, content-length,
  last-modified, etag for each URL.

- Cache is compressed or filtered on disk, which means that original file
  sizes have to be persisted to be compareable later; so the cache structure
  needs an additional `size` (amount of bytes) header.


# Session Service

- Tab open event
- Tab close event
- Tab navigate event
- Tab refresh event (creates a task with `type=refresh` event for current URL)


# `stealth:radar` Page

- Popular Sites and URLs
- Shareable Topics and Bookmarks/Subscribed Content

# `stealth:beacons` Page

- Adapters to extract content, available for `echoes` and its flow graph.
- Export and Synchronize assets per URL pattern (e.g. texts, audios, images and videos).

# `stealth:echoes` Page

- User Action Recording Wizard, which records `keyboard`, `mouse`, `click`,
  and `touch` events for automation.

# `stealth:tasks` Page

- Implementation of a task scheduling wizard that allows to schedule `beacon`
  and `echo` actions at specific repeating times and/or a single datetime.

- Tasks with type `request` and `scrape` should contain incremental checks to
  prevent unnecessary downloads. This means check of datetime, content-length, etag
  headers etc.

- Quality of proposal for shared tasks, the broader the options, the more likely
  to succeed. Higher quality of proposals lead to more peers adopting the tasks.

- Debate phase where different tasks and objectives are evaluated.
- Consensus: Same goal, different choices.
- Vote: Different goals, one choice each, usually mutually exclusive.

