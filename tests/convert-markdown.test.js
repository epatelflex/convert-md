const fs = require('fs');
const path = require('path');
const { convertToHTML } = require('../scripts/convert-markdown');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const OUTPUT_DIR = path.join(__dirname, 'output');

describe('convert-markdown', () => {
  beforeAll(() => {
    // Create output directory for test files
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up output directory
    if (fs.existsSync(OUTPUT_DIR)) {
      fs.rmSync(OUTPUT_DIR, { recursive: true });
    }
  });

  describe('convertToHTML', () => {
    test('converts simple markdown to HTML', async () => {
      const inputFile = path.join(FIXTURES_DIR, 'simple.md');
      const outputFile = path.join(OUTPUT_DIR, 'simple.html');

      await convertToHTML(inputFile, outputFile);

      expect(fs.existsSync(outputFile)).toBe(true);
      
      const html = fs.readFileSync(outputFile, 'utf8');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<h1');
      expect(html).toContain('Simple Test');
      expect(html).toContain('Just a simple paragraph');
    });

    test('converts markdown with code blocks', async () => {
      const inputFile = path.join(FIXTURES_DIR, 'sample.md');
      const outputFile = path.join(OUTPUT_DIR, 'sample.html');

      await convertToHTML(inputFile, outputFile);

      const html = fs.readFileSync(outputFile, 'utf8');
      expect(html).toContain('<pre>');
      expect(html).toContain('<code');
      expect(html).toContain('const hello');
    });

    test('wraps mermaid code blocks in div.mermaid', async () => {
      const inputFile = path.join(FIXTURES_DIR, 'mermaid-only.md');
      const outputFile = path.join(OUTPUT_DIR, 'mermaid-only.html');

      await convertToHTML(inputFile, outputFile);

      const html = fs.readFileSync(outputFile, 'utf8');
      expect(html).toContain('<pre class="mermaid">');
      expect(html).toContain('sequenceDiagram');
      expect(html).toContain('flowchart LR');
      // Should have mermaid.js script included
      expect(html).toContain('mermaid.min.js');
    });

    test('converts tables to HTML', async () => {
      const inputFile = path.join(FIXTURES_DIR, 'sample.md');
      const outputFile = path.join(OUTPUT_DIR, 'sample-table.html');

      await convertToHTML(inputFile, outputFile);

      const html = fs.readFileSync(outputFile, 'utf8');
      expect(html).toContain('<table>');
      expect(html).toContain('<th>');
      expect(html).toContain('Name');
      expect(html).toContain('Value');
    });

    test('converts blockquotes', async () => {
      const inputFile = path.join(FIXTURES_DIR, 'sample.md');
      const outputFile = path.join(OUTPUT_DIR, 'sample-blockquote.html');

      await convertToHTML(inputFile, outputFile);

      const html = fs.readFileSync(outputFile, 'utf8');
      expect(html).toContain('<blockquote>');
      expect(html).toContain('This is a blockquote');
    });

    test('converts links', async () => {
      const inputFile = path.join(FIXTURES_DIR, 'sample.md');
      const outputFile = path.join(OUTPUT_DIR, 'sample-links.html');

      await convertToHTML(inputFile, outputFile);

      const html = fs.readFileSync(outputFile, 'utf8');
      expect(html).toContain('<a href="https://example.com"');
      expect(html).toContain('Example');
    });

    test('includes proper CSS styling', async () => {
      const inputFile = path.join(FIXTURES_DIR, 'simple.md');
      const outputFile = path.join(OUTPUT_DIR, 'simple-style.html');

      await convertToHTML(inputFile, outputFile);

      const html = fs.readFileSync(outputFile, 'utf8');
      expect(html).toContain('<style>');
      expect(html).toContain('font-family');
      expect(html).toContain('.mermaid');
    });

    test('sets document title from filename', async () => {
      const inputFile = path.join(FIXTURES_DIR, 'sample.md');
      const outputFile = path.join(OUTPUT_DIR, 'sample-title.html');

      await convertToHTML(inputFile, outputFile);

      const html = fs.readFileSync(outputFile, 'utf8');
      expect(html).toContain('<title>sample</title>');
    });

    test('throws error for non-existent file', async () => {
      const inputFile = path.join(FIXTURES_DIR, 'non-existent.md');
      const outputFile = path.join(OUTPUT_DIR, 'non-existent.html');

      await expect(convertToHTML(inputFile, outputFile)).rejects.toThrow();
    });
  });
});
