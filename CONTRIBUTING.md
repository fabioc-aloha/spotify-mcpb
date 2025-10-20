# Contributing to Spotify MCPB

Thank you for your interest in contributing to Spotify MCPB! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Questions?](#questions)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

There are many ways to contribute to Spotify MCPB:

### 🐛 Report Bugs
Found a bug? [Open an issue](https://github.com/fabioc-aloha/spotify-mcpb/issues/new?template=bug_report.md) with details about the problem.

### 💡 Suggest Features
Have an idea? [Open a feature request](https://github.com/fabioc-aloha/spotify-mcpb/issues/new?template=feature_request.md) to discuss it.

### 📖 Improve Documentation
See a typo or unclear explanation? Documentation improvements are always welcome!

### 🔧 Submit Code
Fix bugs, implement features, or improve performance with pull requests.

### 🎨 Design & UX
Help improve the user experience or create visual assets.

### 🧪 Test & Review
Test changes, review pull requests, and provide feedback.

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Git**
- **Spotify Developer Account** (for testing)
- **GitHub CLI** (optional, for easier workflows)

### Fork & Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/spotify-mcpb.git
   cd spotify-mcpb
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/fabioc-aloha/spotify-mcpb.git
   ```

### Install Dependencies

```bash
npm install
```

### Configure Credentials

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Get your Spotify API credentials:
   - Follow [SETUP.md](SETUP.md) for detailed instructions
   - Add your credentials to `.env`:
     ```env
     SPOTIFY_CLIENT_ID=your_client_id
     SPOTIFY_CLIENT_SECRET=your_client_secret
     SPOTIFY_REFRESH_TOKEN=your_refresh_token
     LOG_LEVEL=debug
     ```

### Run Locally

```bash
npm start
```

You should see:
```json
{"timestamp":"...","level":"info","event":"server_started","name":"spotify-mcpb","version":"0.2.2"}
```

---

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

```bash
# Validate JavaScript syntax
node --check server/index.js

# Test the server
npm start

# Validate manifest (if changed)
mcpb validate manifest.json
```

### 4. Commit Changes

```bash
git add .
git commit -m "type: brief description"
```

See [Commit Guidelines](#commit-guidelines) below.

### 5. Keep Your Fork Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push & Create Pull Request

```bash
git push origin your-branch-name
```

Then open a pull request on GitHub.

---

## Coding Standards

### JavaScript Style

- **ES Modules**: Use `import`/`export`
- **Async/Await**: Use async/await for promises
- **Error Handling**: Always use try/catch blocks
- **Logging**: Use the logging module (`server/logging.js`)
- **Validation**: Validate all inputs using `server/validation.js`

### Code Example

```javascript
import { logInfo, logError } from './logging.js';
import { validateRequired, validateString } from './validation.js';
import { handleError } from './error.js';

async handleMyTool(args) {
  try {
    // Validate inputs
    validateRequired(args, ['param1', 'param2']);
    validateString(args.param1, 'param1', 1, 100);

    // Log the operation
    logInfo('my_tool_called', { param1: args.param1 });

    // Do the work
    const result = await this.someOperation(args);

    // Return MCP-compliant response
    return {
      content: [{
        type: "text",
        text: JSON.stringify(result, null, 2)
      }]
    };

  } catch (error) {
    logError('my_tool_failed', { error: error.message });
    return handleError(error, 'performing operation');
  }
}
```

### File Organization

```
server/
├── index.js                 # Main MCP server
├── spotifyWebController.js  # Spotify API wrapper
├── playlistController.js    # Playlist operations
├── logging.js               # Logging utilities
├── error.js                 # Error handling
└── validation.js            # Input validation
```

### Documentation

- Update `README.md` for user-facing changes
- Update technical docs (`PLAYLIST_FEATURE_PLAN.md`, etc.) for implementation changes
- Add JSDoc comments for complex functions
- Update `CHANGELOG.md` with your changes

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI/CD changes

### Examples

```bash
feat(playlist): add track deduplication to add_tracks tool

- Implemented Set-based deduplication
- Added logging for duplicate detection
- Updated documentation

Closes #42
```

```bash
fix(auth): handle token refresh edge case

Fixed issue where token refresh would fail if called
exactly at expiry time.

Fixes #38
```

```bash
docs: update SETUP.md with clearer OAuth instructions

- Added step-by-step screenshots
- Clarified redirect URI configuration
- Added troubleshooting section
```

### Commit Best Practices

- Use present tense ("add feature" not "added feature")
- Keep subject line under 72 characters
- Reference issues and PRs when applicable
- Explain *what* and *why*, not *how*

---

## Pull Request Process

### Before Submitting

- [ ] **Code runs without errors**
- [ ] **All tests pass** (if applicable)
- [ ] **Documentation updated** (if needed)
- [ ] **CHANGELOG.md updated** (for notable changes)
- [ ] **Commits follow guidelines**
- [ ] **Branch is up to date** with main

### PR Template

When you create a PR, use this template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test these changes?

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] CHANGELOG.md updated
```

### Review Process

1. **Automated Checks**: CI/CD runs automatically
2. **Code Review**: Maintainer reviews your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, maintainer will merge

### After Merge

- Delete your branch
- Update your fork:
  ```bash
  git checkout main
  git pull upstream main
  git push origin main
  ```

---

## Reporting Bugs

### Before Reporting

1. **Search existing issues** - Your bug may already be reported
2. **Update to latest version** - Bug might be fixed
3. **Test with clean setup** - Ensure it's reproducible

### Bug Report Template

Use the [bug report template](https://github.com/fabioc-aloha/spotify-mcpb/issues/new?template=bug_report.md):

**Required Information**:
- Spotify MCPB version
- Operating system (Windows/macOS/Linux)
- Node.js version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages (if any)
- Screenshots (if helpful)

### Security Vulnerabilities

**Do NOT open public issues for security vulnerabilities.**

See [SECURITY.md](SECURITY.md) for reporting security issues privately.

---

## Suggesting Features

### Before Suggesting

1. **Check existing feature requests** - Idea might exist
2. **Review project scope** - Is it aligned with project goals?
3. **Consider alternatives** - Could it be a plugin/extension?

### Feature Request Template

Use the [feature request template](https://github.com/fabioc-aloha/spotify-mcpb/issues/new?template=feature_request.md):

**Include**:
- Clear use case
- Why this benefits users
- Proposed implementation (optional)
- Alternatives considered
- Additional context

---

## Development Tips

### Debugging

Enable debug logging:
```env
LOG_LEVEL=debug
```

View structured logs:
```bash
npm start 2>&1 | jq
```

### Testing with Claude Desktop

1. Build the bundle:
   ```bash
   mcpb pack . spotify-mcpb-dev.mcpb
   ```

2. Install in Claude Desktop (double-click `.mcpb` file)

3. Test your changes through Claude

### Common Issues

**"No active device" error**
- Open Spotify on any device
- Start playing something

**"Authentication failed"**
- Check your `.env` credentials
- Regenerate refresh token if needed

**"Rate limit exceeded"**
- Spotify API has rate limits
- Wait a few minutes and retry

---

## Project Structure

```
spotify-mcpb/
├── server/
│   ├── index.js                 # Main MCP server (16 tools)
│   ├── spotifyWebController.js  # Spotify Web API wrapper
│   ├── playlistController.js    # Playlist operations
│   ├── logging.js               # Structured logging
│   ├── error.js                 # Error handling
│   └── validation.js            # Input validation
├── .github/
│   ├── ISSUE_TEMPLATE/          # Issue templates
│   └── pull_request_template.md # PR template
├── manifest.json                # MCPB manifest
├── package.json                 # Dependencies
├── .env.example                 # Credential template
├── README.md                    # Main documentation
├── SETUP.md                     # Setup guide
├── BUNDLE.md                    # Bundle creation guide
├── CHANGELOG.md                 # Version history
└── [other docs]
```

---

## Questions?

- **General Questions**: [Open a discussion](https://github.com/fabioc-aloha/spotify-mcpb/discussions)
- **Bug Reports**: [Open an issue](https://github.com/fabioc-aloha/spotify-mcpb/issues)
- **Feature Requests**: [Open a feature request](https://github.com/fabioc-aloha/spotify-mcpb/issues/new?template=feature_request.md)
- **Security Issues**: See [SECURITY.md](SECURITY.md)

---

## Attribution

This Contributing Guide is adapted from:
- [Contributor Covenant](https://www.contributor-covenant.org/)
- [Open Source Guide](https://opensource.guide/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## License

By contributing to Spotify MCPB, you agree that your contributions will be licensed under the [MIT License](LICENSE.md).

---

**Thank you for contributing to Spotify MCPB! 🎵**

Your contributions help make AI-powered Spotify control accessible to everyone.
