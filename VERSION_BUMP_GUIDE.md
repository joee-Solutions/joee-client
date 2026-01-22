# Version Bump Guide - Production CI/CD

## Overview

This project uses an automated version bumping system that runs in GitHub Actions CI/CD pipeline. The system automatically increments the version number in `package.json` based on commit message conventions and creates git tags for releases.

## How It Works

### 1. **Trigger Conditions**

The version bump workflow (`version-bump.yml`) runs automatically when:
- ✅ Code is pushed to the `main` branch
- ✅ The commit is NOT a version bump commit itself (prevents infinite loops)
- ✅ The commit message contains `[version-bump]` or `[bump-version]` tag

**Excluded from triggering:**
- ❌ Commits with message starting with `ci: version bump`
- ❌ Commits that only change `package.json` (made by GitHub Actions)
- ❌ Changes to `.md` files, `.gitignore`, or workflow files

### 2. **Version Bump Logic**

The system determines the version bump type based on commit message prefixes:

| Commit Prefix | Version Bump Type | Example |
|--------------|-------------------|---------|
| `feat:` or `feature:` | **Minor** (0.1.62 → 0.2.0) | New features |
| `breaking:` or `major:` | **Major** (0.1.62 → 1.0.0) | Breaking changes |
| Any other prefix | **Patch** (0.1.62 → 0.1.63) | Bug fixes, docs, etc. |

### 3. **Workflow Steps**

1. **Check if version bump needed**
   - Skips if commit message starts with `ci: version bump`
   - Skips if only `package.json` changed by GitHub Actions
   - Proceeds if commit message contains `[version-bump]` or `[bump-version]`

2. **Get current version**
   - Reads version from `package.json`

3. **Bump version**
   - Determines bump type from commit message
   - Runs `npm version <type> --no-git-tag-version`
   - Updates `package.json`

4. **Commit version bump**
   - Commits with message: `ci: version bump to <new-version>`
   - Pushes to `main` branch

5. **Create Git Tag**
   - Creates annotated tag: `v<new-version>`
   - Pushes tag to remote repository

## How to Use

### Option 1: Automatic Version Bump (Recommended)

Include `[version-bump]` or `[bump-version]` in your commit message:

```bash
# For a new feature (minor version bump)
git commit -m "feat: Add offline mode support [version-bump]"

# For a bug fix (patch version bump)
git commit -m "fix: Resolve notification count issue [version-bump]"

# For breaking changes (major version bump)
git commit -m "breaking: Refactor authentication system [version-bump]"
```

### Option 2: Manual Version Bump

You can also manually bump the version using npm scripts:

```bash
# Patch version (0.1.62 → 0.1.63)
npm run version:patch

# Minor version (0.1.62 → 0.2.0)
npm run version:minor

# Major version (0.1.62 → 1.0.0)
npm run version:major
```

Then commit and push:
```bash
git add package.json
git commit -m "ci: version bump to <new-version>"
git push
```

## Preventing Infinite Loops

The system has built-in safeguards to prevent infinite loops:

1. **Commit Message Check**: If commit message starts with `ci: version bump`, the workflow skips
2. **Author Check**: If commit is from GitHub Actions and only `package.json` changed, it skips
3. **Explicit Request**: Only bumps when `[version-bump]` or `[bump-version]` is in the message

## Version Format

The project uses [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., `0.1.62`)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Current Version

Check the current version in `package.json`:
```json
{
  "version": "0.1.38"
}
```

## Git Tags

Each version bump creates a git tag:
- Format: `v<version>` (e.g., `v0.1.62`)
- Type: Annotated tag
- Message: `Release version <version>`

View all tags:
```bash
git tag -l
```

## Production Deployment

When deploying to production:

1. **Ensure version is bumped**: Check that the latest commit on `main` has a version bump
2. **Check git tags**: Verify the latest tag matches the version in `package.json`
3. **Deploy**: Use the version number or git tag for deployment tracking

## Troubleshooting

### Version not bumping?

1. **Check commit message**: Must contain `[version-bump]` or `[bump-version]`
2. **Check branch**: Must be on `main` branch
3. **Check workflow**: View GitHub Actions logs for errors
4. **Check permissions**: Ensure `GITHUB_TOKEN` has write permissions

### Infinite loop?

The workflow should prevent this, but if it happens:
1. Check if commit message starts with `ci: version bump`
2. Check if only `package.json` changed
3. Manually stop the workflow in GitHub Actions

### Wrong version type?

The version type is determined by commit message prefix:
- Use `feat:` for minor bumps
- Use `breaking:` for major bumps
- Use any other prefix for patch bumps

## Best Practices

1. **Always include `[version-bump]`** in commit messages when you want to trigger a version bump
2. **Use semantic commit messages** to ensure correct version bump type
3. **Review version changes** in GitHub Actions before merging
4. **Tag releases** manually if needed for special releases
5. **Document breaking changes** in commit messages when using `breaking:` prefix

## Example Workflow

```bash
# 1. Make changes
git add .
git commit -m "feat: Add offline authentication [version-bump]"
git push origin main

# 2. GitHub Actions automatically:
#    - Detects [version-bump] in commit message
#    - Determines it's a "feat:" so bumps minor version
#    - Updates package.json (0.1.62 → 0.2.0)
#    - Commits: "ci: version bump to 0.2.0"
#    - Creates tag: v0.2.0
#    - Pushes everything

# 3. Production deployment can use:
#    - Version: 0.2.0
#    - Tag: v0.2.0
```

## Related Files

- `.github/workflows/version-bump.yml` - CI/CD workflow
- `package.json` - Version storage
- `package.json` scripts - Manual version bump commands

