document.addEventListener('DOMContentLoaded', () => {
    const markdownInput = document.getElementById('markdown-input');
    const outputText = document.getElementById('output-text');
    const convertBtn = document.getElementById('convert-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const platformRadios = document.querySelectorAll('input[name="platform"]');
    const headingStyleSelect = document.getElementById('heading-style');
    const tableStyleSelect = document.getElementById('table-style');

    /**
     * Transform headings based on style and platform
     * @param {string} text - Text with markdown headings
     * @param {string} style - Heading style (none, bold, bold-upper, decorated, hierarchical)
     * @param {string} platform - Target platform (whatsapp, telegram)
     * @returns {string} - Text with transformed headings
     */
    function transformHeadings(text, style, platform) {
        const boldStart = platform === 'whatsapp' ? '*' : '**';
        const boldEnd = platform === 'whatsapp' ? '*' : '**';

        // Match headings: # to ###### at start of line
        return text.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
            const level = hashes.length;
            const trimmedContent = content.trim();

            switch (style) {
                case 'none':
                    return trimmedContent;

                case 'bold':
                    return `${boldStart}${trimmedContent}${boldEnd}`;

                case 'bold-upper':
                    return `${boldStart}${trimmedContent.toUpperCase()}${boldEnd}`;

                case 'decorated':
                    if (level === 1) {
                        return `═══ ${boldStart}${trimmedContent}${boldEnd} ═══`;
                    } else if (level === 2) {
                        return `── ${boldStart}${trimmedContent}${boldEnd} ──`;
                    } else {
                        return `▸ ${boldStart}${trimmedContent}${boldEnd}`;
                    }

                case 'hierarchical':
                    if (level === 1) {
                        return `═══ ${boldStart}${trimmedContent.toUpperCase()}${boldEnd} ═══`;
                    } else if (level === 2) {
                        return `── ${boldStart}${trimmedContent}${boldEnd} ──`;
                    } else if (level === 3) {
                        return `${boldStart}▸ ${trimmedContent}${boldEnd}`;
                    } else {
                        const indent = '  '.repeat(level - 3);
                        return `${indent}• ${trimmedContent}`;
                    }

                default:
                    return trimmedContent;
            }
        });
    }

    /**
     * Parse a markdown table into structured data
     * @param {string} tableText - Raw markdown table text
     * @returns {Object} - { headers: string[], rows: string[][] }
     */
    function parseMarkdownTable(tableText) {
        const lines = tableText.trim().split('\n');
        const headers = [];
        const rows = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Skip separator line (|---|---|)
            if (/^\|?[\s\-:]+\|[\s\-:|]+\|?$/.test(line)) {
                continue;
            }

            // Parse cells from line
            const cells = line
                .replace(/^\||\|$/g, '') // Remove leading/trailing pipes
                .split('|')
                .map(cell => cell.trim());

            if (i === 0) {
                headers.push(...cells);
            } else if (cells.length > 0 && cells.some(c => c !== '')) {
                rows.push(cells);
            }
        }

        return { headers, rows };
    }

    /**
     * Transform tables based on style and platform
     * @param {string} text - Text with markdown tables
     * @param {string} style - Table style (none, code, list, compact, unicode)
     * @param {string} platform - Target platform (whatsapp, telegram)
     * @returns {string} - Text with transformed tables
     */
    function transformTables(text, style, platform) {
        const boldStart = platform === 'whatsapp' ? '*' : '**';
        const boldEnd = platform === 'whatsapp' ? '*' : '**';

        // Match markdown tables (lines starting with | or containing |)
        const tableRegex = /(?:^|\n)((?:\|[^\n]+\|(?:\n|$))+)/g;

        return text.replace(tableRegex, (match, tableContent) => {
            const { headers, rows } = parseMarkdownTable(tableContent);

            if (headers.length === 0) {
                return match;
            }

            const leadingNewline = match.startsWith('\n') ? '\n' : '';

            switch (style) {
                case 'none':
                    // Plain text: just comma-separated values
                    let plainResult = headers.join(', ') + '\n';
                    rows.forEach(row => {
                        plainResult += row.join(', ') + '\n';
                    });
                    return leadingNewline + plainResult.trim();

                case 'code':
                    // Code block with aligned columns
                    const colWidths = headers.map((h, i) => {
                        const maxRowWidth = Math.max(...rows.map(r => (r[i] || '').length));
                        return Math.max(h.length, maxRowWidth);
                    });

                    let codeResult = '```\n';
                    codeResult += headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + '\n';
                    codeResult += colWidths.map(w => '-'.repeat(w)).join('-+-') + '\n';
                    rows.forEach(row => {
                        codeResult += row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join(' | ') + '\n';
                    });
                    codeResult += '```';
                    return leadingNewline + codeResult;

                case 'list':
                    // List format: each row as a block
                    let listResult = '';
                    rows.forEach((row, rowIndex) => {
                        listResult += `${boldStart}Row ${rowIndex + 1}:${boldEnd}\n`;
                        headers.forEach((header, i) => {
                            listResult += `• ${header}: ${row[i] || ''}\n`;
                        });
                        if (rowIndex < rows.length - 1) {
                            listResult += '\n';
                        }
                    });
                    return leadingNewline + listResult.trim();

                case 'compact':
                    // Compact: key: value pairs per row
                    let compactResult = '';
                    rows.forEach((row, rowIndex) => {
                        const pairs = headers.map((header, i) =>
                            `${boldStart}${header}:${boldEnd} ${row[i] || ''}`
                        );
                        compactResult += pairs.join(' | ') + '\n';
                    });
                    return leadingNewline + compactResult.trim();

                case 'unicode':
                    // Unicode box drawing
                    const uColWidths = headers.map((h, i) => {
                        const maxRowWidth = Math.max(...rows.map(r => (r[i] || '').length));
                        return Math.max(h.length, maxRowWidth);
                    });

                    let unicodeResult = '```\n';
                    // Top border
                    unicodeResult += '┌' + uColWidths.map(w => '─'.repeat(w + 2)).join('┬') + '┐\n';
                    // Headers
                    unicodeResult += '│' + headers.map((h, i) => ` ${h.padEnd(uColWidths[i])} `).join('│') + '│\n';
                    // Header separator
                    unicodeResult += '├' + uColWidths.map(w => '─'.repeat(w + 2)).join('┼') + '┤\n';
                    // Rows
                    rows.forEach((row, rowIndex) => {
                        unicodeResult += '│' + row.map((cell, i) => ` ${(cell || '').padEnd(uColWidths[i])} `).join('│') + '│\n';
                    });
                    // Bottom border
                    unicodeResult += '└' + uColWidths.map(w => '─'.repeat(w + 2)).join('┴') + '┘\n';
                    unicodeResult += '```';
                    return leadingNewline + unicodeResult;

                default:
                    return match;
            }
        });
    }

    /**
     * Convert Markdown to WhatsApp format
     * @param {string} text - Markdown text
     * @param {string} headingStyle - Style for heading transformation
     * @param {string} tableStyle - Style for table transformation
     * @returns {string} - WhatsApp formatted text
     */
    function convertToWhatsApp(text, headingStyle, tableStyle) {
        let result = text;

        // Transform tables first (before preserving code blocks)
        result = transformTables(result, tableStyle, 'whatsapp');

        // Preserve code blocks (no change needed)
        const codeBlocks = [];
        result = result.replace(/```([\s\S]*?)```/g, (match) => {
            codeBlocks.push(match);
            return `__CODEBLOCK_${codeBlocks.length - 1}__`;
        });

        // Preserve inline code (no change needed)
        const inlineCode = [];
        result = result.replace(/`([^`]+)`/g, (match) => {
            inlineCode.push(match);
            return `__INLINECODE_${inlineCode.length - 1}__`;
        });

        // Transform headings before other formatting
        result = transformHeadings(result, headingStyle, 'whatsapp');

        // Bold: **text** → *text*
        result = result.replace(/\*\*([^*]+)\*\*/g, '*$1*');

        // Italic: *text* → _text_ (single asterisk, not part of bold)
        result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '_$1_');

        // Italic: _text_ stays as _text_ (no change needed for underscore)

        // Strikethrough: ~~text~~ → ~text~
        result = result.replace(/~~([^~]+)~~/g, '~$1~');

        // Restore inline code
        inlineCode.forEach((code, index) => {
            result = result.replace(`__INLINECODE_${index}__`, code);
        });

        // Restore code blocks
        codeBlocks.forEach((block, index) => {
            result = result.replace(`__CODEBLOCK_${index}__`, block);
        });

        return result;
    }

    /**
     * Convert Markdown to Telegram format
     * @param {string} text - Markdown text
     * @param {string} headingStyle - Style for heading transformation
     * @param {string} tableStyle - Style for table transformation
     * @returns {string} - Telegram formatted text
     */
    function convertToTelegram(text, headingStyle, tableStyle) {
        let result = text;

        // Transform tables first (before preserving code blocks)
        result = transformTables(result, tableStyle, 'telegram');

        // Preserve code blocks (no change needed)
        const codeBlocks = [];
        result = result.replace(/```([\s\S]*?)```/g, (match) => {
            codeBlocks.push(match);
            return `__CODEBLOCK_${codeBlocks.length - 1}__`;
        });

        // Preserve inline code (no change needed)
        const inlineCode = [];
        result = result.replace(/`([^`]+)`/g, (match) => {
            inlineCode.push(match);
            return `__INLINECODE_${inlineCode.length - 1}__`;
        });

        // Transform headings before other formatting
        result = transformHeadings(result, headingStyle, 'telegram');

        // Bold: **text** stays as **text** (no change needed)

        // Italic: *text* → __text__ (single asterisk)
        result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '__$1__');

        // Italic: _text_ → __text__ (single underscore to double)
        result = result.replace(/(?<!_)_([^_]+)_(?!_)/g, '__$1__');

        // Strikethrough: ~~text~~ stays as ~~text~~ (no change needed)

        // Restore inline code
        inlineCode.forEach((code, index) => {
            result = result.replace(`__INLINECODE_${index}__`, code);
        });

        // Restore code blocks
        codeBlocks.forEach((block, index) => {
            result = result.replace(`__CODEBLOCK_${index}__`, block);
        });

        return result;
    }

    /**
     * Get the selected platform
     * @returns {string} - 'whatsapp' or 'telegram'
     */
    function getSelectedPlatform() {
        const selected = document.querySelector('input[name="platform"]:checked');
        return selected ? selected.value : 'whatsapp';
    }

    /**
     * Handle convert button click
     */
    function handleConvert() {
        const markdown = markdownInput.value;
        const platform = getSelectedPlatform();
        const headingStyle = headingStyleSelect.value;
        const tableStyle = tableStyleSelect.value;

        if (!markdown.trim()) {
            outputText.value = '';
            return;
        }

        const converted = platform === 'whatsapp'
            ? convertToWhatsApp(markdown, headingStyle, tableStyle)
            : convertToTelegram(markdown, headingStyle, tableStyle);

        outputText.value = converted;
    }

    /**
     * Handle clear button click - resets entire app state
     */
    function handleClear() {
        markdownInput.value = '';
        outputText.value = '';

        // Reset to default platform (WhatsApp)
        platformRadios.forEach(radio => {
            radio.checked = radio.value === 'whatsapp';
        });

        // Reset heading style to default (bold)
        headingStyleSelect.value = 'bold';

        // Reset table style to default (code)
        tableStyleSelect.value = 'code';

        // Reset copy button state
        copyBtn.textContent = 'Copy to Clipboard';
        copyBtn.classList.remove('copied');

        // Focus on input
        markdownInput.focus();
    }

    /**
     * Handle copy button click
     */
    async function handleCopy() {
        const text = outputText.value;

        if (!text.trim()) {
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('copied');

            setTimeout(() => {
                copyBtn.textContent = 'Copy to Clipboard';
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            // Fallback for older browsers
            outputText.select();
            document.execCommand('copy');
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('copied');

            setTimeout(() => {
                copyBtn.textContent = 'Copy to Clipboard';
                copyBtn.classList.remove('copied');
            }, 2000);
        }
    }

    // Event listeners
    convertBtn.addEventListener('click', handleConvert);
    clearBtn.addEventListener('click', handleClear);
    copyBtn.addEventListener('click', handleCopy);

    // Optional: Auto-convert on input change (can be enabled if desired)
    // markdownInput.addEventListener('input', handleConvert);
});
