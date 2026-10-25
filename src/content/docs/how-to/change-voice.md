---
title: Change the voice
description: Choose bundled Piper or Kokoro voices, or mount your own speech models.
sidebar:
  label: Change the voice
---

The backend uses the voice profile of `AMBROGIO_LANGUAGE`. Set the profile variables of that language in the backend service's `environment` section of the Compose file and recreate the backend. `<L>` below is `EN` or `IT`. The choice applies to every satellite.

## Switch between the bundled voices

The Docker image contains these Piper voices:

| Language | Voice | `AMBROGIO_VOICE_<L>_MODEL_DIR` |
|---|---|---|
| Italian | Paola, medium | `/opt/ambrogio/voices/vits-piper-it_IT-paola-medium` |
| Italian | Riccardo, lighter | `/opt/ambrogio/voices/vits-piper-it_IT-riccardo-x_low` |
| English | Kristin, medium | `/opt/ambrogio/voices/vits-piper-en_US-kristin-medium` |

For the chosen language, set `AMBROGIO_VOICE_<L>_ENGINE` to `piper` and `AMBROGIO_VOICE_<L>_MODEL_DIR` to the desired folder. Keep `AMBROGIO_VOICE_<L>_STT_ENGINE` set to `whisper` and `AMBROGIO_VOICE_<L>_STT_MODEL_DIR` pointed at a Whisper model; the bundled `/opt/ambrogio/models/sherpa-onnx-whisper-base` serves both languages. You can choose different engines for Italian and English.

## Use Kokoro

The image also includes `kokoro-multi-lang-v1_0`. For each language that should use it, set the engine to `kokoro`, the model folder to `/opt/ambrogio/kokoro/kokoro-multi-lang-v1_0`, and a matching numeric speaker and espeak-ng language. For English:

```yaml
AMBROGIO_VOICE_EN_ENGINE: kokoro
AMBROGIO_VOICE_EN_MODEL_DIR: /opt/ambrogio/kokoro/kokoro-multi-lang-v1_0
AMBROGIO_VOICE_EN_SPEAKER: "3"
AMBROGIO_VOICE_EN_LANGUAGE: en
```

For Italian, set the `AMBROGIO_VOICE_IT_*` variables the same way, for example with speaker `35` and language `it`. With `piper`, leave `SPEAKER` and `LANGUAGE` unset: they are refused.

Speaker 35 is `if_sara`; speaker 3 is `af_heart`. [The model's voice list](../../reference/backend-configuration/#voices-of-kokoro-multi-lang-v1_0) shows other speakers. Kokoro needs considerably more CPU than Piper; on a low-power mini PC it may generate audio more slowly than playback.

## Use a different voice

You can mount any compatible sherpa-onnx Piper or Kokoro model and set `AMBROGIO_VOICE_<L>_MODEL_DIR` to its path inside the container. For Piper, the directory must contain exactly one `.onnx` file, `tokens.txt` and `espeak-ng-data/`. For Kokoro it must also contain `voices.bin`. You can similarly mount a different [sherpa-onnx Whisper model](https://k2-fsa.github.io/sherpa/onnx/pretrained_models/whisper/index.html) and set `AMBROGIO_VOICE_<L>_STT_MODEL_DIR` to its path. Its directory must contain exactly one file whose name contains `encoder` and ends with `.onnx`, exactly one whose name contains `decoder` and ends with `.onnx`, and exactly one whose name ends with `tokens.txt`.

For example, place models under `/srv/ambrogio/custom-models` on the host and add this read-only mount to the backend service in `compose.yaml`:

```yaml
services:
  backend:
    volumes:
      - /srv/ambrogio/custom-models:/custom-models:ro
```

If a custom Piper voice is in `/srv/ambrogio/custom-models/voices/my-voice`, set `AMBROGIO_VOICE_EN_MODEL_DIR: /custom-models/voices/my-voice` for English. If a custom Whisper model is in `/srv/ambrogio/custom-models/whisper/my-model`, set `AMBROGIO_VOICE_EN_STT_MODEL_DIR: /custom-models/whisper/my-model`. The names are yours to choose: Ambrogio uses the paths you set and has no fixed catalogue of voice IDs.

Recreate the container after changing mounts or configuration. A mount over `/opt/ambrogio/voices` replaces the included voices, and a mount over `/opt/ambrogio/models` replaces the included Whisper model; mounting under `/custom-models` keeps them available.
