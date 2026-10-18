# Ambrogio — user documentation

Documentation for people who install and run [Ambrogio](https://github.com/adrianofoschi/ambrogio-backend), a self-hosted home assistant, in their own home. It covers the three programs: `ambrogio-backend`, `ambrogio-cli` and `ambrogio-satellite`.

The site is built with [Astro Starlight](https://starlight.astro.build/). Diagrams use Mermaid through [`astro-mermaid`](https://github.com/joesaby/astro-mermaid).

## Structure

Pages follow [Diátaxis](https://diataxis.fr/). Each page is one of four kinds, and stays that kind:

| Folder | Kind | Answers |
|---|---|---|
| `src/content/docs/tutorials/` | Tutorial | "Teach me": a guided first experience that always works. |
| `src/content/docs/how-to/` | How-to guide | "Help me do X": steps for someone who already knows the basics. |
| `src/content/docs/reference/` | Reference | "What exactly is X": fields, defaults, limits, messages. No instructions, no opinions. |
| `src/content/docs/explanation/` | Explanation | "Why is it like this": architecture, design decisions, trade-offs. |

The sidebar is defined in `astro.config.mjs`.

## Commands

```bash
npm ci
npm run dev       # local preview at http://localhost:4321
npm run typecheck # astro check
npm run build     # static site in dist/
npm run check:links  # after build: broken internal links and anchors
```

## Secret scanning

Every push and pull request runs [gitleaks](https://github.com/gitleaks/gitleaks) 8.30.1 over the whole history (`.github/workflows/secret-scan.yml`). Locally, a pre-commit hook blocks commits that add secrets. Install gitleaks 8.30.1 and enable the hook once per clone:

```bash
git config core.hooksPath .githooks
```

## Sources of truth

Facts on these pages come from the engineering models (`system-model/`) and the code of the three repositories. When a contract changes there, update the pages that depend on it. `AGENTS.md` describes how.
