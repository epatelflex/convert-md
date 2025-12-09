# Markdown to HTML/PDF Converter

This tool converts Markdown files containing Mermaid diagrams to HTML or PDF format.

## Features

- ✅ Converts Markdown to HTML with proper styling
- ✅ Renders Mermaid diagrams in HTML using Mermaid.js
- ✅ Converts Markdown to PDF with Mermaid diagram support
- ✅ Preserves all Markdown formatting (tables, code blocks, etc.)

## Usage

### Using Makefile (Recommended)

```bash
# Convert to both HTML and PDF
make convert_docs

# Convert to HTML only
make convert_docs_html

# Convert to PDF only
make convert_docs_pdf
```

### Using npm scripts directly

```bash
# Convert to HTML
npm run convert:html [input.md] [output.html]

# Convert to PDF
npm run convert:pdf [input.md] [output.pdf]

# Convert to both
npm run convert:both [input.md]
```

### Using the script directly

```bash
# Convert to HTML
node scripts/convert-markdown.js html CODE_SUMMARY.md CODE_SUMMARY.html

# Convert to PDF
node scripts/convert-markdown.js pdf CODE_SUMMARY.md CODE_SUMMARY.pdf

# Convert to both
node scripts/convert-markdown.js both CODE_SUMMARY.md
```

## Default Behavior

- **Input file**: `CODE_SUMMARY.md` (if not specified)
- **HTML output**: `CODE_SUMMARY.html` (if not specified)
- **PDF output**: `CODE_SUMMARY.pdf` (if not specified)

## Requirements

- Node.js (v14 or higher)
- npm packages (installed via `npm install`)

## How It Works

1. **HTML Conversion**:
   - Uses `marked` library to parse Markdown
   - Replaces Mermaid code blocks with `<div class="mermaid">` elements
   - Includes Mermaid.js CDN for client-side diagram rendering
   - Applies custom CSS styling for better readability

2. **PDF Conversion**:
   - Uses `md-to-pdf` library which uses Puppeteer
   - Renders Markdown to PDF with Mermaid diagram support
   - Applies custom CSS for consistent styling
   - Generates A4 format with proper margins

## Output Files

Generated files are automatically added to `.gitignore`:
- `*.html` files
- `*.pdf` files

## Troubleshooting

### PDF conversion fails

If PDF conversion fails, ensure:
- All npm dependencies are installed: `npm install`
- Puppeteer can download Chromium (may require internet connection on first run)
- Sufficient disk space for Chromium browser

### Mermaid diagrams not rendering

- For HTML: Ensure you have internet connection (uses CDN)
- For PDF: The diagrams should render automatically during conversion

### Styling issues

You can customize the CSS in `scripts/convert-markdown.js`:
- HTML: Modify the `<style>` section in `convertToHTML()`
- PDF: Modify the `css` option in `convertToPDF()`
