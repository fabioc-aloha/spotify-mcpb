# Security Policy

## Supported Versions

We actively support the following versions of Spotify MCPB with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| 0.1.x   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them responsibly through one of the following methods:

### Private Security Advisory (Preferred)

1. Go to the [Security tab](https://github.com/fabioc-aloha/spotify-mcpb/security) on GitHub
2. Click "Report a vulnerability"
3. Fill out the security advisory form
4. Click "Submit report"

### Email

Send an email to: **fabioc.aloha@gmail.com**

**Subject**: `[SECURITY] Spotify MCPB Vulnerability Report`

**Include**:
- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

## Response Timeline

We take security vulnerabilities seriously and will respond promptly:

- **Acknowledgment**: Within 48 hours of report
- **Initial Assessment**: Within 1 week
- **Status Updates**: Weekly until resolution
- **Fix Timeline**: Depends on severity (see below)

## Severity Levels

### Critical (Fix within 1 day)
- Remote code execution
- Authentication bypass
- Privilege escalation
- Data exposure affecting multiple users

### High (Fix within 1 week)
- Local code execution
- Significant data exposure
- Authentication issues affecting single user

### Medium (Fix within 1 month)
- Information disclosure
- Denial of service
- Minor authentication issues

### Low (Fix within next release)
- Minor information leaks
- Non-exploitable issues
- Security best practice improvements

## Security Measures

### Code Security
- **Input Validation**: All user inputs are validated using `server/validation.js`
- **Error Handling**: Structured error handling prevents information leakage
- **Logging**: Sensitive data is sanitized from logs
- **Dependencies**: Regular security audits using `npm audit`

### Credential Security
- **No Secrets in Code**: No API keys or tokens are hardcoded
- **Environment Variables**: Credentials stored in `.env` files (not committed)
- **User Configuration**: MCPB bundle uses secure user config for credentials
- **Token Refresh**: Automatic OAuth token refresh prevents long-lived tokens

### API Security
- **OAuth 2.0**: Secure authentication with Spotify Web API
- **Rate Limiting**: Respectful API usage with built-in rate limiting
- **HTTPS Only**: All API communications use HTTPS
- **Scope Limiting**: Minimal required OAuth scopes

### Bundle Security
- **No Bundled Secrets**: `.mcpb` bundles contain no sensitive information
- **Dependency Scanning**: All bundled dependencies are security-scanned
- **Manifest Validation**: MCPB manifests are validated for security compliance

## Vulnerability Disclosure Process

1. **Report Received**: We acknowledge receipt within 48 hours
2. **Initial Triage**: We assess severity and impact within 1 week
3. **Investigation**: We investigate and develop a fix
4. **Coordination**: We work with reporter on disclosure timeline
5. **Fix Development**: We develop and test the security fix
6. **Security Advisory**: We prepare a GitHub Security Advisory (if public disclosure is appropriate)
7. **Release**: We release the security fix
8. **Public Disclosure**: We publicly disclose the vulnerability (coordinated with reporter)

## Security Best Practices for Users

### Credential Management
- **Unique Credentials**: Use dedicated Spotify app credentials for this project
- **Secure Storage**: Keep `.env` files secure and never commit them
- **Regular Rotation**: Rotate refresh tokens if you suspect compromise
- **Access Review**: Regularly review authorized applications in [Spotify Account Settings](https://www.spotify.com/account/apps/)

### Environment Security
- **Updated Software**: Keep Node.js and dependencies updated
- **Secure Network**: Use trusted networks for API communications
- **File Permissions**: Secure file permissions on credential files
- **Logging Security**: Be cautious with log files containing sensitive data

### Bundle Installation
- **Official Sources**: Only install bundles from official releases
- **Checksum Verification**: Verify bundle integrity when possible
- **Review Permissions**: Understand what permissions the bundle requires
- **Monitor Activity**: Monitor your Spotify account for unexpected activity

## Known Security Considerations

### OAuth Token Management
- **Refresh Tokens**: Long-lived tokens require secure storage
- **Token Scope**: Tokens have access to user's Spotify account within granted scopes
- **Token Revocation**: Users can revoke access anytime via Spotify settings

### Third-Party Dependencies
- **NPM Packages**: Bundle includes third-party packages (see `package.json`)
- **Dependency Updates**: We monitor and update dependencies for security
- **Supply Chain**: We use `npm audit` and GitHub security alerts

### Local Execution
- **Local Server**: MCP server runs locally with access to user's environment
- **File System**: Limited file system access for logging and configuration
- **Network**: Makes HTTPS requests to Spotify Web API only

## Security Contact

For security-related questions or concerns:

- **Email**: fabioc.aloha@gmail.com
- **GitHub Security**: [Security tab](https://github.com/fabioc-aloha/spotify-mcpb/security)
- **Response Time**: Within 48 hours

## Security Updates

Security updates are distributed through:
- **GitHub Releases**: New bundle versions with security fixes
- **Security Advisories**: Public notifications for significant issues
- **CHANGELOG.md**: Documentation of security-related changes

## Acknowledgments

We appreciate the security community and responsible disclosure:

- **Security Researchers**: Thank you for responsible disclosure
- **Bug Bounty**: Currently no formal program, but contributions are acknowledged
- **Recognition**: Security contributors are credited (with permission) in release notes

## Legal

This security policy is provided in good faith. Spotify MCPB is an open-source project provided "as is" under the MIT License. See [LICENSE.md](LICENSE.md) for full license terms.

---

**Last Updated**: October 20, 2025
**Version**: 1.0
**Next Review**: January 20, 2026
