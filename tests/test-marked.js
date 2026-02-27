import { marked, Lexer } from 'marked';

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
    console.error('processTokens token:', token.type, token.text);
    if (token.type === 'text') {
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
    switch (headingStyle) {
      case 'none':
        return text + '\n\n';
      case 'bold':
        return `${p.bold.start}${text}${p.bold.end}\n\n`;
      case 'bold-upper':
        return `${p.bold.start}${text.toUpperCase()}${p.bold.end}\n\n`;
      case 'decorated':
      case 'hierarchical':
        const prefix = depth === 1 ? '═══ ' : depth === 2 ? '── ' : '▸ ';
        const suffix = depth === 1 ? ' ═══' : depth === 2 ? ' ──' : '';
        return `${prefix}${text}${suffix}\n\n`;
      default:
        return `${p.bold.start}${text}${p.bold.end}\n\n`;
    }
  };
}

function createWhatsAppRenderer(headingStyle) {
  const p = platformMarkers.whatsapp;
  const headingTransform = getHeadingTransform(headingStyle, p);
  
  return {
    heading({ text, depth, tokens }) {
      console.error('HEADING tokens:', JSON.stringify(tokens));
      let processedText = text;
      if (tokens && tokens.length > 0) {
        processedText = processTokens(tokens, p);
      }
      return headingTransform({ text: processedText, depth });
    },
    
    listitem({ text, task, checked, tokens }) {
      console.error('LISTITEM tokens:', JSON.stringify(tokens));
      const checkbox = task ? (checked ? '[x] ' : '[ ] ') : '• ';
      
      let content = text || '';
      
      if (tokens && tokens.length > 0) {
        for (const token of tokens) {
          console.error('LISTITEM token type:', token.type);
          if (token.type === 'text' && token.tokens && token.tokens.length > 0) {
            console.error('Processing nested tokens:', JSON.stringify(token.tokens));
            content = processTokens(token.tokens, p);
            break;
          } else if (token.type === 'paragraph') {
            if (token.tokens && token.tokens.length > 0) {
              content = processTokens(token.tokens, p);
            } else {
              content = token.text || '';
            }
            break;
          }
        }
      }
      
      return `${checkbox}${content}\n`;
    },
    
    paragraph({ text, tokens }) {
      if (tokens && tokens.length > 0) {
        return processTokens(tokens, p) + '\n\n';
      }
      return text + '\n\n';
    },
    
    strong({ text, tokens }) {
      if (tokens && tokens.length > 0) {
        return `${p.bold.start}${processTokens(tokens, p)}${p.bold.end}`;
      }
      return `${p.bold.start}${text}${p.bold.end}`;
    },
    
    em({ text, tokens }) {
      if (tokens && tokens.length > 0) {
        return `${p.italic.start}${processTokens(tokens, p)}${p.italic.end}`;
      }
      return `${p.italic.start}${text}${p.italic.end}`;
    },
    
    del({ text, tokens }) {
      if (tokens && tokens.length > 0) {
        return `${p.strikethrough.start}${processTokens(tokens, p)}${p.strikethrough.end}`;
      }
      return `${p.strikethrough.start}${text}${p.strikethrough.end}`;
    },
    
    codespan({ text }) {
      return `${p.code.start}${text}${p.code.end}`;
    },
    
    code({ text }) {
      return `${p.codeblock.start}${text}${p.codeblock.end}`;
    },
    
    blockquote({ text, tokens }) {
      if (tokens && tokens.length > 0) {
        return `> ${processTokens(tokens, p)}\n\n`;
      }
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
    
    text({ text, tokens }) {
      if (tokens && tokens.length > 0) {
        return processTokens(tokens, p);
      }
      return text;
    }
  };
}

function createTelegramRenderer(headingStyle) {
  const p = platformMarkers.telegram;
  const headingTransform = getHeadingTransform(headingStyle, p);
  
  return {
    heading({ text, depth, tokens }) {
      let processedText = text;
      if (tokens && tokens.length > 0) {
        processedText = processTokens(tokens, p);
      }
      return headingTransform({ text: processedText, depth });
    },
    
    paragraph({ text, tokens }) {
      if (tokens && tokens.length > 0) {
        return processTokens(tokens, p) + '\n\n';
      }
      return text + '\n\n';
    },
    
    strong({ text, tokens }) {
      if (tokens && tokens.length > 0) {
        return `${p.bold.start}${processTokens(tokens, p)}${p.bold.end}`;
      }
      return `${p.bold.start}${text}${p.bold.end}`;
    },
    
    em({ text, tokens }) {
      if (tokens && tokens.length > 0) {
        return `${p.italic.start}${processTokens(tokens, p)}${p.italic.end}`;
      }
      return `${p.italic.start}${text}${p.italic.end}`;
    },
    
    del({ text, tokens }) {
      if (tokens && tokens.length > 0) {
        return `${p.strikethrough.start}${processTokens(tokens, p)}${p.strikethrough.end}`;
      }
      return `${p.strikethrough.start}${text}${p.strikethrough.end}`;
    },
    
    codespan({ text }) {
      return `${p.code.start}${text}${p.code.end}`;
    },
    
    code({ text }) {
      return `${p.codeblock.start}${text}${p.codeblock.end}`;
    },
    
    blockquote({ text, tokens }) {
      if (tokens && tokens.length > 0) {
        return `> ${processTokens(tokens, p)}\n\n`;
      }
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
      
      let content = text || '';
      
      if (tokens && tokens.length > 0) {
        for (const token of tokens) {
          if (token.type === 'text' && token.tokens && token.tokens.length > 0) {
            content = processTokens(token.tokens, p);
            break;
          } else if (token.type === 'paragraph') {
            if (token.tokens && token.tokens.length > 0) {
              content = processTokens(token.tokens, p);
            } else {
              content = token.text || '';
            }
            break;
          }
        }
      }
      
      return `${checkbox}${content}\n`;
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
    
    text({ text, tokens }) {
      if (tokens && tokens.length > 0) {
        return processTokens(tokens, p);
      }
      return text;
    }
  };
}

function convertToWhatsApp(text, headingStyle) {
    const renderer = createWhatsAppRenderer(headingStyle);
    return marked.parse(text, { renderer });
}

function convertToTelegram(text, headingStyle) {
    const renderer = createTelegramRenderer(headingStyle);
    return marked.parse(text, { renderer });
}

const tests = [
  {
    name: 'Bold in list item',
    input: '* **bold text**',
    expected: '• *bold text*\n',
    platform: 'whatsapp',
    headingStyle: 'bold'
  },
  {
    name: 'Italic in list item',
    input: '* *italic text*',
    expected: '• _italic text_\n',
    platform: 'whatsapp',
    headingStyle: 'bold'
  },
  {
    name: 'Multiple bold in same line',
    input: '**bold1** and **bold2**',
    expected: '*bold1* and *bold2*\n\n',
    platform: 'whatsapp',
    headingStyle: 'bold'
  },
  {
    name: 'Heading with bold inside',
    input: '# **Title**',
    expected: '═══ *Title* ═══\n\n',
    platform: 'whatsapp',
    headingStyle: 'decorated'
  },
  {
    name: 'Mixed content in list item',
    input: '* **bold** and *italic*',
    expected: '• *bold* and _italic_\n',
    platform: 'whatsapp',
    headingStyle: 'bold'
  },
  {
    name: 'Strikethrough in list item',
    input: '* ~~text~~',
    expected: '• ~text~\n',
    platform: 'whatsapp',
    headingStyle: 'bold'
  },
  {
    name: 'Code in list item',
    input: '* `code`',
    expected: '• `code`\n',
    platform: 'whatsapp',
    headingStyle: 'bold'
  }
];

console.log('Running tests...\n');

let passed = 0;
let failed = 0;

for (const test of tests) {
  const result = test.platform === 'whatsapp' 
    ? convertToWhatsApp(test.input, test.headingStyle)
    : convertToTelegram(test.input, test.headingStyle);
  
  const pass = result === test.expected;
  
  if (pass) {
    console.log(`✓ PASS: ${test.name}`);
    passed++;
  } else {
    console.log(`✗ FAIL: ${test.name}`);
    console.log(`  Input:    ${JSON.stringify(test.input)}`);
    console.log(`  Expected: ${JSON.stringify(test.expected)}`);
    console.log(`  Got:      ${JSON.stringify(result)}`);
    failed++;
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
