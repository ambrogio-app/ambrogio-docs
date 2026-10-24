---
title: Versions and compatibility
description: Which versions of the backend, terminal client, satellite and web chat work together, and where to check.
sidebar:
  label: Versions and compatibility
---

The four programs are released separately. They work together when the clients speak the same protocol as the backend.

## How compatibility is recorded

The backend owns the conversation protocol and the HTTP API. Clients use only those public interfaces, and compatibility follows their versions:

| Interface | Version | Offered by | Used by |
|---|---|---|---|
| Conversation protocol | `ambrogio.v1` (WebSocket subprotocol) | Backend | Terminal client, web chat, satellite |
| HTTP API (conversation list and history) | `v1`, under `/api/v1/`, errors as Problem Details | Backend, from the next release after `v0.9.0` | Terminal client and web chat, from their next releases after `v0.2.0` |
| HTTP API (conversation list and history) | first version, without a version in the path (`/api/conversations`), errors as `{ "error": … }` | Backend, every release; kept while a client release uses it | Terminal client `v0.2.0`, web chat `v0.2.0` |

A client works with every backend release that offers the interface versions it uses. An incompatible change to a public interface gets a new major version, such as `ambrogio.v2` or `/api/v2/`, and the backend keeps offering the previous version while a client release still uses it. The protocol and the HTTP API have separate version cycles: a new HTTP API version does not change the protocol, and the other way round. A change to [`protocol/ambrogio-v1.schema.json`](https://github.com/ambrogio-app/ambrogio-backend/blob/main/protocol/ambrogio-v1.schema.json) that is not a new version is compatible by rule.

## Current state

Release list checked on 23 October 2026. The configuration reference pages describe the next, unreleased versions of the backend and the satellite; for the releases below, read the documentation of their tags. Ambrogio is in preview, and configuration may change between releases.

| Program | Latest release | Images | Works with the current clients |
|---|---|---|---|
| Backend | `v0.9.0` | `ghcr.io/ambrogio-app/ambrogio-backend:v0.9.0` (amd64) | yes |
| Terminal client | `v0.2.0` | none, run from a checkout of the tag | yes |
| Web chat | `v0.2.0` | `ghcr.io/ambrogio-app/ambrogio-web:v0.2.0` (amd64, arm64) | yes |
| Satellite | `v0.6.0` | `ghcr.io/ambrogio-app/ambrogio-satellite:v0.6.0` (amd64, arm64) | yes |

All four programs speak the `ambrogio.v1` protocol, which has not changed since it was introduced, and backend `v0.9.0` offers the same HTTP API as earlier releases. The terminal client `v0.2.0`, the web chat `v0.2.0` and the satellite `v0.6.0` were tested against backend `v0.8.0`; from the next releases, each client is tested in CI against the backend under development, through the backend's test entry point.

When you upgrade, compare your configuration with the [backend configuration](../backend-configuration/), [agent configuration](../agent-configuration/) and [satellite configuration](../satellite-configuration/) references: an older configuration may lack a value that is now required.

## Next release: configuration change

The next backend release after `v0.9.0` and the next satellite release after `v0.6.0`, not yet released, change the configuration in a way that is not compatible with earlier files. The conversation protocol does not change. The backend adds [HTTP API `v1`](../http-api/) under `/api/v1/`, with errors as Problem Details, and keeps the previous endpoints under `/api/conversations`, so the terminal client `v0.2.0` and the web chat `v0.2.0` keep working; their next releases use `v1` and need a backend that offers it.

| Before | From the next release |
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
