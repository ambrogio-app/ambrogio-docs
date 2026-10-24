# Instructions for agents

This repository contains only the user documentation of Ambrogio: an Astro Starlight site for people who install Ambrogio at home. It has no Reqvire model. The products it describes live in `ambrogio-backend`, `ambrogio-satellite`, `ambrogio-cli` and `ambrogio-web`; together with `ambrogio-model` they form one Reqvire model spread over the repositories, each keeping its part in `system-model/`.

## Where facts come from

- Every statement about behaviour, configuration fields, defaults, limits, messages and versions must be traceable to a contract or requirement of the model, or to the code that implements it. Read the model with `ambrogio-model/scripts/rv` from the workspace folder (see `ambrogio-model/AGENTS.md`) or directly in the `system-model/` folders.
- Do not document behaviour that the model does not record. If the code and the model disagree, report it instead of choosing one.
- The backend owns the protocol and the HTTP API. Each release declares the interface versions it offers (backend) or uses (clients); an incompatible change of an interface is made in the backend and in the clients that use it together, and they are released together, without keeping the previous version. Keep `reference/versions.md` in line with those declarations and with the published tags and images, and state which releases work together.
- External facts (Home Assistant, Vosk, sherpa-onnx, openWakeWord) need a check against their official documentation.

## Diátaxis

Decide the kind of a page before writing it, using <https://diataxis.fr/>, and keep it pure:

- **Tutorials** (`tutorials/`): learning by doing, one safe path, concrete commands, visible results at every step, no alternatives or explanations beyond a sentence.
- **How-to guides** (`how-to/`): a goal for a competent reader, numbered steps, prerequisites first, link to reference instead of listing every option.
- **Reference** (`reference/`): structured like the product (files, fields, endpoints), tables, complete and neutral, no instructions.
- **Explanation** (`explanation/`): context, reasons and trade-offs, linked to the decisions in the models.

When a page starts mixing kinds, split it and link the parts.

## Style

- English, second person, short sentences, plain words. Say what happens, then why, only where the reader needs it.
- Use exact names: fields, file paths, log events and messages as they appear in the product.
- No marketing tone, no filler introductions or summaries, no emoji.
- Product texts are quoted in English. Italian texts appear only in the `it` or Italian columns of the reference tables that list both languages (`reference/messages.md`, the interface texts of `reference/web-chat.md`), so that a reader who chose Italian can find what they see.
- Quote messages in double quotes, name buttons and list entries in **bold**, and write what the reader says or types in italics with quotes (*"Tell me a fun fact about cats."*).
- Examples and tutorials use English: `"language": "en"`, English models and voices, English questions and agent instructions.

## Links and publishing

`main` accepts changes only through a pull request whose CI and secret scan pass: a GitHub ruleset rejects direct pushes, force pushes and deletion, for everyone. Work on a branch and open a pull request.

The site is published on GitHub Pages at <https://ambrogio-app.github.io/ambrogio-docs/> by `.github/workflows/pages.yml` on every push to `main`, after the CI and the secret scan pass. Because it is served under `/ambrogio-docs/`, links between pages are relative (`../../reference/versions/`), never root-relative (`/reference/versions/`); `npm run check:links` fails on links that leave the base.

## Checks

Secrets never belong in this repository: examples use placeholders. The pre-commit hook in `.githooks/` runs gitleaks on staged changes (enable it with `git config core.hooksPath .githooks`; gitleaks must be on `PATH`), and CI scans the whole history on every push.

```bash
npm run build
```

The build must succeed. Before finishing, check internal links and anchors, and review the pages affected by any product change you documented.
