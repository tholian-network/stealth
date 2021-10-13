
# Parser

This file documents specific Parser quirks and how the implementations might differ
from the specifications.


## HTML Parser

TODO: Document HTML Parser


## CSS Parser

Currently, the [CSS Parser](../../stealth/source/parser/CSS.mjs) tries to achieve
maximum compatibility with the CSS 3 specification, as long as features don't
compromise privacy or security of the client system.

As the implementation of CSS comes with high risk of exploitation of its features,
some features were dropped on purpose in their implementations because they were
abused in the past with already published proof of concepts or cases in the past.

Here's the cumulative list of CSS features that Stealth does not support:


### Unimplemented CSS Features

| FEATURE                     | REASON                                      |
|:--------------------------- |:------------------------------------------- |
| @counter-style              | specification unclear                       |
| background                  | `,` separated syntax unsupported            |
| border-block                |                                             |
| border-image                |                                             |
| border-inline               |                                             |
| box-decoration-break        | accessibility concerns                      |
| box-shadow                  | accessibility concerns                      |
| clip                        | accessibility concerns                      |
| clip-path                   | accessibility concerns                      |
| counter-increment           |                                             |
| counter-reset               |                                             |
| counter-set                 |                                             |
| cursor                      | `<url>` syntax unsupported                  |
| filter                      | accessibility concerns                      |
| grid                        |                                             |
| grid-area                   |                                             |
| grid-column                 |                                             |
| grid-row                    |                                             |
| grid-template               |                                             |
| font-variant                | specification unclear                       |
| isolation                   | accessibility concerns                      |
| min-block-size              | specification unclear                       |
| mix-blend-mode              | accessibility concerns                      |
| offset                      | too complex: requires SVG path parser       |
| pointer-events              | accessibility concerns                      |
| shape-image-threshold       | accessibility concerns                      |
| shape-margin                | accessibility concerns                      |
| shape-outside               | accessibility concerns                      |
| scroll-margin-block         | accessibility concerns                      |
| scroll-margin-block-end     | accessibility concerns                      |
| scroll-margin-block-start   | accessibility concerns                      |
| scroll-margin-inline        | accessibility concerns                      |
| scroll-margin-inline-end    | accessibility concerns                      |
| scroll-margin-inline-start  | accessibility concerns                      |
| scroll-padding-block        | accessibility concerns                      |
| scroll-padding-block-end    | accessibility concerns                      |
| scroll-padding-block-start  | accessibility concerns                      |
| scroll-padding-inline       | accessibility concerns                      |
| scroll-padding-inline-end   | accessibility concerns                      |
| scroll-padding-inline-start | accessibility concerns                      |
| scroll-snap-align           | two-value syntax unsupported                |
| text-combine-upright        |                                             |
| text-underline-position     | accessibility concerns                      |
| text-indent                 | `each-line` or `hanging` suffix unsupported |
| text-overflow               | two-value syntax unsupported                |
| text-shadow                 | accessibility concerns                      |
| touch-action                | accessibility concerns                      |
| transition-timing-function  | `<step>` syntax unsupported                 |
| user-zoom                   | accessibility concerns                      |


### Unsupported CSS Features

These CSS features are currently unsupported because the Browser Engine(s) Stealth
is using are not supporting them, therefore we currently can't do anything about it.

These features will probably arrive in Stealth once the specification is ready in
either an upgrade mechanism or in their pure forms.

| FEATURE                     | REASON                                      |
|:--------------------------- |:------------------------------------------- |
| inset-block                 | specification unclear                       |
| inset-block-end             | specification unclear                       |
| inset-block-start           | specification unclear                       |
| inset-inline                | specification unclear                       |
| inset-inline-end            | specification unclear                       |
| inset-inline-start          | specification unclear                       |
| margin-block                | specification unclear                       |
| margin-block-end            | specification unclear                       |
| margin-block-start          | specification unclear                       |
| margin-inline               | specification unclear                       |
| margin-inline-end           | specification unclear                       |
| margin-inline-start         | specification unclear                       |
| padding-block               | specification unclear                       |
| padding-block-end           | specification unclear                       |
| padding-block-start         | specification unclear                       |
| padding-inline              | specification unclear                       |
| padding-inline-end          | specification unclear                       |
| padding-inline-start        | specification unclear                       |
| transform                   | accesibility concerns                       |
| transform-origin            | specification [1] incomplete                |
| translate                   | specification [1] incomplete                |
| rotate                      | specification [1] incomplete                |
| scale                       | specification [1] incomplete                |

Specifications List:

- [1] https://drafts.csswg.org/css-transforms-2/#ctm

