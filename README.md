# Message Inspector

An [Open Integration Engine (OIE)](https://github.com/OpenIntegrationEngine/engine) extension that adds structured HL7v2 message inspection to the OIE Web Client.

## Features

- **Tree View** — Parsed HL7v2 messages displayed as a collapsible segment/field/component tree
- **Search & Filter** — Incremental tree search with auto-expand to matching nodes
- **Field Descriptions** — Names and descriptions from the HL7 standard for all fields and components
- **Detailed Field Descriptions** — Full HL7 standard text loaded on demand (v2.5+)
- **Optionality** — Full HL7 optionality codes (R, RE, O, C, CE, B, W, X) with color-coded display
- **Repetitions** — Proper handling of repeating fields (~), shown as numbered child nodes
- **Validation** — Required-field and structural validation with color-coded results
- **Table Lookups** — HL7 coded value tables with scroll-to-match for the current value
- **Tree-to-Text Navigation** — Click a tree node to highlight the corresponding text in the raw message
- **Message Browser Integration** — "Inspect Message" action in the OIE Message Browser (API 4.7+)
- **RBAC** — Tab is hidden for users without the `accessInspector` permission
- **All HL7v2 Versions** — Complete support from v2.1 through v2.9

## Building

```
mvn clean package
```

The build produces a ZIP file in `message-inspector-plugin/target/` that can be installed as an OIE extension.

## Installation

Compatible with OIE **4.6.0** and **4.7.0**.

1. Extract the ZIP into the OIE `extensions/` directory
2. Restart the OIE server
3. The extension appears as "Message Inspector" in the Web Client navigation and as an "Inspect Message" action in the Message Browser

## Development Note

This extension was developed with AI assistance (Claude Code). All code was reviewed and tested by the maintainers.

## License

This extension is licensed under the **Mozilla Public License 2.0 (MPL-2.0)**.

### Third-Party Data Attribution

This extension includes reference data derived from third-party sources:

#### HL7 Terminology (THO)

The file `hl7-tables.json` contains coded value tables extracted from the
[HL7 Terminology (THO)](https://terminology.hl7.org/) v6.3.0.

- **License:** [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/) (Creative Commons Public Domain)
- No attribution required, but credit is given here voluntarily.

#### HL7 Version 2.x Access Database

The files `hl7-segment-definitions.json` and `hl7-field-descriptions.json` contain
segment/field/component definitions and detailed field description texts generated
from the [HL7 Version 2.x (All Versions) Access Database](https://www.hl7.org/implement/standards/product_brief.cfm?product_id=185)
by HL7 International.

- **Content License:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (Creative Commons Attribution 4.0 International)
- **Software License:** [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- **Attribution:** The content of the HL7 Version 2.x (All Versions) Access Database is copyright HL7 International. Used under CC BY 4.0.

Both licenses are compatible with the MPL 2.0 license of this extension.

## Author

Getinge IT Solutions GmbH
