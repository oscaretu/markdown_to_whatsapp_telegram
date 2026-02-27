const platformMarkers = {
  whatsapp: {
    bold: { start: '*', end: '*' },
    italic: { start: '_', end: '_' },
    strikethrough: { start: '~', end: '~' },
    code: { start: '`', end: '`' },
    codeblock: { start: '```\n', end: '\n```' }
  },
  telegram: {
    bold: { start: '**', end: '**' },
    italic: { start: '__', end: '__' },
    strikethrough: { start: '~~', end: '~~' },
    code: { start: '`', end: '`' },
    codeblock: { start: '```\n', end: '\n```' }
  }
};

function processTokens(tokens, p) {
  if (!tokens) return '';
  let result = '';
  for (const token of tokens) {
    if (token.type === 'text') {
      // Check if text token has nested tokens to process
      if (token.tokens && token.tokens.length > 0) {
        result += processTokens(token.tokens, p);
      } else {
        result += token.text;
      }
    } else if (token.type === 'strong') {
      result += `${p.bold.start}${token.text}${p.bold.end}`;
    } else if (token.type === 'em') {
      result += `${p.italic.start}${token.text}${p.italic.end}`;
    } else if (token.type === 'del') {
      result += `${p.strikethrough.start}${token.text}${p.strikethrough.end}`;
    } else if (token.type === 'codespan') {
      result += `${p.code.start}${token.text}${p.code.end}`;
    } else if (token.type === 'code') {
      result += `${p.codeblock.start}${token.text}${p.codeblock.end}`;
    } else if (token.type === 'link') {
      result += token.text;
    } else if (token.tokens && token.tokens.length > 0) {
      result += processTokens(token.tokens, p);
    }
  }
  return result;
}

function getHeadingTransform(headingStyle, p) {
  return function({ text, depth }) {
    // Number of = signs: H1=6, H2=5, H3=4, H4=3, H5=2, H6=1
    const equals = '='.repeat(7 - depth);
    
    switch (headingStyle) {
      case 'none':
        return text + '\n\n';
      case 'bold':
        return `${p.bold.start}${text}${p.bold.end}\n\n`;
      case 'bold-upper':
        return `${p.bold.start}${text.toUpperCase()}${p.bold.end}\n\n`;
      case 'decorated':
        return `${equals} ${p.bold.start}${text}${p.bold.end} ${equals}\n\n`;
      case 'hierarchical':
        if (depth === 1) {
          return `${equals} ${p.bold.start}${text.toUpperCase()}${p.bold.end} ${equals}\n\n`;
        } else if (depth === 2) {
          return `${equals} ${p.bold.start}${text}${p.bold.end} ${equals}\n\n`;
        } else if (depth === 3) {
          return `▸ ${p.bold.start}${text}${p.bold.end}\n\n`;
        } else {
          const indent = '  '.repeat(depth - 3);
          return `${indent}• ${text}\n\n`;
        }
      default:
        return `${p.bold.start}${text}${p.bold.end}\n\n`;
    }
  };
}

// Create custom renderer for WhatsApp
function createWhatsAppRenderer(headingStyle) {
  const p = platformMarkers.whatsapp;
  const headingTransform = getHeadingTransform(headingStyle, p);
  
  return {
    heading({ text, depth }) {
      return headingTransform({ text, depth });
    },
    
    paragraph({ text }) {
      return text + '\n\n';
    },
    
    strong({ text }) {
      return `${p.bold.start}${text}${p.bold.end}`;
    },
    
    em({ text }) {
      return `${p.italic.start}${text}${p.italic.end}`;
    },
    
    del({ text }) {
      return `${p.strikethrough.start}${text}${p.strikethrough.end}`;
    },
    
    codespan({ text }) {
      return `${p.code.start}${text}${p.code.end}`;
    },
    
    code({ text }) {
      return `${p.codeblock.start}${text}${p.codeblock.end}`;
    },
    
    blockquote({ text }) {
      return `> ${text}\n\n`;
    },
    
    list({ text, ordered, items }) {
      if (!items || items.length === 0) return text || '';
      
      let result = '';
      for (const item of items) {
        const checkbox = '• ';
        if (item.tokens && item.tokens.length > 0) {
          result += checkbox + processTokens(item.tokens, p) + '\n';
        } else {
          result += checkbox + (item.text || '') + '\n';
        }
      }
      return result;
    },
    
    listitem({ text, task, checked, tokens }) {
      const checkbox = task ? (checked ? '[x] ' : '[ ] ') : '• ';
      if (tokens && tokens.length > 0) {
        return `${checkbox}${processTokens(tokens, p)}\n`;
      }
      return `${checkbox}${text || ''}\n`;
    },
    
    table({ header, rows }) {
      const headers = header.map(cell => cell.text).filter(h => h);
      const rowData = rows.map(row => row.map(cell => cell.text));
      
      let result = '';
      rowData.forEach((cells, rowIndex) => {
        result += `${p.bold.start}Row ${rowIndex + 1}:${p.bold.end}\n`;
        headers.forEach((h, i) => {
          const cell = cells[i] || '';
          result += `• ${h}: ${cell}\n`;
        });
        result += '\n';
      });
      
      return result;
    },
    
    tablerow({ text }) {
      return text + '\n';
    },
    
    tablecell({ text, header }) {
      return text + ' | ';
    },
    
    hr() {
      return '---\n\n';
    },
    
    link({ href, title, text }) {
      return text;
    },
    
    image({ href, title, text }) {
      return text;
    },
    
    text({ text }) {
      return text;
    }
  };
}

// Create custom renderer for Telegram (similar but with Telegram markers)
function createTelegramRenderer(headingStyle) {
  const p = platformMarkers.telegram;
  const headingTransform = getHeadingTransform(headingStyle, p);
  
  return {
    heading({ text, depth }) {
      return headingTransform({ text, depth });
    },
    
    paragraph({ text }) {
      return text + '\n\n';
    },
    
    strong({ text }) {
      return `${p.bold.start}${text}${p.bold.end}`;
    },
    
    em({ text }) {
      return `${p.italic.start}${text}${p.italic.end}`;
    },
    
    del({ text }) {
      return `${p.strikethrough.start}${text}${p.strikethrough.end}`;
    },
    
    codespan({ text }) {
      return `${p.code.start}${text}${p.code.end}`;
    },
    
    code({ text }) {
      return `${p.codeblock.start}${text}${p.codeblock.end}`;
    },
    
    blockquote({ text }) {
      return `> ${text}\n\n`;
    },
    
    list({ text, ordered, items }) {
      if (!items || items.length === 0) return text || '';
      
      let result = '';
      for (const item of items) {
        const checkbox = '• ';
        if (item.tokens && item.tokens.length > 0) {
          result += checkbox + processTokens(item.tokens, p) + '\n';
        } else {
          result += checkbox + (item.text || '') + '\n';
        }
      }
      return result;
    },
    
    listitem({ text, task, checked, tokens }) {
      const checkbox = task ? (checked ? '[x] ' : '[ ] ') : '• ';
      if (tokens && tokens.length > 0) {
        return `${checkbox}${processTokens(tokens, p)}\n`;
      }
      return `${checkbox}${text || ''}\n`;
    },
    
    table({ header, rows }) {
      const headers = header.map(cell => cell.text).filter(h => h);
      const rowData = rows.map(row => row.map(cell => cell.text));
      
      let result = '';
      rowData.forEach((cells, rowIndex) => {
        result += `${p.bold.start}Row ${rowIndex + 1}:${p.bold.end}\n`;
        headers.forEach((h, i) => {
          const cell = cells[i] || '';
          result += `• ${h}: ${cell}\n`;
        });
        result += '\n';
      });
      
      return result;
    },

    tablerow({ text }) {
      return text + '\n';
    },
    
    tablecell({ text, header }) {
      return text + ' | ';
    },
    
    hr() {
      return '---\n\n';
    },
    
    link({ href, title, text }) {
      return text;
    },
    
    image({ href, title, text }) {
      return text;
    },
    
    text({ text }) {
      return text;
    }
  };
}

/**
 * Convert Markdown to WhatsApp format using marked
 */
function convertToWhatsApp(text, headingStyle) {
    marked.use({ renderer: createWhatsAppRenderer(headingStyle) });
    return marked.parse(text);
}

/**
 * Convert Markdown to Telegram format using marked
 */
function convertToTelegram(text, headingStyle) {
    marked.use({ renderer: createTelegramRenderer(headingStyle) });
    return marked.parse(text);
}

// DOM Event handlers
document.addEventListener('DOMContentLoaded', () => {
    const markdownInput = document.getElementById('markdown-input');
    const outputText = document.getElementById('output-text');
    const convertBtn = document.getElementById('convert-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const platformRadios = document.querySelectorAll('input[name="platform"]');
    const headingStyleSelect = document.getElementById('heading-style');
    const tableStyleSelect = document.getElementById('table-style');

    function getSelectedPlatform() {
        const selected = document.querySelector('input[name="platform"]:checked');
        return selected ? selected.value : 'whatsapp';
    }

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

    function handleClear() {
        markdownInput.value = '';
        outputText.value = '';

        platformRadios.forEach(radio => {
            radio.checked = radio.value === 'whatsapp';
        });

        headingStyleSelect.value = 'bold';
        tableStyleSelect.value = 'code';

        copyBtn.textContent = 'Copy to Clipboard';
        copyBtn.classList.remove('copied');

        markdownInput.focus();
    }

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
        } catch {
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

    convertBtn.addEventListener('click', handleConvert);
    clearBtn.addEventListener('click', handleClear);
    copyBtn.addEventListener('click', handleCopy);
});
