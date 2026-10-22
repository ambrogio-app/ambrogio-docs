---
title: Versions and compatibility
description: Which versions of the backend, terminal client, satellite and web chat work together, and where to check.
sidebar:
  label: Versions and compatibility
---

The four programs are released separately. They work together when the clients speak the same protocol as the backend.

## How compatibility is recorded

The backend owns the conversation protocol and the HTTP API. Each client records the exact backend revision it is tested against:

| Client | Where the backend revision is recorded |
|---|---|
| Terminal client | `system-model/Contracts/TerminalConversation.md`, section *Contratti pubblici del backend Ambrogio* |
| Web chat | `system-model/Contracts/WebConversation.md`, section *Contratti pubblici del backend Ambrogio* |
| Satellite | `system-model/Contracts/VoiceSatellite.md`, section *Contratto vocale backend di riferimento* |

Before upgrading, check that the backend you plan to run is that revision or a later one with the same protocol. A change to [`protocol/ambrogio-v1.schema.json`](https://github.com/ambrogio-app/ambrogio-backend/blob/main/protocol/ambrogio-v1.schema.json) in the backend is the thing to look for. An incompatible change gets a new subprotocol name, such as `ambrogio.v2`.

## Current state

Checked on 22 October 2026. Ambrogio is in preview: this documentation describes only the latest releases, and the configuration may change from one release to the next.

| Program | Latest release | Images | Works with the current clients |
|---|---|---|---|
| Backend | `v0.7.0` | `ghcr.io/ambrogio-app/ambrogio-backend:v0.7.0` (amd64) | yes |
| Terminal client | `v0.1.0` | none, run from a checkout of the tag | yes |
| Web chat | `v0.1.0` | `ghcr.io/ambrogio-app/ambrogio-web:v0.1.0` (amd64, arm64) | yes |
| Satellite | `v0.4.0` | `ghcr.io/ambrogio-app/ambrogio-satellite:v0.4.0` (amd64, arm64) | yes |

All four programs speak the `ambrogio.v1` protocol, which has not changed since it was introduced. The terminal client and the satellite are tested against backend commit `58b0df4`, where the protocol was introduced; the web chat against backend `v0.1.0` (commit `a4578db`).

When you upgrade, compare your files with the [backend configuration](../backend-configuration/), [agent configuration](../agent-configuration/) and [satellite configuration](../satellite-configuration/) references: an older file may lack a field that is now required.

## Release rules

- Backend, satellite and web chat images are published only for Git tags of the form `vMAJOR.MINOR.PATCH`. The image tag equals the Git tag. There is no `latest` tag.
- An image is published only if the repository's checks (model validation and lint, type check, tests, build) and the secret scan pass on the tagged commit.
- Backend images are built for `linux/amd64`. Satellite and web chat images are built for `linux/amd64` and `linux/arm64`.

## Language

The backend adds the language selected in `conversations.json` to each answering agent's instructions. The orchestrator only selects an agent. The backend image includes Italian and English Vosk models, Piper voices and a multilingual Kokoro model; see [Change the voice](../../how-to/change-voice/). You can still use external models and voices.

The texts written by Ambrogio itself are in English or Italian: the backend's messages follow `language` in [`conversations.json`](../backend-configuration/#conversationsjson), the web chat's interface follows its `language` or the browser, and the terminal client's interface follows `--language` or the system locale. The satellite has no spoken messages: it signals problems with a tone.
