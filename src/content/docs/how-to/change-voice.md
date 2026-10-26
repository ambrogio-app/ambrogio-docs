---
title: Change the voice
description: Choose a bundled Piper voice, or mount your own voice and speech recognition models.
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

For the chosen language, set `AMBROGIO_VOICE_<L>_MODEL_DIR` to the desired folder. Speech recognition is set separately by `AMBROGIO_VOICE_<L>_STT_MODEL_DIR`; the bundled model `/opt/ambrogio/models/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-560ms-int8-2026-06-11` serves both languages. You can choose different voices for Italian and English.

## Use a different voice

You can mount any Piper voice converted for sherpa-onnx and set `AMBROGIO_VOICE_<L>_MODEL_DIR` to its path inside the container. The directory must contain exactly one `.onnx` file, `tokens.txt` and `espeak-ng-data/`. Other kinds of voice models, such as Kokoro, are not supported.

For example, place models under `/srv/ambrogio/custom-models` on the host and add this read-only mount to the backend service in `compose.yaml`:

```yaml
services:
  backend:
    volumes:
      - /srv/ambrogio/custom-models:/custom-models:ro
```

If a custom Piper voice is in `/srv/ambrogio/custom-models/voices/my-voice`, set `AMBROGIO_VOICE_EN_MODEL_DIR: /custom-models/voices/my-voice` for English. The names are yours to choose: Ambrogio uses the paths you set and has no fixed catalogue of voice IDs.

Recreate the container after changing mounts or configuration. A mount over `/opt/ambrogio/voices` replaces the included voices, and a mount over `/opt/ambrogio/models` replaces the included Nemotron speech recognition model; mounting under `/custom-models` keeps them available.

## Use a different speech recognition model

The backend runs one family of speech recognition models: sherpa-onnx streaming transducers, which recognise speech while you talk. `AMBROGIO_VOICE_<L>_STT_MODEL_DIR` chooses the model. Its folder must contain:

- exactly one file whose name contains `encoder` and ends with `.onnx`;
- exactly one file whose name contains `decoder` and ends with `.onnx`;
- exactly one file whose name contains `joiner` and ends with `.onnx`;
- exactly one file whose name ends with `tokens.txt`.

The image includes only Nemotron 3.5 ASR streaming 0.6B. To use another streaming transducer, get it from the [sherpa-onnx pretrained models](https://k2-fsa.github.io/sherpa/onnx/pretrained_models/index.html), place its folder under the mounted directory and set the variable. For a model in `/srv/ambrogio/custom-models/stt/my-model`:

```yaml
AMBROGIO_VOICE_EN_STT_MODEL_DIR: /custom-models/stt/my-model
```

Offline models, such as Parakeet TDT or Whisper, and other model families are not supported. The backend does not pass the language of the profile to the model, so pick a model that recognises the language you speak. Check the license of any model you mount. See [Backend configuration](../../reference/backend-configuration/#voice).
