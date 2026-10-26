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

Release list checked on 26 October 2026. Ambrogio is in preview, and configuration may change between releases.

| Program | Latest release | Images | Interfaces |
|---|---|---|---|
| Backend | `v0.12.0` | `ghcr.io/ambrogio-app/ambrogio-backend:v0.12.0` (amd64) | offers `ambrogio.v1` and HTTP API `v1` |
| Terminal client | `v0.3.0` | none, run from a checkout of the tag | uses `ambrogio.v1` and HTTP API `v1` |
| Web chat | `v0.3.0` | `ghcr.io/ambrogio-app/ambrogio-web:v0.3.0` (amd64, arm64) | uses `ambrogio.v1` and HTTP API `v1` |
| Satellite | `v0.8.0` | `ghcr.io/ambrogio-app/ambrogio-satellite:v0.8.0` (amd64, arm64) | uses `ambrogio.v1` |

All four current releases work together, and the backend works with every satellite release, since `ambrogio.v1` has not changed. Backend `v0.12.0` and satellite `v0.8.0` change their own voice configuration: see [Upgrading to backend `v0.12.0` and satellite `v0.8.0`](#upgrading-to-backend-v0120-and-satellite-v080). The terminal client `v0.2.0` and the web chat `v0.2.0` read conversations through endpoints without a version in the path, `/api/conversations`, which only backend `v0.10.1` and earlier answer: backend `v0.11.0` no longer serves them, so upgrade those clients to `v0.3.0` or later before you upgrade the backend to `v0.11.0`. Backend `v0.10.0` was tagged but not published: use `v0.10.1`. The terminal client `v0.3.0` and the web chat `v0.3.0` need a backend that offers HTTP API `v1`, that is `v0.10.1` or later. Each client release is tested in CI against the backend under development, through the backend's test entry point.

## Upgrading to backend `v0.12.0` and satellite `v0.8.0`

Backend `v0.12.0` and satellite `v0.8.0` replace their speech engines with [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx): a streaming transducer model, Nemotron 3.5 ASR streaming 0.6B, instead of Vosk for speech recognition in the backend, Piper as the only kind of voice, and sherpa-onnx keyword spotting and Silero VAD instead of openWakeWord in the satellite. The voice configuration of both changes in a way that is not compatible with earlier releases. The conversation protocol `ambrogio.v1` and HTTP API `v1` do not change.

The backend and the satellite are released together. Because the protocol is the same, either one works with the other's previous release over `ambrogio.v1`, but each needs its own new variables.

| Before | From backend `v0.12.0` and satellite `v0.8.0` |
|---|---|
| Backend: `AMBROGIO_VOICE_<L>_VOSK_MODEL_PATH`, the folder of a Vosk model | `AMBROGIO_VOICE_<L>_STT_MODEL_DIR`, the folder of a sherpa-onnx streaming transducer model, required for each listed language. `AMBROGIO_VOICE_<L>_VOSK_MODEL_PATH` is no longer read. |
| Backend image: Vosk models in `/opt/ambrogio/models/vosk-model-small-it-0.22` and `/opt/ambrogio/models/vosk-model-small-en-us-0.15` | One multilingual Nemotron 3.5 ASR streaming 0.6B model in `/opt/ambrogio/models/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-560ms-int8-2026-06-11`, for Italian and English, under OpenMDW 1.1. |
| Backend: audio transcribed by Vosk while it arrives | Audio still transcribed while it arrives, by the streaming model in a worker thread; at `input.end` only the last part remains to decode. Real-time recognition needs an x86_64 CPU with AVX2. |
| Backend from source: `libgomp1` needed for voice | Not needed. |
| Backend: `AMBROGIO_VOICE_<L>_ENGINE`, `piper` or `kokoro`, and with `kokoro` `AMBROGIO_VOICE_<L>_SPEAKER` and `AMBROGIO_VOICE_<L>_LANGUAGE` | No longer read: `AMBROGIO_VOICE_<L>_MODEL_DIR` is always a Piper voice. A profile that used Kokoro must point `MODEL_DIR` to a Piper voice. |
| Backend image: Kokoro model in `/opt/ambrogio/kokoro/kokoro-multi-lang-v1_0` | Removed. |
| Backend: agents with tools speak only when their work is done | The agent first announces the action in one sentence, written before its tool calls, and stays silent after an announced action succeeds. Specialised agents answer in plain text and end with the tool `finish`, so their models must support a required tool call; only the orchestrator needs structured output. See [Agent configuration](../agent-configuration/#providers). |
| Backend: logs from level `warn` only | Logs from level `info`, with the new `conversation_voice_turn_timing` line for every answered voice turn and `conversation_reply_timing` for every answer. The satellite writes the new `satellite_request_timing` line. See [Logs](../logs/). |
| Satellite: `AMBROGIO_WAKE_WORD_MODEL` chose a bundled or custom openWakeWord model, `hey_jarvis` by default | `AMBROGIO_WAKE_WORD` is the wake word as text, `Alexa` by default. `AMBROGIO_WAKE_WORD_MODEL` is no longer read. |
| Satellite: `AMBROGIO_WAKE_WORD_THRESHOLD`, above 0 and up to 1, default `0.5` | `AMBROGIO_WAKE_WORD_THRESHOLD`, above 0 and below 1, default `0.25`: the keyword spotting threshold of sherpa-onnx. |
| Satellite: `AMBROGIO_WAKE_WORD_PATIENCE` | Removed and no longer read. A detection counts only if the speech detector heard speech in the 1.5 seconds that end with it. |
| Satellite: custom models mounted at `/app/models/wakeword` | Another sherpa-onnx keyword spotting model can be mounted at `/app/models/kws`. |
| Satellite: `satellite_wake_detected` with `score` and `chunks` | `satellite_wake_detected` with only `level`, `time` and `event`, and the new `satellite_wake_rejected` for a detection without speech. |
| Satellite: wake word models under CC BY-NC-SA 4.0, for non-commercial use only | Apache-2.0 keyword spotting model and MIT Silero VAD. |
| Satellite on the host: `libasound2` and `libgomp1` | `libasound2` only. |

To upgrade, back up first ([Back up and upgrade](../../how-to/back-up-and-upgrade/)), then:

1. In the backend, for each language listed in `AMBROGIO_VOICE_LANGUAGES`, replace `AMBROGIO_VOICE_<L>_VOSK_MODEL_PATH` with `AMBROGIO_VOICE_<L>_STT_MODEL_DIR: /opt/ambrogio/models/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-560ms-int8-2026-06-11`. If you mounted your own Vosk model, mount a sherpa-onnx streaming transducer model instead; see [Change the voice](../../how-to/change-voice/#use-a-different-speech-recognition-model).
2. In each satellite, remove `AMBROGIO_WAKE_WORD_MODEL` and `AMBROGIO_WAKE_WORD_PATIENCE`. The default wake word is now "Alexa"; to say another word, set it as text, for example `AMBROGIO_WAKE_WORD: Hey Jarvis`.
3. If you set `AMBROGIO_WAKE_WORD_THRESHOLD`, remove it to start from the new default, then tune it again if needed; a value of `1` is now refused. See [Change the wake word](../../how-to/change-wake-word/).
4. Remove any mount at `/app/models/wakeword`. openWakeWord models no longer work.
5. Start from the new `compose.example.yaml` of each repository.

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

## External services and models

Ambrogio depends on these versions of services, protocols and models it does not own:

| Dependency | Version | Used by |
|---|---|---|
| Home Assistant, **Model Context Protocol Server** integration | 2025.11 or later: the first release that serves the Streamable HTTP endpoint `/api/mcp`. Earlier releases offer only the SSE endpoint, which Ambrogio does not use. | Backend, [Home Assistant connector](../../how-to/connect-home-assistant/) |
| Model Context Protocol | revision `2025-03-26` or later. The backend's client proposes `2025-11-25` and accepts `2025-06-18` and `2025-03-26` from the server. | Backend, MCP connectors |
| LLM provider APIs | Mistral AI `v1`, OpenAI `v1` (Responses), Anthropic Messages with `anthropic-version: 2023-06-01`, Gemini API `v1beta`, or a Chat Completions API compatible with OpenAI | Backend, see [Agent configuration](../agent-configuration/) |
| Speech recognition and synthesis models: Nemotron 3.5 ASR streaming 0.6B from the sherpa-onnx `asr-models` release, Piper voices from the `tts-models` release | the archives listed in [Bundled models and licenses](../bundled-models/#backend), fixed by SHA-256 | Backend image |
| Keyword spotting model zipformer GigaSpeech 3.3M, from the sherpa-onnx `kws-models` release, and Silero VAD, from the `asr-models` release | the files listed in [Bundled models and licenses](../bundled-models/#satellite), fixed by SHA-256 | Satellite |

## Language

The backend adds the language selected by `AMBROGIO_LANGUAGE` to each answering agent's instructions. The orchestrator only selects an agent. The backend image includes a multilingual Nemotron streaming model for Italian and English recognition, which recognises the spoken language by itself, and Italian and English Piper voices; see [Change the voice](../../how-to/change-voice/). You can still use external models and voices.

The texts written by Ambrogio itself are in English or Italian: the backend's messages follow `AMBROGIO_LANGUAGE` (see [Backend configuration](../backend-configuration/#conversations)), the web chat's interface follows its `language` or the browser, and the terminal client's interface follows `--language` or the system locale. The satellite has no spoken messages: it signals problems with a tone.
