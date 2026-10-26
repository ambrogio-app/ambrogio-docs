---
title: Backend configuration
description: Environment variables read by the Ambrogio backend at startup.
sidebar:
  label: Backend configuration
---

The backend reads its configuration once, at startup, from environment variables. Changes take effect on the next restart. The configuration code is part of the backend: you set variables and mount [agent files](../agent-configuration/), you do not write code. If a required variable is missing or a value is invalid, the backend does not start: it logs a `server_startup_failed` event that names the variable and the problem, never its value, and prints `Unable to start HTTP server.` to standard error. See [Troubleshooting](../../how-to/troubleshoot/#the-backend-does-not-start).

## Rules for every variable

- `AMBROGIO_ENV` is required in every environment: `development`, `test` or `production`. There is no default.
- A variable set to an empty string counts as unset.
- A default applies either in every environment or only in `development`. In `test` and `production`, a variable whose default is development-only is required.
- Configuration errors name the variable and the condition, for example `Missing environment variable AMBROGIO_ARCHIVE_PATH` or `Invalid environment variable AMBROGIO_HTTP_PORT: expected an integer from 1 to 65535`.
- A local `.env` file is read only by the development command `pnpm dev`, which runs `node --env-file=.env apps/server/dist/main.js`. Variables already set in the shell take precedence over the file. The backend never reads `.env` by itself, and the Docker image contains no `.env`. See [Run the backend from source](../../how-to/run-backend-from-source/).

## Runtime environment

| Variable | Values | Default | Required in production |
|---|---|---|---|
| `AMBROGIO_ENV` | `development`, `test`, `production` | none | yes |

## HTTP listener

| Variable | Values | Default | Required in production |
|---|---|---|---|
| `AMBROGIO_HTTP_HOST` | Non-empty address to listen on. Use `0.0.0.0` in a container. | `127.0.0.1`, development only | yes |
| `AMBROGIO_HTTP_PORT` | Integer, 1–65535. The same port serves HTTP and the WebSocket session. | `3000`, development only | yes |
| `AMBROGIO_PUBLIC_HTTPS` | `true` or `false`. Set `true` when clients reach the backend only over HTTPS, typically through a reverse proxy. Enables the `Strict-Transport-Security` header. | `false`, development only | yes |
| `AMBROGIO_HSTS_MAX_AGE_SECONDS` | Positive integer: `max-age` of the `Strict-Transport-Security` header. | none | when `AMBROGIO_PUBLIC_HTTPS` is `true` |
| `AMBROGIO_ALLOWED_ORIGINS` | Comma-separated web origins allowed to call the API from a browser, for example `https://home.example.com`. Each entry is an exact origin: scheme, host and optional port, with no path and no trailing slash. `*` is not accepted. | unset: no origin is allowed | no |

`AMBROGIO_ALLOWED_ORIGINS` affects two things:

- **CORS** for the `GET` endpoints. With no origins, no CORS headers are sent.
- **The WebSocket session.** A connection request with an `Origin` header is accepted only if the origin is in the list; otherwise it is refused with `403`. Requests without `Origin`, which is the case for the terminal client and the satellite, are always accepted. The web chat runs in a browser and always sends the `Origin` of its page, so that origin must be in the list.

## Conversations

| Variable | Values | Default | Required in production |
|---|---|---|---|
| `AMBROGIO_ARCHIVE_PATH` | Path of the SQLite file that stores conversations. The file is created if it does not exist; its folder must exist and be writable. | none | yes, in every environment |
| `AMBROGIO_LANGUAGE` | `en` or `it`: language of the backend's own messages, agent answers and speech models. Any other value stops the backend from starting. | `en`, every environment | no |
| `AMBROGIO_TIME_ZONE` | IANA time zone of the family, such as `Europe/Rome`. The agents get the current date and time in this zone; see [Current date and time](../agent-configuration/#current-date-and-time). | `UTC`, every environment | no |
| `AMBROGIO_LIST_PAGE_SIZE` | Positive integer: conversations per page when a client does not ask for a size. | `20`, every environment | no |
| `AMBROGIO_MAX_LIST_PAGE_SIZE` | Positive integer: largest page a client may ask for. Must be at least `AMBROGIO_LIST_PAGE_SIZE`. | `100`, every environment | no |

## Agents

| Variable | Values | Default | Required in production |
|---|---|---|---|
| `AMBROGIO_AGENTS_DIR` | Folder of the agent JSON files. See [Agent configuration](../agent-configuration/). | `/etc/ambrogio/agents`, every environment | no |

The agent files name further variables that hold their credentials, such as `MISTRAL_API_KEY`. Those variables are required when a file names them.

## Voice

Voice is disabled when `AMBROGIO_VOICE_LANGUAGES` is unset or empty: no voice variable is read and no speech model is loaded. Text conversations work either way.

| Variable | Values | Default | Required in production |
|---|---|---|---|
| `AMBROGIO_VOICE_LANGUAGES` | Comma-separated list of distinct languages among `it` and `en`, for example `en,it`. It must contain `AMBROGIO_LANGUAGE`. | unset: voice disabled | no |

Each listed language `<L>` (`EN` or `IT`) has a profile:

| Variable | Values | Required |
|---|---|---|
| `AMBROGIO_VOICE_<L>_STT_MODEL_DIR` | Folder of a sherpa-onnx streaming transducer speech recognition model: exactly one file whose name contains `encoder` and ends with `.onnx`, exactly one whose name contains `decoder` and ends with `.onnx`, exactly one whose name contains `joiner` and ends with `.onnx`, and exactly one whose name ends with `tokens.txt`. All readable. | yes |
| `AMBROGIO_VOICE_<L>_MODEL_DIR` | Folder of a sherpa-onnx Piper voice: exactly one `.onnx` file, a `tokens.txt` file and an `espeak-ng-data/` folder. All readable. | yes |

The profile of `AMBROGIO_LANGUAGE` is the active one: its models are loaded before the server starts listening. The variables of the other listed profile are checked but its models are not loaded. Paths are inside the container and may refer to [bundled models](../bundled-models/) or to models mounted into the container. No voice variable has a default.

Speech recognition runs while the client sends the audio: a worker thread decodes each frame as it arrives, using up to two CPU threads, and at `input.end` only the last part remains; see [Limits and timeouts](../limits-and-timeouts/#backend). The model recognises the spoken language by itself; the language of the profile is not passed to it. Real-time recognition needs an x86_64 CPU with AVX2: without AVX2, for example on a low-end Celeron, recognition falls behind and the text arrives after the end of the sentence, with a delay that grows with the length of the turn. Speech synthesis uses up to four CPU threads. Audio has the sample rate of the loaded voice.

## Fixed paths in the Docker image

| Path | Meaning |
|---|---|
| `/etc/ambrogio/agents/` | Default folder of agent files, empty in the image. |
| `/data/` | Empty folder for the conversation archive, meant to be a mounted volume. |
| `/opt/ambrogio/models/` | Bundled multilingual Nemotron 3.5 ASR streaming 0.6B model, `sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-560ms-int8-2026-06-11`, for Italian and English speech recognition. |
| `/opt/ambrogio/voices/` | Bundled Italian and English Piper voices. A mount at this path replaces them. |

## Example files

The backend repository provides:

| File | Purpose |
|---|---|
| `.env.example` | Every variable the backend reads, with empty values except `AMBROGIO_ENV=development`. Copy it to `.env` for development. It repeats no default. |
| `compose.example.yaml` | A production deployment that sets only the variables production requires, plus the bundled voices for English and Italian. |
| `examples/agents/*.json` | Example agent files. See [Agent configuration](../agent-configuration/#examples). |

## Signals

| Signal | Effect |
|---|---|
| `SIGTERM`, `SIGINT` | Stops accepting turns, saves turns in progress as interrupted, closes sessions, then the listener, the voice components, the archive and the MCP connections, and exits. Exit code `0` on a clean stop, `1` if a resource could not be closed or the shutdown took longer than 10 seconds. A second signal does not restart the wait. |

The backend needs up to 10 seconds to stop. `compose.example.yaml` sets `stop_grace_period: 15s` so that Docker does not kill it first; with `docker run` use `--stop-timeout 15`, and with `docker stop` use `--time 15`.

## See also

- [Agent configuration](../agent-configuration/)
- [Limits and timeouts](../limits-and-timeouts/)
