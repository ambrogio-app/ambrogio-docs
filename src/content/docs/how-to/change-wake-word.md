---
title: Change the wake word
description: Switch to another bundled wake word, tune its sensitivity, or add your own openWakeWord model.
sidebar:
  label: Change the wake word
---

The wake word is set per satellite, in the `wakeWord` section of its configuration file.

## Use another bundled wake word

Three wake words come with the satellite:

| `wakeWord.model` | Say |
|---|---|
| `hey_jarvis` (default) | "Hey Jarvis" |
| `hey_mycroft` | "Hey Mycroft" |
| `alexa` | "Alexa" (without "Hey") |

Set `AMBROGIO_WAKE_WORD_MODEL=hey_mycroft` in the satellite Compose `.env`, then recreate the satellite.

## Make it more or less sensitive

`threshold` is how confident the detector must be before it reacts. It is a number above 0 and up to 1; the default is `0.5`.

Set `AMBROGIO_WAKE_WORD_THRESHOLD=0.6` in `.env`, then recreate the satellite.

- If the satellite wakes up when nobody called it, raise the threshold a little, for example to `0.6`.
- If it often misses you, lower it, for example to `0.4`.

`patience` is how many consecutive 80 ms blocks must reach the threshold; the default is `2`.

Set `AMBROGIO_WAKE_WORD_MODEL=alexa`, `AMBROGIO_WAKE_WORD_THRESHOLD=0.6` and `AMBROGIO_WAKE_WORD_PATIENCE=3` in `.env`, then recreate the satellite.

- If short sounds such as a cough or a clap wake it up, raise `patience` to `3`.
- If it misses you when you say the wake word quickly, lower `patience` to `1`.

Change one value at a time, in small steps, and try each value for a while.

## Add your own wake word

You can use any classifier trained with [openWakeWord](https://github.com/dscripka/openWakeWord). Name the file `<id>.onnx`, for example `ciao_ambrogio.onnx`. The `<id>` may contain lowercase letters, digits, `-` and `_`, and must start with a letter or digit.

### On the host

Copy the file into `models/wakeword/` in the satellite folder, next to the bundled models.

### With Docker

The image keeps its models in `/app/models/wakeword`. Mounting a folder there replaces them all, so prepare a folder that contains:

- your `<id>.onnx`;
- `melspectrogram.onnx` and `embedding_model.onnx`, copied from `models/wakeword/` in the satellite repository;
- any bundled model you still want, such as `hey_jarvis_v0.1.onnx`.

Then add `/path/to/folder:/app/models/wakeword:ro` to the satellite service `volumes` in Compose.

### Select it

Set `AMBROGIO_WAKE_WORD_MODEL=ciao_ambrogio` in `.env`, then recreate the satellite. If the model name is not in the folder, or the two shared files are missing, the satellite refuses the configuration and exits with `"event":"invalid_configuration"` and `"field":"wakeWord.model"`.

:::caution[Licenses]
The bundled models are licensed CC BY-NC-SA 4.0, for non-commercial use only. For your own models, keeping track of where they came from and under which license is up to you. See [Bundled models and licenses](../../reference/bundled-models/).
:::
