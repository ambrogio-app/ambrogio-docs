---
title: Satellite configuration
description: Command line and JSON fields of the Ambrogio voice satellite.
sidebar:
  label: Satellite configuration
---

## Command line

```bash
node dist/main.js --config <file>
```

`--config` is the only argument and is required. Environment variables are not read. In the Docker image the command is fixed to `--config /config/satellite.json`.

| Exit code | Meaning |
|---|---|
| `1` | The satellite failed while starting or running. |
| `2` | Invalid arguments (`invalid_arguments`) or invalid configuration (`invalid_configuration`). |

## Configuration file

One JSON object with up to five sections. Unknown sections and unknown fields are rejected. The whole file, and the chosen wake word model, are checked before the microphone is opened.

```json
{
  "backend": { "baseUrl": "http://192.168.1.20:3000" },
  "client": { "id": "kitchen", "name": "Kitchen" },
  "audio": { "microphone": "USB", "speaker": "alsa:plughw:CARD=Headphones,DEV=0" },
  "wakeWord": { "model": "hey_jarvis", "threshold": 0.5, "patience": 2 },
  "interaction": { "replyTimeoutMs": 15000 }
}
```

### `backend`

| Field | Type | Default | Meaning |
|---|---|---|---|
| `baseUrl` | string | required | Backend address. Absolute `http://` or `https://` URL with no user name, password, query or fragment, and no surrounding spaces. A path prefix is allowed. The session URL is `baseUrl` + `api/session`, with `ws://` or `wss://`. |

### `client`

Optional.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `id` | non-empty string | `satellite-<hostname>` | Identifier sent to the backend when the session opens. Give each satellite its own. |
| `name` | non-empty string | `<hostname>` | Readable name, such as the room. |

### `audio`

Optional. Without a selector, the system's default device is used.

| Field | Type | Meaning |
|---|---|---|
| `microphone` | non-empty string | Microphone to use. |
| `speaker` | non-empty string | Speaker to use. |

A selector that starts with `alsa:` is a stable device ID. Any other string matches part of a device name, ignoring case. Leading or trailing spaces are not allowed. A selector that matches no device causes an error; it never falls back to the default. [Choose audio devices](../../how-to/choose-audio-devices/) shows how to list devices.

### `wakeWord`

Optional.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `model` | string | `"hey_jarvis"` | Wake word model. Bundled: `hey_jarvis`, `hey_mycroft`, `alexa`. A custom model `<id>.onnx` in the models folder is selected with its `<id>`. |
| `threshold` | number, above 0 and at most 1 | `0.5` | Detection threshold. Higher means fewer false wake-ups and more missed ones. |
| `patience` | whole number, 1 to 10 | `2` | Consecutive 80 ms audio blocks whose score must reach `threshold` before the satellite wakes up. Higher means fewer false wake-ups from short sounds such as a cough, about 80 ms more delay per block, and possibly more missed ones. `1` wakes up on a single block. |

A custom `<id>` must match `^[a-z0-9][a-z0-9_-]*$` and may not be `melspectrogram` or `embedding_model`. The models folder is `models/wakeword/` in the repository and `/app/models/wakeword/` in the image; it must contain `melspectrogram.onnx` and `embedding_model.onnx`.

### `interaction`

Optional.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `replyTimeoutMs` | positive integer | `15000` | After an answer that expects a reply, how long the satellite waits for you to start speaking before it goes back to the wake word, in milliseconds. |

## Docker image

| Path | Contents |
|---|---|
| `/config/satellite.json` | Configuration file. Mount it read-only. |
| `/app/models/wakeword/` | Wake word models. A mount here replaces the bundled ones. |
| `/app/assets/` | Recorded warning messages. |

The container needs access to the sound devices (`--device /dev/snd`) and to the network of the backend (`--network host` is the simplest).

Built-in timings that cannot be configured are listed in [Limits and timeouts](../limits-and-timeouts/#satellite).
