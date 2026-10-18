---
title: Versions and compatibility
description: Which versions of the backend, terminal client and satellite work together, and where to check.
sidebar:
  label: Versions and compatibility
---

The three programs are released separately. They work together when the clients speak the same protocol as the backend.

## How compatibility is recorded

The backend owns the conversation protocol and the HTTP API. Each client records the exact backend revision it is tested against:

| Client | Where the backend revision is recorded |
|---|---|
| Terminal client | `system-model/Contracts/TerminalConversation.md`, section *Contratti pubblici del backend Ambrogio* |
| Satellite | `system-model/Contracts/VoiceSatellite.md`, section *Contratto vocale backend di riferimento* |

Before upgrading, check that the backend you plan to run is that revision or a later one with the same protocol. A change to [`protocol/ambrogio-v1.schema.json`](https://github.com/adrianofoschi/ambrogio-backend/blob/main/protocol/ambrogio-v1.schema.json) in the backend is the thing to look for. An incompatible change gets a new subprotocol name, such as `ambrogio.v2`.

## Current state

Checked on 18 October 2026.

| Program | Latest release | Images | Works with the current clients |
|---|---|---|---|
| Backend | `v0.2.0` | `ghcr.io/adrianofoschi/ambrogio-backend:v0.2.0` (amd64) | yes |
| Terminal client | none, version 0.1.0 on `main` | none, run from a checkout | yes |
| Satellite | `v0.1.0` | `ghcr.io/adrianofoschi/ambrogio-satellite:v0.1.0` (amd64, arm64) | yes |

Backend 0.2.0 is the first release with the `ambrogio.v1` protocol. Both clients are tested against backend commit `f262e92`, where the protocol was introduced; it has not changed since, and 0.2.0 includes it.

:::caution[Backend 0.1.x does not work with the clients]
Backend `v0.1.0` and `v0.1.1` predate `ambrogio.v1`. They use an earlier protocol and do not work with the current terminal client and satellite. Use 0.2.0 or later.
:::

## Release rules

- Backend and satellite images are published only for Git tags of the form `vMAJOR.MINOR.PATCH`. The image tag equals the Git tag. There is no `latest` tag.
- An image is published only if the repository's checks (model validation and lint, type check, tests, build) and the secret scan pass on the tagged commit.
- Backend images are built for `linux/amd64`. Satellite images are built for `linux/amd64` and `linux/arm64`.
- The configuration format may still change between versions while Ambrogio is in early development. Check the [configuration reference](/reference/backend-configuration/) after every upgrade.

## Language

Ambrogio currently speaks Italian: the bundled voices, the satellite's recorded messages and the terminal client's interface are Italian. The backend's own messages can be English or Italian.
