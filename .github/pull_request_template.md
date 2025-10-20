## Description
Brief description of what this PR does.

## Type of Change
<!-- Mark the relevant option with an [x] -->
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update (changes to documentation only)
- [ ] 🔧 Code refactoring (no functional changes, no api changes)
- [ ] 🎨 Style changes (formatting, missing semi colons, etc; no code changes)
- [ ] 🧪 Tests (adding missing tests or correcting existing tests)
- [ ] 🔨 Build/CI changes (changes that affect the build system or CI/CD)

## Changes Made
<!-- Provide a detailed list of changes -->
-
-
-

## Related Issues
<!-- Link any related issues -->
- Fixes #(issue number)
- Closes #(issue number)
- Related to #(issue number)

## Testing
<!-- Describe how you tested your changes -->

### Manual Testing
- [ ] Tested locally with `npm start`
- [ ] Tested bundle creation with `mcpb pack`
- [ ] Tested bundle installation in Claude Desktop
- [ ] Verified all affected tools still work
- [ ] Tested error scenarios

### Specific Test Cases
1.
2.
3.

## Screenshots/Recordings
<!-- Add screenshots or recordings if applicable -->

## Checklist
<!-- Mark completed items with [x] -->

### Code Quality
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works (if applicable)

### Documentation
- [ ] I have updated the documentation accordingly
- [ ] I have updated `CHANGELOG.md` with my changes (for notable changes)
- [ ] Any new environment variables are documented in `.env.example`

### Dependencies
- [ ] I have updated `package.json` if I added/removed dependencies
- [ ] I have updated `manifest.json` if I added/removed tools
- [ ] All new dependencies are necessary and well-maintained

### Compatibility
- [ ] My changes are compatible with Windows, macOS, and Linux
- [ ] My changes work with both Premium and Free Spotify accounts (where applicable)
- [ ] My changes maintain backward compatibility (or breaking changes are documented)

### Security
- [ ] I have not introduced any security vulnerabilities
- [ ] I have not hardcoded any secrets or API keys
- [ ] I have properly validated all user inputs
- [ ] I have followed secure coding practices

## Bundle Impact
<!-- If this affects the MCPB bundle -->
- [ ] Bundle size impact: <!-- e.g., +50KB, -20KB, no change -->
- [ ] New tools added: <!-- list new tools -->
- [ ] Changed tool signatures: <!-- list changed tools -->
- [ ] Manifest version bump needed: <!-- yes/no -->

## API Changes
<!-- If this affects Spotify API usage -->
- [ ] Uses existing Spotify APIs correctly
- [ ] Handles Spotify API rate limits appropriately
- [ ] OAuth scopes are sufficient for new functionality
- [ ] Error handling covers Spotify API error cases

## Additional Notes
<!-- Any additional information about the PR -->

---

### For Maintainers

**Review Checklist:**
- [ ] Code review completed
- [ ] All CI checks passing
- [ ] Documentation is accurate and complete
- [ ] Bundle builds successfully
- [ ] Manual testing performed
- [ ] Security implications considered
- [ ] Backward compatibility verified
