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
| HTTP API (conversation list and history) | `v1`, under `/api/v1/`, errors as Problem Details | Backend, from `v0.10.1` | Terminal client and web chat, from `v0.3.0` |

The backend and the clients are updated together. The backend offers one version of each interface and does not keep earlier ones. An incompatible change to a public interface is made in the backend and in the clients that use it at the same time, the version in the interface name changes, such as `ambrogio.v2` or `/api/v2/`, and the backend and those clients are released together. A client release works with the backend releases that offer the interface versions it uses; [Current state](#current-state) says which releases work together. The protocol and the HTTP API have separate version cycles: a new HTTP API version does not change the protocol, and the other way round. A change to [`protocol/ambrogio-v1.schema.json`](https://github.com/ambrogio-app/ambrogio-backend/blob/main/protocol/ambrogio-v1.schema.json) that is not a new version is compatible by rule.

## Current state

Release list checked on 24 October 2026. Ambrogio is in preview, and configuration may change between releases.

| Program | Latest release | Images | Interfaces |
|---|---|---|---|
| Backend | `v0.10.1` | `ghcr.io/ambrogio-app/ambrogio-backend:v0.10.1` (amd64) | offers `ambrogio.v1` and HTTP API `v1` |
| Terminal client | `v0.3.0` | none, run from a checkout of the tag | uses `ambrogio.v1` and HTTP API `v1` |
| Web chat | `v0.3.0` | `ghcr.io/ambrogio-app/ambrogio-web:v0.3.0` (amd64, arm64) | uses `ambrogio.v1` and HTTP API `v1` |
| Satellite | `v0.7.0` | `ghcr.io/ambrogio-app/ambrogio-satellite:v0.7.0` (amd64, arm64) | uses `ambrogio.v1` |

All four current releases work together, and the backend works with every satellite release, since `ambrogio.v1` has not changed. The terminal client `v0.2.0` and the web chat `v0.2.0` read conversations through endpoints without a version in the path, `/api/conversations`, which only backend `v0.10.1` and earlier answer: the next backend release after `v0.10.1` no longer serves them, so upgrade those clients to `v0.3.0` or later before you upgrade the backend. Backend `v0.10.0` was tagged but not published: use `v0.10.1`. The terminal client `v0.3.0` and the web chat `v0.3.0` need a backend that offers HTTP API `v1`, that is `v0.10.1` or later. Each client release is tested in CI against the backend under development, through the backend's test entry point.

## Upgrading to backend `v0.10.1` and satellite `v0.7.0`

Backend `v0.10.1` and satellite `v0.7.0` change the configuration in a way that is not compatible with earlier releases. The conversation protocol does not change. The backend adds [HTTP API `v1`](../http-api/) under `/api/v1/`, with errors as Problem Details, and still answers on the previous endpoints under `/api/conversations`; later backend releases do not.

| Before | From backend `v0.10.1` and satellite `v0.7.0` |
|---|---|
| Backend: TypeScript modules `http.ts`, `conversations.ts` and `voice.ts`, chosen with `AMBROGIO_HTTP_CONFIG_PATH`, `AMBROGIO_CONVERSATIONS_CONFIG_PATH` and `AMBROGIO_VOICE_CONFIG_PATH` | Environment variables read by the backend itself, such as `AMBROGIO_HTTP_PORT`, `AMBROGIO_ARCHIVE_PATH` and `AMBROGIO_VOICE_LANGUAGES` with the `AMBROGIO_VOICE_<L>_*` profile variables. The `*_CONFIG_PATH` variables are no longer read. |
| Backend: agent modules `<id>.ts` with credentials read from `process.env` | Data-only JSON files `<id>.json` that name the variables holding their credentials with `apiKeyEnv`, `tokenEnv` and `clientSecretEnv`. `.ts` files in the agents folder are ignored. |
| Satellite: TypeScript module chosen with `--config` (`/config/satellite.ts` in the image) | Environment variables such as `AMBROGIO_BACKEND_URL` and `AMBROGIO_WAKE_WORD_MODEL`. The satellite takes no arguments; `--config` is refused. |
| No runtime environment | `AMBROGIO_ENV` is required by the backend and the satellite: `development`, `test` or `production`. |
| Defaults repeated in the example modules and Compose files | Each default is applied only by the program; the examples set only the values production requires. |

To upgrade, back up first ([Back up and upgrade](../../how-to/back-up-and-upgrade/)), then:

1. Move each value of your backend modules to the variable listed in [Backend configuration](../backend-configuration/), and add `AMBROGIO_ENV=production`. In production `AMBROGIO_HTTP_HOST`, `AMBROGIO_HTTP_PORT`, `AMBROGIO_PUBLIC_HTTPS` and `AMBROGIO_ARCHIVE_PATH` are required.
2. Rewrite each agent module as a JSON file following [Agent configuration](../agent-configuration/), replacing each secret with the name of its variable, and pass those variables to the backend.
3. Move each value of the satellite module to the variable listed in [Satellite configuration](../satellite-configuration/), add `AMBROGIO_ENV=production`, and remove `--config` and the `/config/satellite.ts` mount.
4. Start from the new `compose.example.yaml` of each repository.

## Release rules

- Backend, satellite and web chat images are published only for Git tags of the form `vMAJOR.MINOR.PATCH`. The image tag equals the Git tag. There is no `latest` tag.
- An image is published only if the repository's checks (checks of the whole engineering model, type check, tests, build) and the secret scan pass on the tagged commit.
- Backend images are built for `linux/amd64`. Satellite and web chat images are built for `linux/amd64` and `linux/arm64`.

## Language

The backend adds the language selected by `AMBROGIO_LANGUAGE` to each answering agent's instructions. The orchestrator only selects an agent. The backend image includes Italian and English Vosk models, Piper voices and a multilingual Kokoro model; see [Change the voice](../../how-to/change-voice/). You can still use external models and voices.

The texts written by Ambrogio itself are in English or Italian: the backend's messages follow `AMBROGIO_LANGUAGE` (see [Backend configuration](../backend-configuration/#conversations)), the web chat's interface follows its `language` or the browser, and the terminal client's interface follows `--language` or the system locale. The satellite has no spoken messages: it signals problems with a tone.
