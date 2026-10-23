---
title: Satellite configuration
description: Command line and TypeScript configuration fields of the Ambrogio voice satellite.
sidebar:
  label: Satellite configuration
---

## Command line

```bash
node dist/main.js --config <file>
```

`--config` is the only argument and is required. The module may read environment variables. In the Docker image the command is fixed to `--config /config/satellite.ts`. Node.js 24 or later loads the module.

| Exit code | Meaning |
|---|---|
| `1` | The satellite failed while starting or running. |
| `2` | Invalid arguments (`invalid_arguments`) or invalid configuration (`invalid_configuration`). |

## Configuration file

One TypeScript module exports a default object with up to five sections. Unknown sections and unknown fields are rejected. The exported object and chosen wake word model are checked before the microphone is opened. The example uses `process.env`; numeric values are converted with `Number(...)`.

```ts
export default {
  backend: { baseUrl: process.env.AMBROGIO_BACKEND_URL },
  client: {
    ...(process.env.AMBROGIO_CLIENT_ID ? { id: process.env.AMBROGIO_CLIENT_ID } : {}),
    ...(process.env.AMBROGIO_CLIENT_NAME ? { name: process.env.AMBROGIO_CLIENT_NAME } : {}),
  },
  audio: {
    ...(process.env.AMBROGIO_MICROPHONE ? { microphone: process.env.AMBROGIO_MICROPHONE } : {}),
    ...(process.env.AMBROGIO_SPEAKER ? { speaker: process.env.AMBROGIO_SPEAKER } : {}),
    ...(process.env.AMBROGIO_ATTENUATION_DEVICE ? { attenuation: {
      device: process.env.AMBROGIO_ATTENUATION_DEVICE,
      control: process.env.AMBROGIO_ATTENUATION_CONTROL,
      level: Number(process.env.AMBROGIO_ATTENUATION_LEVEL),
    } } : {}),
  },
  wakeWord: {
    model: process.env.AMBROGIO_WAKE_WORD_MODEL || 'hey_jarvis',
    threshold: Number(process.env.AMBROGIO_WAKE_WORD_THRESHOLD || 0.5),
    patience: Number(process.env.AMBROGIO_WAKE_WORD_PATIENCE || 2),
  },
  interaction: { replyTimeoutMs: Number(process.env.AMBROGIO_REPLY_TIMEOUT_MS || 15000) },
};
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
| `attenuation` | object | Optional. ALSA control that the satellite lowers during an interaction. See below. |

A selector that starts with `alsa:` is a stable device ID. Any other string matches part of a device name, ignoring case. Leading or trailing spaces are not allowed. A selector that matches no device causes an error; it never falls back to the default. [Choose audio devices](../../how-to/choose-audio-devices/) shows how to list devices.

#### `audio.attenuation`

Lowers other local audio, such as a music player sharing the speaker, while you talk to the satellite. All three fields are required.

| Field | Type | Meaning |
|---|---|---|
| `device` | non-empty string | ALSA control device passed to `amixer -D`, such as `hw:CARD=<card>`. |
| `control` | non-empty string | Name of the simple control to set, such as `Music`. |
| `level` | whole number, 0 to 100 | Percentage the control is set to during an interaction. |

The control belongs to the satellite and is separate from the player's own volume. The satellite runs `amixer -D <device> -q sset <control> <level>%` when the wake word is heard, before the listening beep, and sets the control back to `100%` when it returns to waiting for the wake word. The control stays lowered during follow-up replies. It is also set to `100%` at startup and during shutdown. Without `attenuation`, no control is changed.

The control is usually created by an ALSA `softvol` device placed in front of the player's output; the satellite's own speaker must not go through it. ALSA creates a `softvol` control the first time something plays through that device: until then there is nothing to lower, and no error is logged. `amixer` comes from `alsa-utils`, which the Docker image includes from `v0.4.0`. Each call has a 2 second limit; a failure is logged as `satellite_attenuation_failed` and the interaction continues.

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
| `/config/satellite.ts` | Configuration file. Mount it read-only. |
| `/app/models/wakeword/` | Wake word models. A mount here replaces the bundled ones. |
| `/app/assets/` | Recorded warning messages. |

The container needs access to the sound devices (`--device /dev/snd`) and to the network of the backend (`--network host` is the simplest).

Built-in timings that cannot be configured are listed in [Limits and timeouts](../limits-and-timeouts/#satellite).
