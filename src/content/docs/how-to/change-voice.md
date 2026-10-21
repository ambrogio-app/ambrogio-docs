---
title: Change the voice
description: Choose bundled Piper or Kokoro voices, or mount your own speech models.
sidebar:
  label: Change the voice
---

The backend selects a voice profile from `voice.json` using `language` in `conversations.json`. Edit the relevant profile and restart the backend. The choice applies to every satellite.

## Switch between the bundled voices

The Docker image contains these Piper voices:

| Language | Voice | `voiceModelDir` |
|---|---|---|
| Italian | Paola, medium | `/opt/ambrogio/voices/vits-piper-it_IT-paola-medium` |
| Italian | Riccardo, lighter | `/opt/ambrogio/voices/vits-piper-it_IT-riccardo-x_low` |
| English | Kristin, medium | `/opt/ambrogio/voices/vits-piper-en_US-kristin-medium` |

In the chosen language profile, set `"voiceEngine": "piper"` and set `voiceModelDir` to the desired folder. Keep `voskModelPath` pointed at a Vosk model for that language. You can choose different engines for Italian and English.

## Use Kokoro

The image also includes `kokoro-multi-lang-v1_0`. In each profile that should use it, set `voiceEngine` to `kokoro`, `voiceModelDir` to `/opt/ambrogio/kokoro/kokoro-multi-lang-v1_0`, and set a matching numeric `voiceSpeaker` and `voiceLanguage`:

```json
{
  "languages": {
    "it": {
      "voskModelPath": "/opt/ambrogio/models/vosk-model-small-it-0.22",
      "voiceEngine": "kokoro",
      "voiceModelDir": "/opt/ambrogio/kokoro/kokoro-multi-lang-v1_0",
      "voiceSpeaker": 35,
      "voiceLanguage": "it"
    },
    "en": {
      "voskModelPath": "/opt/ambrogio/models/vosk-model-small-en-us-0.15",
      "voiceEngine": "kokoro",
      "voiceModelDir": "/opt/ambrogio/kokoro/kokoro-multi-lang-v1_0",
      "voiceSpeaker": 3,
      "voiceLanguage": "en"
    }
  }
}
```

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

If a custom Piper voice is in `/srv/ambrogio/custom-models/voices/my-voice`, set `voiceModelDir` to `/custom-models/voices/my-voice` in the matching language profile. If a custom Vosk model is in `/srv/ambrogio/custom-models/vosk/my-model`, set `voskModelPath` to `/custom-models/vosk/my-model`. The names are yours to choose: Ambrogio uses the paths in `voice.json` and has no fixed catalogue of voice IDs.

Recreate the container after changing mounts or configuration. A mount over `/opt/ambrogio/voices` replaces the included voices; mounting under `/custom-models` keeps them available.
