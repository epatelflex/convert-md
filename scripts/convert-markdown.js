#!/usr/bin/env node

/**
 * Converts Markdown files with Mermaid diagrams to HTML or PDF
 * 
 * Usage:
 *   node scripts/convert-markdown.js html [input.md] [output.html]
 *   node scripts/convert-markdown.js pdf [input.md] [output.pdf]
 *   node scripts/convert-markdown.js both [input.md]
 */

const fs = require('fs');
const path = require('path');
const { mdToPdf } = require('md-to-pdf');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

// Default input/output files
const DEFAULT_INPUT = 'CODE_SUMMARY.md';
const DEFAULT_HTML_OUTPUT = 'CODE_SUMMARY.html';
const DEFAULT_PDF_OUTPUT = 'CODE_SUMMARY.pdf';

async function convertToHTML(inputFile, outputFile) {
  console.log(`Converting ${inputFile} to HTML...`);

  // Read the markdown file
  let content = fs.readFileSync(inputFile, 'utf8');

  // Configure marked to handle Mermaid code blocks
  marked.setOptions({
    breaks: true,
    gfm: true
  });

  // Custom renderer for code blocks to handle Mermaid
  const renderer = new marked.Renderer();
  const originalCode = renderer.code.bind(renderer);

  renderer.code = function (code, infostring, escaped) {
    const lang = (infostring || '').trim();
    if (lang === 'mermaid') {
      // Return Mermaid diagram wrapped in proper div
      return `<div class="mermaid">${code}</div>\n`;
    }
    // Use default code block rendering for other languages
    return originalCode(code, infostring, escaped);
  };

  marked.setOptions({ renderer });

  // Convert markdown to HTML using marked
  const htmlContent = marked.parse(content);

  // Create HTML wrapper
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${path.basename(inputFile, '.md')}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                   'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #2c3e50;
      margin-top: 1.5em;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background-color: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    .mermaid {
      background-color: #f9f9f9;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
      text-align: center;
      min-height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .mermaid svg {
      max-width: 100%;
      height: auto;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
    }
    table th, table td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    table th {
      background-color: #4CAF50;
      color: white;
    }
    table tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    a {
      color: #3498db;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    hr {
      border: none;
      border-top: 2px solid #eee;
      margin: 30px 0;
    }
    blockquote {
      border-left: 4px solid #ddd;
      margin: 0;
      padding-left: 20px;
      color: #666;
    }
  </style>
</head>
<body>
  ${htmlContent}
  
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>
    // Wait for Mermaid to be available
    function waitForMermaid(callback, maxAttempts) {
      maxAttempts = maxAttempts || 50;
      if (typeof mermaid !== 'undefined') {
        callback();
      } else if (maxAttempts > 0) {
        setTimeout(function() {
          waitForMermaid(callback, maxAttempts - 1);
        }, 100);
      } else {
        console.error('Mermaid.js failed to load after 5 seconds');
      }
    }
    
    // Start waiting for Mermaid once DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        waitForMermaid(initMermaid);
      });
    } else {
      waitForMermaid(initMermaid);
    }
    
    function initMermaid() {
      mermaid.initialize({ 
        startOnLoad: false, // We'll render manually
        theme: 'default',
        securityLevel: 'loose',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        },
        sequence: {
          diagramMarginX: 50,
          diagramMarginY: 10,
          actorMargin: 50
        },
        gantt: {
          useMaxWidth: true
        }
      });
      
      // Render all Mermaid diagrams
      var mermaidElements = document.querySelectorAll('.mermaid');
      if (mermaidElements.length > 0) {
        mermaid.run({
          querySelector: '.mermaid',
          suppressErrors: true
        }).catch(function(err) {
          console.error('Mermaid rendering error:', err);
        });
      }
    }
  </script>
</body>
</html>`;

  // Write HTML file
  fs.writeFileSync(outputFile, html);
  console.log(`✓ HTML file created: ${outputFile}`);
}

async function convertToPDF(inputFile, outputFile) {
  console.log(`Converting ${inputFile} to PDF...`);

  try {
    // First, convert to HTML (which handles Mermaid properly)
    const tempHtmlFile = outputFile.replace('.pdf', '_temp.html');
    await convertToHTML(inputFile, tempHtmlFile);

    // Then convert HTML to PDF using puppeteer
    console.log('Rendering Mermaid diagrams and generating PDF...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const htmlPath = path.resolve(tempHtmlFile);
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0'
    });

    // Wait for Mermaid diagrams to render
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (typeof mermaid !== 'undefined') {
          // Wait a bit for Mermaid to render
          setTimeout(() => {
            // Check if all Mermaid diagrams are rendered
            const mermaidDivs = document.querySelectorAll('.mermaid');
            let renderedCount = 0;
            const checkRendered = setInterval(() => {
              renderedCount = 0;
              mermaidDivs.forEach(div => {
                if (div.querySelector('svg')) {
                  renderedCount++;
                }
              });
              if (renderedCount === mermaidDivs.length ||
                renderedCount > 0 && Date.now() > Date.now() + 5000) {
                clearInterval(checkRendered);
                resolve();
              }
            }, 100);
          }, 1000);
        } else {
          resolve();
        }
      });
    });

    // Additional wait to ensure all diagrams are fully rendered
    await page.waitForTimeout(2000);

    // Generate PDF
    await page.pdf({
      path: outputFile,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true
    });

    await browser.close();

    // Clean up temp HTML file
    fs.unlinkSync(tempHtmlFile);

    console.log(`✓ PDF file created: ${outputFile}`);
  } catch (error) {
    console.error('Error converting to PDF:', error.message);
    console.error('\nNote: PDF conversion with Mermaid requires puppeteer.');
    console.error('Make sure all dependencies are installed: npm install');
    process.exit(1);
  }
}

async function main() {
  const format = process.argv[2] || 'both';
  const inputFile = process.argv[3] || DEFAULT_INPUT;
  const outputFile = process.argv[4];

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file not found: ${inputFile}`);
    process.exit(1);
  }

  const baseName = path.basename(inputFile, '.md');
  const htmlOutput = outputFile && format === 'html'
    ? outputFile
    : `${baseName}.html`;
  const pdfOutput = outputFile && format === 'pdf'
    ? outputFile
    : `${baseName}.pdf`;

  try {
    if (format === 'html' || format === 'both') {
      await convertToHTML(inputFile, htmlOutput);
    }

    if (format === 'pdf' || format === 'both') {
      await convertToPDF(inputFile, pdfOutput);
    }

    console.log('\n✓ Conversion complete!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
