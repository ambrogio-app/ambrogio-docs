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

For the chosen language, set `AMBROGIO_VOICE_<L>_ENGINE` to `piper` and `AMBROGIO_VOICE_<L>_MODEL_DIR` to the desired folder. Keep `AMBROGIO_VOICE_<L>_VOSK_MODEL_PATH` pointed at a Vosk model for that language. You can choose different engines for Italian and English.

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

You can mount any compatible sherpa-onnx Piper or Kokoro model and set `AMBROGIO_VOICE_<L>_MODEL_DIR` to its path inside the container. For Piper, the directory must contain exactly one `.onnx` file, `tokens.txt` and `espeak-ng-data/`. For Kokoro it must also contain `voices.bin`. You can similarly mount a different Vosk model and set `AMBROGIO_VOICE_<L>_VOSK_MODEL_PATH`.

For example, place models under `/srv/ambrogio/custom-models` on the host and add this read-only mount to the backend service in `compose.yaml`:

```yaml
services:
  backend:
    volumes:
      - /srv/ambrogio/custom-models:/custom-models:ro
```

If a custom Piper voice is in `/srv/ambrogio/custom-models/voices/my-voice`, set `AMBROGIO_VOICE_EN_MODEL_DIR: /custom-models/voices/my-voice` for English. If a custom Vosk model is in `/srv/ambrogio/custom-models/vosk/my-model`, set `AMBROGIO_VOICE_EN_VOSK_MODEL_PATH: /custom-models/vosk/my-model`. The names are yours to choose: Ambrogio uses the paths you set and has no fixed catalogue of voice IDs.

Recreate the container after changing mounts or configuration. A mount over `/opt/ambrogio/voices` replaces the included voices; mounting under `/custom-models` keeps them available.
