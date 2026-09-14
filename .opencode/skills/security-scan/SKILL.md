---
name: security-scan
description: Scan your AI agent configuration (.opencode/ directory) for security vulnerabilities, misconfigurations, and injection risks using AgentShield. Checks instructions, opencode.json, MCP servers, hooks, and agent definitions. Use when auditing agent config — instructions, opencode.json, MCP servers, hooks, or agent definitions.
metadata:
  origin: ECC
---

# Security Scan Skill

Audit your AI agent configuration for security issues using [AgentShield](https://github.com/affaan-m/agentshield).

Adapted from ECC for OpenCode (original targets `.claude/`; same checks apply to `.opencode/`).

## When to Activate

- Setting up a new agent project
- After modifying `opencode.json`, `AGENTS.md`, or MCP configs
- Before committing configuration changes
- When onboarding to a new repository with existing agent configs
- Periodic security hygiene checks

## What It Scans

| File | Checks |
|------|--------|
| `AGENTS.md` | Hardcoded secrets, auto-run instructions, prompt injection patterns |
| `opencode.json` | Overly permissive allow lists, missing deny lists, dangerous bypass flags |
| MCP servers | Risky MCP servers, hardcoded env secrets, npx supply chain risks |
| `hooks/` | Command injection via interpolation, data exfiltration, silent error suppression |
| `agents/*.md` | Unrestricted tool access, prompt injection surface, missing model specs |

## Prerequisites

AgentShield must be installed. Check and install if needed:

```bash
# Check if installed
npx ecc-agentshield --version

# Install globally (recommended)
npm install -g ecc-agentshield

# Or run directly via npx (no install needed)
npx ecc-agentshield scan .
```

## Usage

### Basic Scan

```bash
# Scan current project
npx ecc-agentshield scan

# Scan a specific path
npx ecc-agentshield scan --path /path/to/.opencode

# Scan with minimum severity filter
npx ecc-agentshield scan --min-severity medium
```

### Output Formats

```bash
# Terminal output (default) — colored report with grade
npx ecc-agentshield scan

# JSON — for CI/CD integration
npx ecc-agentshield scan --format json

# Markdown — for documentation
npx ecc-agentshield scan --format markdown

# HTML — self-contained dark-theme report
npx ecc-agentshield scan --format html > security-report.html
```

### Auto-Fix

Apply safe fixes automatically (only fixes marked as auto-fixable):

```bash
npx ecc-agentshield scan --fix
```

This will:
- Replace hardcoded secrets with environment variable references
- Tighten wildcard permissions to scoped alternatives
- Never modify manual-only suggestions

## Severity Levels

| Grade | Score | Meaning |
|-------|-------|---------|
| A | 90-100 | Secure configuration |
| B | 75-89 | Minor issues |
| C | 60-74 | Needs attention |
| D | 40-59 | Significant risks |
| F | 0-39 | Critical vulnerabilities |

## Interpreting Results

### Critical Findings (fix immediately)
- Hardcoded API keys or tokens in config files
- `Bash(*)` in the allow list (unrestricted shell access)
- Command injection in hooks via `${file}` interpolation
- Shell-running MCP servers

### High Findings (fix before production)
- Auto-run instructions in AGENTS.md (prompt injection vector)
- Missing deny lists in permissions
- Agents with unnecessary Bash access

### Medium Findings (recommended)
- Silent error suppression in hooks (`2>/dev/null`, `|| true`)
- Missing PreToolUse security hooks
- `npx -y` auto-install in MCP server configs

### Info Findings (awareness)
- Missing descriptions on MCP servers
- Prohibitive instructions correctly flagged as good practice

## Links

- **GitHub**: [github.com/affaan-m/agentshield](https://github.com/affaan-m/agentshield)
- **npm**: [npmjs.com/package/ecc-agentshield](https://www.npmjs.com/package/ecc-agentshield)
