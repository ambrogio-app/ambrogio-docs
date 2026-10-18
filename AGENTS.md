# Instructions for agents

This repository contains only the user documentation of Ambrogio: an Astro Starlight site for people who install Ambrogio at home. It has no Reqvire model. The products it describes live in `ambrogio-backend`, `ambrogio-cli` and `ambrogio-satellite`, each with its own model in `system-model/`.

## Where facts come from

- Every statement about behaviour, configuration fields, defaults, limits, messages and versions must be traceable to a contract or requirement in one of the three models, or to the code that implements it. Read them through the Reqvire MCP server of the repository concerned (`reqvire-backend` on 8082, `reqvire-cli` on 8083, `reqvire-satellite` on 8084) or directly in `system-model/`. Do not treat the three models as one graph.
- Do not document behaviour that the models do not record. If the code and the model disagree, report it instead of choosing one.
- The backend owns the protocol and the HTTP API; the clients record the backend revision they are compatible with. Keep `reference/versions.md` in line with those records and with the published tags and images.
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
- Italian product texts (voice messages, terminal interface) are quoted in Italian.

## Checks

Secrets never belong in this repository: examples use placeholders. The pre-commit hook in `.githooks/` runs gitleaks on staged changes (enable it with `git config core.hooksPath .githooks`; gitleaks must be on `PATH`), and CI scans the whole history on every push.

```bash
npm run build
```

The build must succeed. Before finishing, check internal links and anchors, and review the pages affected by any product change you documented.
