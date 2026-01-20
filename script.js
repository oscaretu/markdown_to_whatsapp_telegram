document.addEventListener('DOMContentLoaded', () => {
    const markdownInput = document.getElementById('markdown-input');
    const outputText = document.getElementById('output-text');
    const convertBtn = document.getElementById('convert-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const platformRadios = document.querySelectorAll('input[name="platform"]');
    const headingStyleSelect = document.getElementById('heading-style');

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
     * Convert Markdown to WhatsApp format
     * @param {string} text - Markdown text
     * @param {string} headingStyle - Style for heading transformation
     * @returns {string} - WhatsApp formatted text
     */
    function convertToWhatsApp(text, headingStyle) {
        let result = text;

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
     * @returns {string} - Telegram formatted text
     */
    function convertToTelegram(text, headingStyle) {
        let result = text;

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

        if (!markdown.trim()) {
            outputText.value = '';
            return;
        }

        const converted = platform === 'whatsapp'
            ? convertToWhatsApp(markdown, headingStyle)
            : convertToTelegram(markdown, headingStyle);

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
