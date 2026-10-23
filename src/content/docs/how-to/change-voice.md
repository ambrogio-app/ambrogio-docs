---
title: Change the voice
description: Choose bundled Piper or Kokoro voices, or mount your own speech models.
sidebar:
  label: Change the voice
---

The backend selects a voice profile from `voice.ts` using `language` in `conversations.ts`. Set the matching variables in the Compose `.env` and recreate the backend. The choice applies to every satellite.

## Switch between the bundled voices

The Docker image contains these Piper voices:

| Language | Voice | `voiceModelDir` |
|---|---|---|
| Italian | Paola, medium | `/opt/ambrogio/voices/vits-piper-it_IT-paola-medium` |
| Italian | Riccardo, lighter | `/opt/ambrogio/voices/vits-piper-it_IT-riccardo-x_low` |
| English | Kristin, medium | `/opt/ambrogio/voices/vits-piper-en_US-kristin-medium` |

For the chosen language, set `voiceEngine` to `'piper'` and set `voiceModelDir` to the desired folder. Keep `voskModelPath` pointed at a Vosk model for that language. You can choose different engines for Italian and English.

## Use Kokoro

The image also includes `kokoro-multi-lang-v1_0`. In each profile that should use it, set `voiceEngine` to `kokoro`, `voiceModelDir` to `/opt/ambrogio/kokoro/kokoro-multi-lang-v1_0`, and set a matching numeric `voiceSpeaker` and `voiceLanguage`:

In the backend Compose `.env`, select Kokoro for English and choose a speaker:

```dotenv
AMBROGIO_EN_VOICE_ENGINE=kokoro
AMBROGIO_EN_VOICE_SPEAKER=3
AMBROGIO_EN_VOICE_LANGUAGE=en
```

`examples/voice.ts` selects the bundled Kokoro model when the engine is `kokoro`. Set the corresponding `AMBROGIO_IT_VOICE_*` variables for Italian.

Speaker 35 is `if_sara`; speaker 3 is `af_heart`. [The model's voice list](../../reference/backend-configuration/#voices-of-kokoro-multi-lang-v1_0) shows other speakers. Kokoro needs considerably more CPU than Piper; on a low-power mini PC it may generate audio more slowly than playback.

## Use a different voice

You can mount any compatible sherpa-onnx Piper or Kokoro model and point `voiceModelDir` at its path inside the container. For Piper, the directory must contain exactly one `.onnx` file, `tokens.txt` and `espeak-ng-data/`. For Kokoro it must also contain `voices.bin`. You can similarly mount a different Vosk model and set `voskModelPath`.

For example, place models under `/srv/ambrogio/custom-models` on the host and add this read-only mount to the backend service in `compose.yaml`:

```yaml
services:
  backend:
    volumes:
      - /srv/ambrogio/custom-models:/custom-models:ro
```

If a custom Piper voice is in `/srv/ambrogio/custom-models/voices/my-voice`, set `AMBROGIO_EN_VOICE_MODEL_DIR=/custom-models/voices/my-voice` in `.env` for English. If a custom Vosk model is in `/srv/ambrogio/custom-models/vosk/my-model`, set `AMBROGIO_EN_VOSK_MODEL_PATH=/custom-models/vosk/my-model`. The names are yours to choose: Ambrogio uses the paths in `voice.ts` and has no fixed catalogue of voice IDs.

Recreate the container after changing mounts or configuration. A mount over `/opt/ambrogio/voices` replaces the included voices; mounting under `/custom-models` keeps them available.
