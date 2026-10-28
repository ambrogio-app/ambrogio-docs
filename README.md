<p align="center">
  <img src=".github/logo.svg" alt="Ambrogio" width="160">
</p>

# Ambrogio — user documentation

**Ambrogio**: talk to it like Alexa, chat with it like ChatGPT — one self-hosted AI assistant for your whole homelab. Multi-agent by design: each agent you configure handles one job, such as the house, music, weather or your documents, using the services you already host.

This repository holds the user documentation, for people who install and run Ambrogio at home. It covers the backend, the web chat, the terminal client and the voice satellite.

The site is built with [Astro Starlight](https://starlight.astro.build/). Diagrams use Mermaid through [`astro-mermaid`](https://github.com/joesaby/astro-mermaid).

The site is published at <https://ambrogio-app.github.io/ambrogio-docs/>.

## Structure

Pages follow [Diátaxis](https://diataxis.fr/). Each page is one of four kinds, and stays that kind:

| Folder | Kind | Answers |
|---|---|---|
| `src/content/docs/tutorials/` | Tutorial | "Teach me": a guided path that produces the installation you keep. |
| `src/content/docs/how-to/` | How-to guide | "Help me do X": steps for someone who already knows the basics. |
| `src/content/docs/reference/` | Reference | "What exactly is X": fields, defaults, limits, messages. No instructions, no opinions. |
| `src/content/docs/explanation/` | Explanation | "Why is it like this": architecture, design decisions, trade-offs. |

The folders name the kind of each page; the sidebar, defined in `astro.config.mjs`, is organised by topic in the order a person installs Ambrogio. Each fact lives in one page and the others link to it. `AGENTS.md` has the full rules.

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

## License

[MIT](LICENSE).
