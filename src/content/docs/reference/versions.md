---
title: Versions and compatibility
description: Which versions of the backend, terminal client, satellite and web chat work together, and where to check.
sidebar:
  label: Versions and compatibility
---

The four programs are released separately. They work together when the clients speak the same protocol as the backend.

## How compatibility is recorded

The backend owns the conversation protocol and the HTTP API. Clients use only those public interfaces. Each release declares the interface versions it offers (backend) or uses (clients):

| Interface | Version | Offered by | Used by |
|---|---|---|---|
| Conversation protocol | `ambrogio.v1` (WebSocket subprotocol) | Backend | Terminal client, web chat, satellite |
| HTTP API (conversation list and history) | `v1`, under `/api/v1/`, errors as Problem Details | Backend | Terminal client and web chat |

The backend and the clients are updated together. The backend offers one version of each interface and does not keep earlier ones. An incompatible change to a public interface is made in the backend and in the clients that use it at the same time, the version in the interface name changes, such as `ambrogio.v2` or `/api/v2/`, and the backend and those clients are released together. A client release works with the backend releases that offer the interface versions it uses; [Current state](#current-state) says which releases work together. The protocol and the HTTP API have separate version cycles: a new HTTP API version does not change the protocol, and the other way round. A change to [`protocol/ambrogio-v1.schema.json`](https://github.com/ambrogio-app/ambrogio-backend/blob/main/protocol/ambrogio-v1.schema.json) that is not a new version is compatible by rule.

## Current state

Release list checked on 31 October 2026. Ambrogio is in preview, and configuration may change between releases. Earlier releases are not covered: use the current ones.

| Program | Latest release | Images | Interfaces |
|---|---|---|---|
| Backend | `v0.18.0` | `ghcr.io/ambrogio-app/ambrogio-backend:v0.18.0` (amd64) | offers `ambrogio.v1` and HTTP API `v1` |
| Terminal client | `v0.4.0` | none, run from a checkout of the tag | uses `ambrogio.v1` and HTTP API `v1` |
| Web chat | `v0.3.2` | `ghcr.io/ambrogio-app/ambrogio-web:v0.3.2` (amd64, arm64) | uses `ambrogio.v1` and HTTP API `v1` |
| Satellite | `v0.9.0` | `ghcr.io/ambrogio-app/ambrogio-satellite:v0.9.0` (amd64, arm64) | uses `ambrogio.v1` |

All four current releases work together. Each client release is tested in CI against the backend under development, through the backend's test entry point.

## Changes from the previous releases

From backend `v0.17.0`, terminal client `v0.3.1`, web chat `v0.3.1` and satellite `v0.8.1`:

- Backend `v0.18.0`: `AMBROGIO_DATABASE_URL` must name a user and a password and contain no `?` or `#`; `PG*` variables are ignored. See [Backend configuration](../backend-configuration/). Empty entries of `AMBROGIO_ALLOWED_ORIGINS` are ignored. New `GET /health` endpoint, used by the image's Docker `HEALTHCHECK`. No database migration.
- Terminal client `v0.4.0`: while a chat waits for its answer, only that chat is blocked; you can open and use other chats. See [Terminal client](../terminal-client/).
- Web chat `v0.3.2`: text you type and do not send stays in its own chat.
- Satellite `v0.9.0`: waits at most 5 seconds for the backend to confirm the session. See [Limits and timeouts](../limits-and-timeouts/).

## Release rules

- Backend, satellite and web chat images are published only for Git tags of the form `vMAJOR.MINOR.PATCH`. The image tag equals the Git tag. There is no `latest` tag.
- An image is published only if the repository's checks (checks of the whole engineering model, type check, tests, build) and the secret scan pass on the tagged commit.
- Backend images are built for `linux/amd64`. Satellite and web chat images are built for `linux/amd64` and `linux/arm64`.

## External services and models

Ambrogio depends on these versions of services, protocols and models it does not own:

| Dependency | Version | Used by |
|---|---|---|
| Model Context Protocol | revision `2025-03-26` or later. The backend's client proposes `2025-11-25` and accepts `2025-06-18` and `2025-03-26` from the server. | Backend, MCP connectors |
| PostgreSQL | 18. The examples use the image `pgvector/pgvector:pg18`, which adds the pgvector extension; the archive uses no extension. | Backend |
| LLM provider APIs | Mistral AI `v1`, OpenAI `v1` (Responses), Anthropic Messages with `anthropic-version: 2023-06-01`, Gemini API `v1beta`, or a Chat Completions API compatible with OpenAI | Backend, see [Agent configuration](../agent-configuration/) |
| Speech recognition and synthesis models: Nemotron 3.5 ASR streaming 0.6B from the sherpa-onnx `asr-models` release, Piper voices from the `tts-models` release | the archives listed in [Bundled models and licenses](../bundled-models/#backend), fixed by SHA-256 | Backend image |
| Keyword spotting model zipformer GigaSpeech 3.3M, from the sherpa-onnx `kws-models` release, and Silero VAD, from the `asr-models` release | the files listed in [Bundled models and licenses](../bundled-models/#satellite), fixed by SHA-256 | Satellite |

## Language

The backend adds the language selected by `AMBROGIO_LANGUAGE` to each answering agent's instructions. The orchestrator only selects an agent. The backend image includes a multilingual Nemotron streaming model for Italian and English recognition, which recognises the spoken language by itself, and Italian and English Piper voices; see [Configure voice](../../how-to/configure-voice/). You can still use external models and voices.

The texts written by Ambrogio itself are in English or Italian: the backend's messages follow `AMBROGIO_LANGUAGE` (see [Backend configuration](../backend-configuration/#conversations)), the web chat's interface follows its `language` or the browser, and the terminal client's interface follows `--language` or the system locale. The satellite has no spoken messages: it signals problems with a tone.
