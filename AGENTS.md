# Instructions for agents

This repository contains only the user documentation of Ambrogio: an Astro Starlight site for people who install Ambrogio at home. It has no Reqvire model. The products it describes live in `ambrogio-backend`, `ambrogio-satellite`, `ambrogio-cli` and `ambrogio-web`; together with `ambrogio-model` they form one Reqvire model spread over the repositories, each keeping its part in `system-model/`.

## Where facts come from

- Every statement about behaviour, configuration fields, defaults, limits, messages and versions must be traceable to a contract or requirement of the model, or to the code that implements it. Read the model with `ambrogio-model/scripts/rv` from the workspace folder (see `ambrogio-model/AGENTS.md`) or directly in the `system-model/` folders.
- Do not document behaviour that the model does not record. If the code and the model disagree, report it instead of choosing one.
- The backend owns the protocol and the HTTP API. Each release declares the interface versions it offers (backend) or uses (clients); an incompatible change of an interface is made in the backend and in the clients that use it together, and they are released together, without keeping the previous version. Keep `reference/versions.md` in line with those declarations and with the published tags and images, and state which releases work together. The documentation does not describe the protocol or the HTTP API themselves: only the clients of Ambrogio use them, and the backend's contracts describe them.
- External facts (Home Assistant, sherpa-onnx and the models it runs, such as Nemotron, Piper and Silero VAD) need a check against their official documentation.

## Structure

### One kind per page

Decide the kind of a page before writing it, using <https://diataxis.fr/>, and keep it pure. The folder of a page names its kind:

- **Tutorials** (`tutorials/`): learning by doing, one safe path, concrete commands, visible results at every step, no alternatives or explanations beyond a sentence. A tutorial produces a real installation, the one the reader keeps: there is no trial setup to throw away.
- **How-to guides** (`how-to/`): a goal for a competent reader, numbered steps, prerequisites first, link to reference instead of listing every option.
- **Reference** (`reference/`): structured like the product (files, fields, variables), tables, complete and neutral, no instructions.
- **Explanation** (`explanation/`, the *Concepts* of the sidebar): what a concept means for the person who uses and installs Ambrogio, such as an agent, a turn or the wake word, and why it behaves as it does from their point of view. Direct and short: what the reader needs to understand to use Ambrogio, and nothing more, in about one screen. Plain words, lists rather than paragraphs. This is a user manual: no implementation choices, rejected alternatives, history of decisions, comparisons with other projects or organisation of the code; those belong to the models.

When a page starts mixing kinds, move the foreign part to the page of its kind and link it. A how-to guide links to the concept it relies on the first time it uses it, for example *Add an agent* to what an agent is.

### One home per fact

- Each fact lives in one page; every other page links to it instead of repeating it. Rules, defaults, limits and file layouts live in `reference/`; reasons live in `explanation/`; steps live in a tutorial or a how-to guide.
- System administration, such as backups, upgrades, host setup and Docker itself, is left to the reader: the documentation says only what Ambrogio needs, such as which data to keep.
- The backend, the web chat and the satellite are documented with Docker only: no guide for running them from source or directly on the host, which belongs to the README of each repository. The terminal client, which has no image, runs from a checkout of its release.
- Each component has one installation path: either in a tutorial or in a how-to guide, never in both. *Self-host Ambrogio* installs the backend and the web chat on the reader's server, at the path `tutorials/install-ambrogio/`, kept so that existing links stay valid; the terminal client and the voice satellite have their own how-to guides.
- There is no upgrade guide: with Docker, moving to a new release is changing the image tag. `reference/versions.md` records the current releases and which of them work together; releases earlier than the current ones are not covered. From the current releases on, it records what changes between one release and the next, configuration and database migrations included, without steps.

### Index

The sidebar follows the path of the person who installs Ambrogio, not the four kinds: Introduction, Get started, Clients, Agents and tools, Voice, Operate, Concepts, Reference. The sidebar, set in `astro.config.mjs`, shows no kind: a new page goes in the section of its topic, and its path stays in the folder of its kind, so that existing links stay valid.

### The reader's installation

Tutorials and how-to guides refer to the installation created by *Self-host Ambrogio*: a folder `~/ambrogio` with `compose.yaml`, the private `.env`, the agent files in `agents/` and the web chat's `web/config.json`. The Compose services are `backend`, `database` and `web`. Commands run from that folder.

## Style

- Describe Ambrogio with the standard definition, the same in this site and in the README of every repository: "Talk to it like Alexa, chat with it like ChatGPT — one self-hosted AI assistant for your whole homelab." When more is needed, add: "Multi-agent by design: each agent you configure handles one job, such as the house, music, weather or your documents, using the services you already host." Do not call it a "home assistant", which is confused with Home Assistant.
- English, second person, short sentences, plain words. Say what happens, then why, only where the reader needs it.
- Use exact names: fields, file paths, log events and messages as they appear in the product.
- No marketing tone, no filler introductions or summaries, no emoji.
- Product texts are quoted in English. Italian texts appear only in the `it` or Italian columns of the reference tables that list both languages (`reference/messages.md`, the interface texts of `reference/web-chat.md`), so that a reader who chose Italian can find what they see.
- Quote messages in double quotes, name buttons and list entries in **bold**, and write what the reader says or types in italics with quotes (*"Tell me a fun fact about cats."*).
- Examples and tutorials use English: `"language": "en"`, English models and voices, English questions and agent instructions.

## Brand

`src/brand/`, `public/favicon.svg` and the logos in `.github/` are copies from the private repository `ambrogio-brand`, made by its `scripts/sync`: do not edit them here. `src/styles/theme.css` maps the brand's tokens onto Starlight, and the site has only a light theme: `src/components/ThemeProvider.astro` and `ThemeSelect.astro` replace Starlight's to remove the dark theme and its switch. `src/components/SiteTitle.astro` replaces Starlight's title with the brand's logo and wordmark. Yellow (`--ambrogio-gold-500`) fills highlights and selections with ink text, and the current page in the sidebar is bold without a background; links use the darker `--ambrogio-gold-700`, because yellow text does not read on a light background.

## Links and publishing

`main` accepts changes only through a pull request whose CI and secret scan pass: a GitHub ruleset rejects direct pushes, force pushes and deletion, for everyone. Work on a branch and open a pull request.

The site is published on GitHub Pages at <https://ambrogio-app.github.io/ambrogio-docs/> by `.github/workflows/pages.yml` on every push to `main`, after the CI and the secret scan pass. Because it is served under `/ambrogio-docs/`, links between pages are relative (`../../reference/versions/`), never root-relative (`/reference/versions/`); `npm run check:links` fails on links that leave the base.

## Checks

Secrets never belong in this repository: examples use placeholders. The pre-commit hook in `.githooks/` runs gitleaks on staged changes (enable it with `git config core.hooksPath .githooks`; gitleaks must be on `PATH`), and CI scans the whole history on every push.

```bash
npm run build
```

The build must succeed. Before finishing, check internal links and anchors, and review the pages affected by any product change you documented.
