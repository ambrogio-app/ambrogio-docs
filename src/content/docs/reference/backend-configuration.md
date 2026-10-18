---
title: Backend configuration
description: Environment variables, files and fields read by the Ambrogio backend at startup.
sidebar:
  label: Backend configuration
---

The backend reads its configuration once, at startup. Changes take effect on the next restart. If a required file is missing or a value is invalid, the backend does not start: it logs a `server_startup_failed` event that names the problem and prints `Unable to start HTTP server.` to standard error. See [Troubleshooting](../../how-to/troubleshoot/#the-backend-does-not-start).

Environment variables only say *where* the files are. They never replace a value inside a file.

## Environment variables

| Variable | Required | Meaning |
|---|---|---|
| `AMBROGIO_HTTP_CONFIG_PATH` | yes | Path of [`http.json`](#httpjson). |
| `AMBROGIO_CONVERSATIONS_CONFIG_PATH` | yes | Path of [`conversations.json`](#conversationsjson). |
| `AMBROGIO_VOICE_CONFIG_PATH` | no | Path of [`voice.json`](#voicejson). If the variable is not set, voice is disabled. If it is set to an empty string, startup fails. |

File names are up to you; the names on this page are conventions.

## Fixed paths

| Path | Meaning |
|---|---|
| `/etc/ambrogio/agents/` | Folder of agent files. Cannot be changed. See [Agent configuration](../agent-configuration/). |
| `/opt/ambrogio/voices/` | Bundled voices, in the Docker image only. A mount at this path replaces them. |

## `http.json`

Network listener and HTTP security settings.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `host` | string | required | Address to listen on. Use `0.0.0.0` in a container. |
| `port` | integer, 1–65535 | required | Port to listen on. The same port serves HTTP and the WebSocket session. |
| `allowedOrigins` | array of strings | `[]` | Web origins allowed to call the API from a browser, for example `"https://home.example.com"`. Each entry is an exact origin: scheme, host and optional port, with no path and no trailing slash. `"*"` is not accepted. |
| `publicHttps` | boolean | `false` | Set to `true` when clients reach the backend only over HTTPS, typically through a reverse proxy. Enables the `Strict-Transport-Security` header. |
| `hstsMaxAgeSeconds` | positive integer | none | `max-age` of the `Strict-Transport-Security` header. Required when `publicHttps` is `true`. |

`allowedOrigins` affects two things:

- **CORS** for the `GET` endpoints. With an empty list, no CORS headers are sent.
- **The WebSocket session.** A connection request with an `Origin` header is accepted only if the origin is in the list; otherwise it is refused with `403`. Requests without `Origin`, which is the case for the terminal client and the satellite, are always accepted. The web chat runs in a browser and always sends the `Origin` of its page, so that origin must be in the list.

Example:

```json
{
  "host": "0.0.0.0",
  "port": 3000,
  "allowedOrigins": [],
  "publicHttps": true,
  "hstsMaxAgeSeconds": 31536000
}
```

## `conversations.json`

Conversation storage, language and list pages.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `archivePath` | string | required | Path of the SQLite file that stores conversations. The file is created if it does not exist; its folder must exist and be writable. |
| `language` | string | `"en"` | Language of the backend's own messages, such as errors and refusals: `"it"` or `"en"`. Any other string falls back to `"en"`. It does not change the language of the agents' answers. |
| `listPageSize` | positive integer | `20` | Conversations per page when a client does not ask for a size. |
| `maxListPageSize` | positive integer | `100` | Largest page a client may ask for. Must be at least `listPageSize`. |

Example:

```json
{
  "archivePath": "/data/conversations.sqlite",
  "language": "it",
  "listPageSize": 20,
  "maxListPageSize": 100
}
```

## `voice.json`

Speech recognition and synthesis. Read only when `AMBROGIO_VOICE_CONFIG_PATH` is set. Any other field makes the file invalid.

| Field | Type | Meaning |
|---|---|---|
| `voskModelPath` | string | Folder of an unpacked [Vosk](https://alphacephei.com/vosk/models) model. Must be readable. |
| `voiceEngine` | string | Required. `"piper"` for a sherpa-onnx Piper voice, `"kokoro"` for the Kokoro model `kokoro-multi-lang-v1_0`. |
| `voiceModelDir` | string | Folder of the voice. With `piper`: exactly one `.onnx` file, a `tokens.txt` file and an `espeak-ng-data/` folder. With `kokoro`: `model.onnx`, `voices.bin`, `tokens.txt` and an `espeak-ng-data/` folder. All readable. |
| `voiceSpeaker` | string | Required with `kokoro`, not allowed with `piper`. The Kokoro voice: `"if_sara"` (female) or `"im_nicola"` (male). |

Both models are loaded before the server starts listening. Speech synthesis uses up to four CPU threads. Kokoro speaks Italian at 24 kHz; the int8 variant of the model is not supported.

Example for the Docker image:

```json
{
  "voskModelPath": "/models/vosk-model-small-it-0.22",
  "voiceEngine": "piper",
  "voiceModelDir": "/opt/ambrogio/voices/vits-piper-it_IT-paola-medium"
}
```

Example with Kokoro, mounted at `/opt/ambrogio/kokoro`:

```json
{
  "voskModelPath": "/models/vosk-model-small-it-0.22",
  "voiceEngine": "kokoro",
  "voiceModelDir": "/opt/ambrogio/kokoro",
  "voiceSpeaker": "im_nicola"
}
```

## Signals

| Signal | Effect |
|---|---|
| `SIGTERM`, `SIGINT` | Stops accepting turns, saves turns in progress as interrupted, closes sessions and exits. Exit code `0` on a clean stop. |

## See also

- [Agent configuration](../agent-configuration/)
- [Limits and timeouts](../limits-and-timeouts/)
