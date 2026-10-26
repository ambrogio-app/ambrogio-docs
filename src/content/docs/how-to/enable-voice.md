---
title: Enable voice
description: Configure speech recognition and synthesis in the backend.
sidebar:
  label: Enable voice
---

Voice is active when `AMBROGIO_VOICE_LANGUAGES` lists at least one language. The backend Compose example already enables English and Italian with the Piper voices and the Nemotron speech recognition model included in the image. Speech recognition in real time needs an x86_64 CPU with AVX2; without it, the text of a voice turn arrives late.

## 1. Check the voice variables

In `ambrogio-backend/compose.example.yaml`, keep these entries in the backend service's `environment` section:

```yaml
AMBROGIO_VOICE_LANGUAGES: en,it
AMBROGIO_VOICE_EN_STT_MODEL_DIR: /opt/ambrogio/models/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-560ms-int8-2026-06-11
AMBROGIO_VOICE_EN_MODEL_DIR: /opt/ambrogio/voices/vits-piper-en_US-kristin-medium
AMBROGIO_VOICE_IT_STT_MODEL_DIR: /opt/ambrogio/models/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-560ms-int8-2026-06-11
AMBROGIO_VOICE_IT_MODEL_DIR: /opt/ambrogio/voices/vits-piper-it_IT-paola-medium
```

The backend uses the profile of `AMBROGIO_LANGUAGE`, `en` unless you set it, so that language must be in the list. Both languages use the same multilingual Nemotron model; it recognises the spoken language by itself. To speak Italian, add `AMBROGIO_LANGUAGE: it`. [Backend configuration](../../reference/backend-configuration/#voice) describes every variable and its validation.

## 2. Recreate the backend

```bash
docker compose -f compose.example.yaml up -d
```

Check `docker compose -f compose.example.yaml logs backend` if startup fails. To use another bundled voice or a custom model, follow [Change the voice](../change-voice/). On a host without Docker, install the models yourself and set the voice variables to their host paths.
