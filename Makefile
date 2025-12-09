info: menu select

menu:
	echo "1 make reset              - Reset project (clean + install)"
	echo "2 make install            - Install dependencies"
	echo "3 make html               - Convert to HTML"
	echo "4 make pdf                - Convert to PDF"
	echo "5 make both               - Convert to HTML and PDF"
	echo "6 make clean              - Remove generated files"
	echo "7 make audit              - Run security audit"
	echo "8 make audit-fix          - Fix security vulnerabilities"
	echo "9 make outdated           - Check for outdated packages"
	echo "10 make update_phony      - Update .PHONY targets"
	echo ""
	echo "Options: file=X           - Specify input file (default: CODE_SUMMARY.md)"
	echo "Example: make html file=docs/README.md"

select:
	read -p ">>> " P ; make menu | grep "^$$P " | cut -d ' ' -f2-3 ; make menu | grep "^$$P " | cut -d ' ' -f2-3 | bash

1 2 3 4 5 6 7 8 9 10:
	make menu | grep "^$@ " | cut -d ' ' -f2-3 | bash

.SILENT:

.PHONY: info menu select reset install html pdf both clean audit audit-fix outdated update_phony

# Default input file
file ?= CODE_SUMMARY.md

reset: clean install
	echo "✓ Project reset complete"

install:
	echo "Installing dependencies..."
	npm install
	echo "✓ Dependencies installed"

html:
	echo "Converting $(file) to HTML..."
	node scripts/convert-markdown.js html $(file)

pdf:
	echo "Converting $(file) to PDF..."
	node scripts/convert-markdown.js pdf $(file)

both:
	echo "Converting $(file) to HTML and PDF..."
	node scripts/convert-markdown.js both $(file)

clean:
	echo "Cleaning generated files..."
	rm -rf node_modules
	rm -f package-lock.json
	rm -f *.html
	rm -f *.pdf
	echo "✓ Clean complete"

audit:
	echo "Running security audit..."
	npm audit

audit-fix:
	echo "Fixing security vulnerabilities..."
	npm audit fix

outdated:
	echo "Checking for outdated packages..."
	npm outdated || true

update_phony:
	echo "##### Updating .PHONY targets #####"
	targets=$$(grep -E '^[a-zA-Z_][a-zA-Z0-9_-]*:' Makefile | grep -v '=' | cut -d: -f1 | tr '\n' ' '); \
	sed -i.bak "s/^\.PHONY:.*/.PHONY: $$targets/" Makefile && \
	echo "Updated .PHONY: $$targets" && \
	rm -f Makefile.bak
