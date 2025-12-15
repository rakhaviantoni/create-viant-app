# Security Policy

## Supported Versions

We actively support the following versions of Viant with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | ✅ Yes             |
| 1.x.x   | ❌ No              |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in Viant, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **[rakhaviantoni@gmail.com](mailto:rakhaviantoni@gmail.com)**

Include the following information:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Any suggested fixes (if you have them)

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt of your report within 48 hours
- **Initial Assessment**: We'll provide an initial assessment within 5 business days
- **Updates**: We'll keep you informed of our progress
- **Resolution**: We'll work to resolve the issue as quickly as possible
- **Credit**: We'll credit you in the security advisory (unless you prefer to remain anonymous)

### Security Best Practices

When using Viant:

1. **Keep Updated**: Always use the latest version
2. **Verify Downloads**: Only download from official sources (npm, GitHub releases)
3. **Review Generated Code**: Review the generated project code before deployment
4. **Dependency Security**: Regularly update dependencies in generated projects
5. **Environment Variables**: Never commit sensitive environment variables

### Common Security Considerations

#### Generated Projects
- Generated projects include dependencies that should be kept up to date
- Review and configure security headers for production deployments
- Use HTTPS in production environments
- Implement proper authentication and authorization

#### CLI Usage
- The CLI creates files and directories - ensure you have proper permissions
- Be cautious when running the CLI with elevated privileges
- Verify the integrity of templates and generated code

### Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported
2. **Day 1-2**: Acknowledgment sent
3. **Day 3-7**: Initial assessment and triage
4. **Day 8-30**: Development of fix (timeline depends on severity)
5. **Day 30+**: Public disclosure after fix is released

### Security Updates

Security updates will be:
- Released as patch versions (e.g., 2.0.1 → 2.0.2)
- Documented in the CHANGELOG.md
- Announced in GitHub releases
- Published to npm immediately

### Scope

This security policy covers:
- The Viant CLI tool itself
- Template generation process
- Generated project templates
- Dependencies included in the CLI

This policy does NOT cover:
- Third-party dependencies in generated projects (report to respective maintainers)
- User-modified code in generated projects
- Deployment environments or hosting platforms

### Contact

For security-related questions or concerns:
- **Email**: [rakhaviantoni@gmail.com](mailto:rakhaviantoni@gmail.com)
- **Subject**: [SECURITY] Viant - [Brief Description]

Thank you for helping keep Viant and our community safe! 🔒