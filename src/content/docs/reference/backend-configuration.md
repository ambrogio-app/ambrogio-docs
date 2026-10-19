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

Conversation storage, language, time zone and list pages.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `archivePath` | string | required | Path of the SQLite file that stores conversations. The file is created if it does not exist; its folder must exist and be writable. |
| `language` | string | `"en"` | Language of the backend's own messages, such as errors and refusals: `"it"` or `"en"`. Any other string falls back to `"en"`. It does not change the language of the agents' answers. |
| `timeZone` | string | `"UTC"` | Time zone of the family, as an IANA name such as `"Europe/Rome"`. The agents get the current date and time in this zone; see [Current date and time](../agent-configuration/#current-date-and-time). A value that is not a known time zone stops the backend from starting. Not in `v0.5.0`: from the next backend release. |
| `listPageSize` | positive integer | `20` | Conversations per page when a client does not ask for a size. |
| `maxListPageSize` | positive integer | `100` | Largest page a client may ask for. Must be at least `listPageSize`. |

Example:

```json
{
  "archivePath": "/data/conversations.sqlite",
  "language": "en",
  "timeZone": "Europe/London",
  "listPageSize": 20,
  "maxListPageSize": 100
}
```

## `voice.json`

Speech recognition and synthesis. Read only when `AMBROGIO_VOICE_CONFIG_PATH` is set. Any other field makes the file invalid.

| Field | Type | Meaning |
|---|---|---|
| `voskModelPath` | string | Folder of an unpacked [Vosk](https://alphacephei.com/vosk/models) model. Must be readable. |
| `voiceEngine` | string | Required. `"piper"` for a sherpa-onnx Piper voice, `"kokoro"` for a sherpa-onnx Kokoro model. |
| `voiceModelDir` | string | Folder of the voice or model. With `piper`: exactly one `.onnx` file, a `tokens.txt` file and an `espeak-ng-data/` folder. With `kokoro`: exactly one `.onnx` file (such as `model.onnx` or `model.int8.onnx`), `voices.bin`, `tokens.txt` and an `espeak-ng-data/` folder. All readable. |
| `voiceSpeaker` | integer ≥ 0 | Required with `kokoro`, not allowed with `piper`. The number of the voice in the model. It must be lower than the number of voices the model declares, or the backend does not start. Voice names such as `"if_sara"` are not accepted. |
| `voiceLanguage` | string | Required with `kokoro`, not allowed with `piper`. The espeak-ng language used to turn text into sounds, such as `"it"`, `"en"`, `"es"`, `"fr"`, `"hi"` or `"pt-br"`. The backend does not check the code. |

Both models are loaded before the server starts listening. Speech synthesis uses up to four CPU threads. Audio has the sample rate of the loaded model; the multilingual Kokoro models produce 24 kHz. Ambrogio passes no lexicon files to Kokoro, so languages that sherpa-onnx pronounces only through a lexicon, such as Chinese, are not supported.

### Voices of `kokoro-multi-lang-v1_0`

Pick the voice and a matching `voiceLanguage`. Numbers from the [sherpa-onnx Kokoro models page](https://k2-fsa.github.io/sherpa/onnx/tts/pretrained_models/kokoro.html) and k2-fsa's `generate_voices_bin.py`; other Kokoro models have their own lists.

| `voiceSpeaker` | Voices | `voiceLanguage` |
|---|---|---|
| 0–10 | American English, female: `af_alloy`, `af_aoede`, `af_bella`, `af_heart`, `af_jessica`, `af_kore`, `af_nicole`, `af_nova`, `af_river`, `af_sarah`, `af_sky` | `en` |
| 11–19 | American English, male: `am_adam`, `am_echo`, `am_eric`, `am_fenrir`, `am_liam`, `am_michael`, `am_onyx`, `am_puck`, `am_santa` | `en` |
| 20–23 | British English, female: `bf_alice`, `bf_emma`, `bf_isabella`, `bf_lily` | `en` |
| 24–27 | British English, male: `bm_daniel`, `bm_fable`, `bm_george`, `bm_lewis` | `en` |
| 28, 29 | Spanish: `ef_dora` (female), `em_alex` (male) | `es` |
| 30 | French: `ff_siwis` (female) | `fr` |
| 31–34 | Hindi: `hf_alpha`, `hf_beta` (female), `hm_omega`, `hm_psi` (male) | `hi` |
| 35, 36 | Italian: `if_sara` (female), `im_nicola` (male) | `it` |
| 37–41 | Japanese: `jf_alpha`, `jf_gongitsune`, `jf_nezumi`, `jf_tebukuro` (female), `jm_kumo` (male) | not verified |
| 42–44 | Brazilian Portuguese: `pf_dora` (female), `pm_alex`, `pm_santa` (male) | `pt-br` |
| 45–52 | Chinese: `zf_…`, `zm_…` | not supported |

Example with a Piper voice mounted in the Docker image at `/opt/ambrogio/voices`:

```json
{
  "voskModelPath": "/models/vosk-model-small-en-us-0.15",
  "voiceEngine": "piper",
  "voiceModelDir": "/opt/ambrogio/voices/vits-piper-en_US-kristin-medium"
}
```

Example with Kokoro, mounted at `/opt/ambrogio/kokoro`:

```json
{
  "voskModelPath": "/models/vosk-model-small-en-us-0.15",
  "voiceEngine": "kokoro",
  "voiceModelDir": "/opt/ambrogio/kokoro",
  "voiceSpeaker": 3,
  "voiceLanguage": "en"
}
```

## Signals

| Signal | Effect |
|---|---|
| `SIGTERM`, `SIGINT` | Stops accepting turns, saves turns in progress as interrupted, closes sessions and exits. Exit code `0` on a clean stop. |

## See also

- [Agent configuration](../agent-configuration/)
- [Limits and timeouts](../limits-and-timeouts/)
