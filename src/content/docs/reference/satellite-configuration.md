---
title: Satellite configuration
description: Environment variables of the Ambrogio voice satellite.
sidebar:
  label: Satellite configuration
---

The satellite reads its configuration once, at startup, from environment variables. The configuration code is part of the satellite: you set variables, you do not write code. Every value and the chosen wake word model are checked before the microphone is opened.

## Command line

```bash
node dist/main.js
```

The satellite takes no arguments. Any argument is refused with `invalid_arguments`.

| Exit code | Meaning |
|---|---|
| `0` | Stopped cleanly after `SIGINT` or `SIGTERM`. |
| `1` | The satellite could not start (`satellite_startup_failed`), a resource could not be released when stopping (`satellite_process_failed`), the shutdown took longer than 5 seconds after `SIGINT` or `SIGTERM` (`satellite_shutdown_timeout`), or a fatal error stopped it. |
| `2` | Invalid arguments (`invalid_arguments`) or invalid configuration (`invalid_configuration`). |

An invalid configuration produces one log line with `event: "invalid_configuration"`, `variable` (the name of the variable) and `condition` (`missing` or `invalid`). The line never contains the value. See [Logs](../logs/).

## Rules for every variable

- `AMBROGIO_ENV` is required: `development`, `test` or `production`. There is no default.
- A variable set to an empty string counts as unset.
- The satellite has no development-only defaults: the defaults below apply in every environment.
- A local `.env` file is read only by the development command `pnpm dev`, which runs `node --env-file=.env dist/main.js`. Variables already set in the shell take precedence over the file. The satellite never reads `.env` by itself.

## Variables

| Variable | Values | Default |
|---|---|---|
| `AMBROGIO_ENV` | `development`, `test`, `production` | required |
| `AMBROGIO_BACKEND_URL` | Backend address. Absolute `http://` or `https://` URL with no user name, password, query or fragment, and no surrounding spaces. A path prefix is allowed. The session URL is this address + `api/session`, with `ws://` or `wss://`. | required |
| `AMBROGIO_CLIENT_ID` | Non-empty identifier sent to the backend when the session opens. Give each satellite its own. | `satellite-<hostname>` |
| `AMBROGIO_CLIENT_NAME` | Non-empty readable name, such as the room. | `<hostname>` |
| `AMBROGIO_MICROPHONE` | Microphone selector, see [Audio devices](#audio-devices). | unset: the system's default microphone |
| `AMBROGIO_SPEAKER` | Speaker selector, see [Audio devices](#audio-devices). | unset: the system's default speaker |
| `AMBROGIO_ATTENUATION_DEVICE`, `AMBROGIO_ATTENUATION_CONTROL`, `AMBROGIO_ATTENUATION_LEVEL` | See [Attenuation of other audio](#attenuation-of-other-audio). | unset: nothing is lowered |
| `AMBROGIO_WAKE_WORD_MODEL` | Wake word model. Bundled: `hey_jarvis`, `hey_mycroft`, `alexa`. A custom model `<id>.onnx` in the models folder is selected with its `<id>`. | `hey_jarvis` |
| `AMBROGIO_WAKE_WORD_THRESHOLD` | Number above 0 and at most 1. Detection threshold: higher means fewer false wake-ups and more missed ones. | `0.5` |
| `AMBROGIO_WAKE_WORD_PATIENCE` | Whole number, 1 to 10. Consecutive 80 ms audio blocks whose score must reach the threshold before the satellite wakes up. Higher means fewer false wake-ups from short sounds such as a cough, about 80 ms more delay per block, and possibly more missed ones. `1` wakes up on a single block. | `2` |
| `AMBROGIO_REPLY_TIMEOUT_MS` | Positive integer. After an answer that expects a reply, how long the satellite waits for you to start speaking before it goes back to the wake word, in milliseconds. | `15000` |

A custom wake word `<id>` must match `^[a-z0-9][a-z0-9_-]*$` and may not be `melspectrogram` or `embedding_model`. The models folder is `models/wakeword/` in the repository and `/app/models/wakeword/` in the image; it must contain `melspectrogram.onnx` and `embedding_model.onnx`.

### Audio devices

A selector that starts with `alsa:` is a stable device ID. Any other string matches part of a device name, ignoring case. Leading or trailing spaces are not allowed. A selector that matches no device causes an error; it never falls back to the default. [Choose audio devices](../../how-to/choose-audio-devices/) shows how to list devices.

### Attenuation of other audio

Lowers other local audio, such as a music player sharing the speaker, while you talk to the satellite. Set all three variables, or none.

| Variable | Values | Meaning |
|---|---|---|
| `AMBROGIO_ATTENUATION_DEVICE` | non-empty string, no surrounding spaces | ALSA control device passed to `amixer -D`, such as `hw:CARD=<card>`. |
| `AMBROGIO_ATTENUATION_CONTROL` | non-empty string, no surrounding spaces | Name of the simple control to set, such as `Music`. |
| `AMBROGIO_ATTENUATION_LEVEL` | whole number, 0 to 100 | Percentage the control is set to during an interaction. |

The control belongs to the satellite and is separate from the player's own volume. The satellite runs `amixer -D <device> -q sset <control> <level>%` when the wake word is heard, before the listening beep, and sets the control back to `100%` when it returns to waiting for the wake word. The control stays lowered during follow-up replies. It is also set to `100%` at startup and during shutdown. Without these variables, no control is changed.

The control is usually created by an ALSA `softvol` device placed in front of the player's output; the satellite's own speaker must not go through it. ALSA creates a `softvol` control the first time something plays through that device: until then there is nothing to lower, and no error is logged. `amixer` comes from `alsa-utils`, which the Docker image includes from `v0.4.0`. Each call has a 2 second limit; a failure is logged as `satellite_attenuation_failed` and the interaction continues.

## Example files

The satellite repository provides `.env.example`, with every variable and empty values except `AMBROGIO_ENV=development`, and `compose.example.yaml`, which sets only `AMBROGIO_ENV: production` and `AMBROGIO_BACKEND_URL`. Neither repeats a default.

## Docker image

| Path | Contents |
|---|---|
| `/app/models/wakeword/` | Wake word models. A mount here replaces the bundled ones. |
| `/app/assets/` | Recorded warning messages. |

The image command is `node dist/main.js`; pass the configuration with environment variables. The container needs access to the sound devices (`--device /dev/snd`) and to the network of the backend (`--network host` is the simplest).

Built-in timings that cannot be configured are listed in [Limits and timeouts](../limits-and-timeouts/#satellite).
