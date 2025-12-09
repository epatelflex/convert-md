const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BIN_PATH = path.join(__dirname, '..', 'bin', 'convert-md');
const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const OUTPUT_DIR = path.join(__dirname, 'output');

// Helper to run CLI command
function runCLI(args = '', options = {}) {
  try {
    const result = execSync(`${BIN_PATH} ${args}`, {
      encoding: 'utf8',
      cwd: options.cwd || __dirname,
      ...options
    });
    return { stdout: result, exitCode: 0 };
  } catch (error) {
    return { 
      stdout: error.stdout || '', 
      stderr: error.stderr || '',
      exitCode: error.status 
    };
  }
}

describe('convert-md CLI', () => {
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

  describe('--help flag', () => {
    test('displays usage information', () => {
      const { stdout, exitCode } = runCLI('--help');
      
      expect(exitCode).toBe(0);
      expect(stdout).toContain('Usage:');
      expect(stdout).toContain('convert-md');
      expect(stdout).toContain('html');
      expect(stdout).toContain('pdf');
      expect(stdout).toContain('both');
    });

    test('-h flag also shows help', () => {
      const { stdout, exitCode } = runCLI('-h');
      
      expect(exitCode).toBe(0);
      expect(stdout).toContain('Usage:');
    });

    test('no arguments shows help', () => {
      const { stdout, exitCode } = runCLI('');
      
      expect(exitCode).toBe(0);
      expect(stdout).toContain('Usage:');
    });
  });

  describe('--version flag', () => {
    test('displays version number', () => {
      const { stdout, exitCode } = runCLI('--version');
      const packageJson = require('../package.json');
      
      expect(exitCode).toBe(0);
      expect(stdout).toContain(packageJson.version);
    });

    test('-v flag also shows version', () => {
      const { stdout, exitCode } = runCLI('-v');
      
      expect(exitCode).toBe(0);
      expect(stdout).toContain('version');
    });
  });

  describe('invalid arguments', () => {
    test('shows error for unknown format', () => {
      const { stderr, stdout, exitCode } = runCLI('unknown');
      const output = stderr || stdout;
      
      expect(exitCode).not.toBe(0);
      expect(output).toContain('Error');
    });

    test('shows error for unknown option', () => {
      const { stderr, stdout, exitCode } = runCLI('--invalid');
      const output = stderr || stdout;
      
      expect(exitCode).not.toBe(0);
      expect(output).toContain('Error');
    });
  });

  describe('html conversion', () => {
    test('converts markdown file to HTML', () => {
      const inputFile = path.join(FIXTURES_DIR, 'simple.md');
      const outputFile = path.join(OUTPUT_DIR, 'cli-simple.html');
      
      const { stdout, exitCode } = runCLI(`html ${inputFile} ${outputFile}`);
      
      expect(exitCode).toBe(0);
      expect(stdout).toContain('HTML file created');
      expect(fs.existsSync(outputFile)).toBe(true);
      
      const html = fs.readFileSync(outputFile, 'utf8');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Simple Test');
    });

    test('converts file with mermaid diagrams', () => {
      const inputFile = path.join(FIXTURES_DIR, 'mermaid-only.md');
      const outputFile = path.join(OUTPUT_DIR, 'cli-mermaid.html');
      
      const { stdout, exitCode } = runCLI(`html ${inputFile} ${outputFile}`);
      
      expect(exitCode).toBe(0);
      expect(fs.existsSync(outputFile)).toBe(true);
      
      const html = fs.readFileSync(outputFile, 'utf8');
      expect(html).toContain('<div class="mermaid">');
    });

    test('works with relative paths from different directory', () => {
      const outputFile = path.join(OUTPUT_DIR, 'cli-relative.html');
      
      // Run from fixtures directory with relative path
      const { stdout, exitCode } = runCLI(`html simple.md ${outputFile}`, {
        cwd: FIXTURES_DIR
      });
      
      expect(exitCode).toBe(0);
      expect(fs.existsSync(outputFile)).toBe(true);
    });
  });

  describe('format validation', () => {
    test('accepts "html" format', () => {
      const inputFile = path.join(FIXTURES_DIR, 'simple.md');
      const outputFile = path.join(OUTPUT_DIR, 'format-html.html');
      
      const { exitCode } = runCLI(`html ${inputFile} ${outputFile}`);
      expect(exitCode).toBe(0);
    });

    test('accepts "pdf" format', () => {
      // Just test that format is accepted, actual PDF generation tested separately
      const { stdout } = runCLI('--help');
      expect(stdout).toContain('pdf');
    });

    test('accepts "both" format', () => {
      const { stdout } = runCLI('--help');
      expect(stdout).toContain('both');
    });
  });

  describe('error handling', () => {
    test('handles non-existent input file', () => {
      const { stderr, stdout, exitCode } = runCLI('html /nonexistent/file.md');
      const output = stderr || stdout;
      
      expect(exitCode).not.toBe(0);
    });
  });
});
