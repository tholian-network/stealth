
# Features


## CSS Features

Currently, the [CSS Parser](./stealth/source/parser/CSS.mjs) tries to achieve maximum
compatibility with the CSS 3 specification, as long as features don't compromise
privacy or security of the client system.

Additionally, these CSS features are not implemented:

- [ ] `@counter-style` is unsupported.
- [ ] comma-separated `background` syntax is unsupported.
- [ ] `border-block`, `border-image`, `border-inline` are unsupported.
- [ ] `clip`, `clip-path` are unsupported.
- [ ] `grid`, `grid-area`, `grid-column`, `grid-row`, `grid-template` are unsupported.
- [ ] `offset` is unsupported.
- [ ] `text-indent` supports no trailing `each-line` and neither `hanging`.
- [ ] `transition-timing-function` steps are unsupported.


