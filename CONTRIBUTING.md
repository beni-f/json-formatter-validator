# Contributing to JSON Formatter & Validator

Thank you for your interest in contributing! We welcome contributions that improve the extension, fix bugs, or add new features.

## Contribution Guidelines

## **Before You Start**

1. **Check Issues** \- See if your idea/bug is already tracked
2. **Familiarize** \- Read [README.md](https://github.com/beni-f/json-formatter-validator/blob/main/README.md) and test the extension (F5)
3. **Fork & Branch** \- `git checkout -b feature/your-feature-name`

## **Good First Issues**

```text
Fix: Status bar color for invalid JSON
Add: JSON Schema validation support  
Fix: Large file performance (1MB+)
Add: Custom sort order (by value/size)
Add: JSONC comment stripping
```

## Development Workflow

```bash
# 1. Fork & Clone
git clone https://github.com/YOUR-USERNAME/json-formatter-validator.git
cd json-formatter-validator
npm install

# 2. Create feature branch
git checkout -b feature/json-schema-validation

# 3. Make changes + test (F5)
npm run compile
# Test in Extension Host → All features work?

# 4. Commit
git add .
git commit -m "feat: add JSON Schema validation support"

# 5. Push & PR
git push origin feature/json-schema-validation
```

## Pull Request Requirements

**Include:**

* Clear title: `feat: add JSON Schema validation`
* Description: What + Why + Test steps
* Test cases: Updated `test/` files
* Screenshots/GIFs: Visual changes

**Code Standards:**

```text
✓ TypeScript (no errors)
✓ Modular (commands/, utils/, etc.)
✓ Comments for complex logic
✓ Performance tested (1MB JSON)
✓ No breaking changes
```

## Commit Message Format

```
feat: add JSON Schema validation
fix: status bar not updating on validation
docs: update README with new screenshots
refactor: extract validation utils
perf: optimize large file parsing
```

## Testing Your Changes

1. **F5** → Extension Development Host
2. Create test JSON files:  
```text
test/valid.json, test/invalid.json, test/large.json  
```
3. Test **ALL** 7 commands + auto-format
4. Check Output panel: "JSON Formatter Validator"

## Development Scripts

```bash
npm run compile      # Build TypeScript
npm run watch        # Auto-recompile
npm run package      # Create .vsix
vsce package         # Package for testing
```

## Publishing Updates

**Only maintainers:**

```bash
# Bump version in package.json
npm version patch    # 1.0.0 → 1.0.1

# Publish
vsce publish patch
```

## Questions?

* **New feature?** Open "Feature Request" issue
* **Bug?** Use issue template with repro steps
* **Code help?** Ask in PR comments or Discussions

**Happy contributing!** 🎉