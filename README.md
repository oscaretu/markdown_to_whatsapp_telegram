# MD2Chat Converter

Aplicación web sencilla que convierte sintaxis Markdown estándar al formato específico usado por WhatsApp y Telegram.

## Características

- **Soporte de plataformas:** Convierte a formato WhatsApp o Telegram
- **Estilos de encabezados:** 5 estilos configurables para encabezados Markdown
- **Estilos de tablas:** 5 estilos configurables para tablas Markdown
- **Sin dependencias:** JavaScript puro, HTML5 y CSS3
- **Diseño responsive:** Enfoque mobile-first, funciona en todos los dispositivos
- **Parser robusto:** Utiliza la librería marked para un parsing correcto de Markdown
- **Copiar al portapapeles:** Funcionalidad de copiado con un clic

## Transformaciones soportadas

### Formato básico

| Elemento | Markdown | WhatsApp | Telegram |
|----------|----------|----------|----------|
| Negrita | `**texto**` | `*texto*` | `**texto**` |
| Cursiva | `*texto*` o `_texto_` | `_texto_` | `__texto__` |
| Tachado | `~~texto~~` | `~texto~` | `~~texto~~` |
| Monoespaciado | `` `texto` `` | `` `texto` `` | `` `texto` `` |
| Bloque de código | ` ```texto``` ` | ` ```texto``` ` | ` ```texto``` ` |

### Estilos de encabezados

| Estilo | Descripción | Ejemplo (H1) |
|--------|-------------|--------------|
| None | Elimina los marcadores # | `Título` |
| Bold only | Envuelve en negrita | `*Título*` |
| Bold + UPPERCASE | Negrita con mayúsculas | `*TÍTULO*` |
| Decorated | Añade decoradores de línea | `═══ *Título* ═══` |
| Hierarchical | Estilos diferentes por nivel | H1-H6 diferenciados |

### Estilos de tablas

| Estilo | Descripción |
|--------|-------------|
| None | Texto plano separado por comas |
| Code block | Tabla alineada en monoespaciado |
| List format | Cada fila como lista con viñetas |
| Compact | Pares clave-valor por fila |
| Unicode box | Tabla con caracteres de dibujo de caja |

## Uso

1. Abre `index.html` en tu navegador
2. Pega tu texto Markdown en el área de entrada
3. Selecciona la plataforma destino (WhatsApp o Telegram)
4. Elige los estilos de encabezados y tablas según necesites
5. Haz clic en **Convert**
6. Haz clic en **Copy to Clipboard** para copiar el resultado

## Instalación

No requiere instalación. Simplemente clona o descarga el repositorio y abre `index.html` en cualquier navegador moderno.

```bash
git clone https://github.com/oscaretu/markdown_to_whatsapp_telegram.git
cd markdown_to_whatsapp_telegram
# Abre index.html en tu navegador
```

## Archivos

- `index.html` - Estructura HTML principal
- `style.css` - Estilos CSS responsive
- `script.js` - Lógica de conversión con RegEx (versión original)
- `script-marked.js` - Lógica de conversión usando parser marked

## Licencia

MIT License
