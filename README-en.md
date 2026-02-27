# MD2Chat Converter

A simple web application that converts standard Markdown syntax into the specific formatting used by WhatsApp and Telegram.

## Features

- **Platform Support:** Convert to WhatsApp or Telegram formatting
- **Heading Styles:** 5 configurable styles for Markdown headings
- **Table Styles:** 5 configurable styles for Markdown tables
- **No Dependencies:** Pure vanilla JavaScript, HTML5, and CSS3
- **Responsive Design:** Mobile-first approach, works on all devices
- **Robust Parser:** Uses the marked library for correct Markdown parsing
- **Copy to Clipboard:** One-click copy functionality

## Supported Transformations

### Basic Formatting

| Element | Markdown | WhatsApp | Telegram |
|---------|----------|----------|----------|
| Bold | `**text**` | `*text*` | `**text**` |
| Italic | `*text*` or `_text_` | `_text_` | `__text__` |
| Strikethrough | `~~text~~` | `~text~` | `~~text~~` |
| Monospace | `` `text` `` | `` `text` `` | `` `text` `` |
| Code Block | ` ```text``` ` | ` ```text``` ` | ` ```text``` ` |

### Heading Styles

| Style | Description | Example (H1) |
|-------|-------------|--------------|
| None | Removes # markers | `Title` |
| Bold only | Wraps in bold | `*Title*` |
| Bold + UPPERCASE | Bold with uppercase | `*TITLE*` |
| Decorated | Adds line decorators | `═══ *Title* ═══` |
| Hierarchical | Different styles per level | H1-H6 differentiated |

### Table Styles

| Style | Description |
|-------|-------------|
| None | Plain comma-separated text |
| Code block | Aligned table in monospace |
| List format | Each row as bulleted list |
| Compact | Key-value pairs per row |
| Unicode box | Table with box-drawing characters |

## Usage

1. Open `index.html` in your browser
2. Paste your Markdown text in the input area
3. Select target platform (WhatsApp or Telegram)
4. Choose heading and table styles as needed
5. Click **Convert**
6. Click **Copy to Clipboard** to copy the result

## Installation

No installation required. Simply clone or download the repository and open `index.html` in any modern browser.

```bash
git clone https://github.com/oscaretu/markdown_to_whatsapp_telegram.git
cd markdown_to_whatsapp_telegram
# Open index.html in your browser
```

## Files

- `index.html` - Main HTML structure
- `style.css` - Responsive CSS styles
- `script.js` - Conversion logic with RegEx (original version)
- `script-marked.js` - Conversion logic using marked parser

## License

MIT License
