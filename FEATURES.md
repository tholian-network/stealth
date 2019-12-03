
# Features

## HTML Features

TBD

## CSS Features

Currently, the [CSS Parser](./stealth/source/parser/CSS.mjs) tries to achieve maximum
compatibility with the CSS 3 specification, as long as features don't compromise
privacy or security of the client system.

As the implementation of CSS comes with high risk of exploitation of its features,
some features were dropped on purpose in their implementations because they were
abused in the past with already published proof of concepts or cases in the past.

Here's the cumulative list of CSS features that Stealth does not support:


|:---------------------------:|:-------------------------------------------:|
| FEATURE                     | REASON                                      |
|:---------------------------:|:-------------------------------------------:|
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
| inset-block                 | specification unclear                       |
| inset-block-end             | specification unclear                       |
| inset-block-start           | specification unclear                       |
| inset-inline                | specification unclear                       |
| inset-inline-end            | specification unclear                       |
| inset-inline-start          | specification unclear                       |
| isolation                   | accessibility concerns                      |
| margin-block                | specification unclear                       |
| margin-block-end            | specification unclear                       |
| margin-block-start          | specification unclear                       |
| margin-inline               | specification unclear                       |
| margin-inline-end           | specification unclear                       |
| margin-inline-start         | specification unclear                       |
| min-block-size              | specification unclear                       |
| mix-blend-mode              | accessibility concerns                      |
| offset                      | too complex: requires SVG path parser       |
| padding-block               | specification unclear                       |
| padding-block-end           | specification unclear                       |
| padding-block-start         | specification unclear                       |
| padding-inline              | specification unclear                       |
| padding-inline-end          | specification unclear                       |
| padding-inline-start        | specification unclear                       |
| rotate                      |                                             |
| scale                       |                                             |
| scroll-margin-block         | specification unclear                       |
| scroll-margin-block-end     | specification unclear                       |
| scroll-margin-block-start   | specification unclear                       |
| scroll-margin-inline        | specification unclear                       |
| scroll-margin-inline-end    | specification unclear                       |
| scroll-margin-inline-start  | specification unclear                       |
| scroll-padding-block        | specification unclear                       |
| scroll-padding-block-end    | specification unclear                       |
| scroll-padding-block-start  | specification unclear                       |
| scroll-padding-inline       | specification unclear                       |
| scroll-padding-inline-end   | specification unclear                       |
| scroll-padding-inline-start | specification unclear                       |
| scroll-snap-align           | two-value syntax unsupported                |
| text-indent                 | `each-line` or `hanging` suffix unsupported |
| text-shadow                 | accessibility concerns                      |
| transition-timing-function  | `<step>` syntax unsupported                 |
|:---------------------------:|:-------------------------------------------:|

