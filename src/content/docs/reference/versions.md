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

Checked on 18 October 2026.

| Program | Latest release | Images | Works with the current clients |
|---|---|---|---|
| Backend | `v0.4.0` | `ghcr.io/ambrogio-app/ambrogio-backend:v0.4.0` (amd64) | yes |
| Terminal client | `v0.1.0` | none, run from a checkout of the tag | yes |
| Web chat | `v0.1.0` | `ghcr.io/ambrogio-app/ambrogio-web:v0.1.0` (amd64, arm64) | yes |
| Satellite | `v0.2.0` | `ghcr.io/ambrogio-app/ambrogio-satellite:v0.2.0` (amd64, arm64) | yes |

All four programs start their numbering at 0.1.0 with the `ambrogio.v1` protocol. The terminal client and the satellite are tested against backend commit `58b0df4`, where the protocol was introduced; it has not changed since, and backend 0.1.0 includes it. The web chat is tested against backend `v0.1.0` (commit `a4578db`).

Backend `v0.1.2` changes only agents with MCP tools: it reads the prompts of the MCP server at every turn and shows tools to the model under their own names. The protocol is the same as in `v0.1.0`, so the clients work with both. The number `v0.1.1` is skipped because it belonged to a withdrawn release.

Backend `v0.3.0` adds the Kokoro voice model. It changes `voice.json`: the field `voiceEngine` is now required, so a file written for `v0.1.2` stops the backend from starting with `Invalid voice configuration file`. Before upgrading, add `"voiceEngine": "piper"` to keep the current voice; see the [configuration reference](../backend-configuration/#voicejson). The protocol is the same as in `v0.1.0`, so the clients work with it. The number `v0.2.0` is skipped because it belonged to a withdrawn release.

Terminal client `v0.1.0` is its first release. Its interface is in Italian or English, chosen with `--language` or the system locale.

Satellite `v0.2.0` replaces the recorded Italian warnings with a generated error tone, two descending notes; the log tells the cause apart. Its configuration does not change.

Backend `v0.4.0` accepts any Kokoro model, voice and language. With `"voiceEngine": "kokoro"`, `voiceSpeaker` is now the number of the voice in the model instead of its name, and `voiceLanguage` is required: write `"voiceSpeaker": 36, "voiceLanguage": "it"` instead of `"voiceSpeaker": "im_nicola"`, and `35` for `if_sara`. See [Voices of `kokoro-multi-lang-v1_0`](../backend-configuration/#voices-of-kokoro-multi-lang-v1_0). Configurations with `piper` do not change. The protocol is the same as in `v0.1.0`, so the clients work with it.

:::note[Withdrawn releases]
Backend releases published between 16 and 18 October 2026 under the tags `v0.1.0`, `v0.1.1` and `v0.2.0` were withdrawn, and the current `v0.1.0` replaced them. If you pulled one of those images or fetched those tags, pull the image again and refresh the tags with `git fetch --tags --force`.
:::

## Release rules

- Backend, satellite and web chat images are published only for Git tags of the form `vMAJOR.MINOR.PATCH`. The image tag equals the Git tag. There is no `latest` tag.
- An image is published only if the repository's checks (model validation and lint, type check, tests, build) and the secret scan pass on the tagged commit.
- Backend images are built for `linux/amd64`. Satellite and web chat images are built for `linux/amd64` and `linux/arm64`.
- The configuration format may still change between versions while Ambrogio is in early development. Check the [configuration reference](../backend-configuration/) after every upgrade.

## Language

The language of the answers comes from the agents' instructions. To talk out loud in a language, you need a [Vosk](https://alphacephei.com/vosk/models) model and a Piper voice for it; see [Change the voice](../../how-to/change-voice/). The voices bundled with the backend are Italian; a Kokoro model gives you voices in several languages, chosen with `voiceSpeaker` and `voiceLanguage`.

The texts written by Ambrogio itself are in English or Italian: the backend's messages follow `language` in [`conversations.json`](../backend-configuration/#conversationsjson), the web chat's interface follows its `language` or the browser, and the terminal client's interface follows `--language` or the system locale. The satellite has no spoken messages: it signals problems with a tone.
