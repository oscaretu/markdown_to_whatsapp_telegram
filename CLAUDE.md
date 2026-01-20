# Project Spec: MD2Chat Converter

## 1. Overview
Application that converts standard Markdown syntax into the specific formatting used by messaging apps like WhatsApp and Telegram.
- **Goal:** Provide a simple web interface for quick text transformation.
- **Platform:** Client-side Web (No backend required).
- **Language:** JavaScript (ES6+), HTML5, CSS3.

## 2. User Interface (UI) Requirements
The UI should be clean, modern, and responsive (Mobile-first).
- **Input Area:** A `textarea` for the user to paste their Markdown code.
- **Platform Selector:** A radio button group with two options:
    - `WhatsApp` (default)
    - `Telegram`
- **Heading Style Selector:** A dropdown to choose heading transformation style:
    - `None (remove #)`: Removes # markers, keeps plain text
    - `Bold only` (default): Wraps in platform-specific bold
    - `Bold + UPPERCASE`: Bold with uppercase text
    - `Decorated (═══)`: Adds line decorators based on level
    - `Hierarchical`: Different styles per heading level (H1-H6)
- **Table Style Selector:** A dropdown to choose table transformation style:
    - `None (plain text)`: Comma-separated values
    - `Code block` (default): Aligned table in monospace
    - `List format`: Each row as bulleted list with headers as labels
    - `Compact (key: value)`: Key-value pairs per row
    - `Unicode box`: Table with box-drawing characters (┌─┬─┐)
- **Action Buttons:**
    - `Convert`: Triggers the transformation logic.
    - `Clear`: Resets all textareas and restores the default selections.
- **Output Area:** A `textarea` (read-only) showing the converted text.
- **Copy Button:** A secondary button to copy the output to the clipboard.

## 3. Transformation Logic (Core)
The converter must use JavaScript Regular Expressions (RegEx) to map Markdown to the following formats:

| Element | Markdown | WhatsApp | Telegram |
| :--- | :--- | :--- | :--- |
| **Bold** | `**text**` | `*text*` | `**text**` |
| **Italic** | `*text*` or `_text_` | `_text_` | `__text__` |
| **Strikethrough** | `~~text~~` | `~text~` | `~~text~~` |
| **Monospace** | `` `text` `` | ``` `text` ``` | `` `text` `` |
| **Code Block** | ` ```text``` ` | ``` ```text``` ``` | ``` ```text``` ``` |

### Transformation Rules:
- **WhatsApp:** Bold uses single asterisks `*`, Italic uses single underscores `_`.
- **Telegram:** Bold uses double asterisks `**`, Italic uses double underscores `__`.
- **Constraint:** Maintain original line breaks and spacing.

### Heading Transformation:
Headings (`#` to `######`) are transformed based on selected style:
- Styles use platform-specific bold markers (`*` for WhatsApp, `**` for Telegram)
- Hierarchical style differentiates levels: H1 (decorated uppercase), H2 (decorated), H3 (bold with arrow), H4-H6 (indented bullets)

### Table Transformation:
Markdown tables are parsed and converted based on selected style:
- Tables are detected by lines containing `|` characters
- Headers and rows are extracted, separator lines (`|---|`) are removed
- Code block and Unicode styles wrap output in triple backticks for monospace rendering
- List and compact styles use platform-specific bold for labels

## 4. Technical Implementation
- **Architecture:** Single Page Application (SPA).
- **Files:**
    - `index.html`: Structure and UI.
    - `style.css`: Modern styling (centered layout, clean typography).
    - `script.js`: Logic for RegEx replacement and DOM manipulation.
- **No Dependencies:** Pure "Vanilla" JavaScript preferred.

## 5. Development Instructions for Claude Code
1. Read this file to understand the conversion mapping.
2. Generate a clean `index.html` with the required inputs and buttons.
3. In `script.js`, create a modular function for each platform's conversion logic.
4. Ensure the "Clear" button resets the entire state of the app.
5. Use CSS Flexbox or Grid to ensure the textareas look good on both desktop and mobile.

