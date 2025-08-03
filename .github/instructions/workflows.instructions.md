---
applyTo: ".github/workflows/**/*.yml"
description: "GitHub Actions workflow standards"
---

# GitHub Actions Workflow Guidelines

## Workflow Structure

- Use reusable workflows for common tasks
- Implement proper error handling and validation
- Use semantic versioning for releases
- Follow conventional commit messages

## Security and Best Practices

- Use proper secrets management
- Implement least privilege permissions
- Use specific action versions (not @main)
- Add proper workflow documentation

## Release Process

- Manual releases through GitHub Actions workflows
- Beta versions published on PR merge to main
- Stable releases require manual workflow dispatch
- Generate comprehensive release notes automatically
