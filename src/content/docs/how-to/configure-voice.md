---
title: Configure voice
description: Turn on speech recognition and synthesis in the backend, choose the voice, or mount your own models.
sidebar:
  label: Configure voice
---

Speech recognition and the voice run in the backend and serve every satellite; [How voice works](../../explanation/voice/) explains the split. This guide works on the installation from [Install Ambrogio](../../tutorials/install-ambrogio/); run the commands from `~/ambrogio`.

## Before you start

- The backend host has an x86_64 CPU with AVX2; see [Before you install](../../reference/requirements/#backend).

## Turn voice on

1. Add these entries to the `environment` section of the `backend` service in `compose.yaml`:

   ```yaml
   AMBROGIO_VOICE_LANGUAGES: en
   AMBROGIO_VOICE_EN_STT_MODEL_DIR: /opt/ambrogio/models/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-560ms-int8-2026-06-11
   AMBROGIO_VOICE_EN_MODEL_DIR: /opt/ambrogio/voices/vits-piper-en_US-kristin-medium
   ```

   They use the speech recognition model and the English voice included in the image.

2. To speak Italian instead, list `it`, set the `AMBROGIO_VOICE_IT_*` variables and add `AMBROGIO_LANGUAGE: it`: the backend uses the profile of `AMBROGIO_LANGUAGE`, which must be in the list.

3. Recreate the backend:

   ```bash
   docker compose up -d
   ```

If the backend does not start, `docker compose logs backend` names the variable to fix; see [Troubleshooting](../troubleshoot/#the-backend-does-not-start).

## Choose another bundled voice

1. Pick a voice of the image from [Bundled models and licenses](../../reference/bundled-models/#backend).
2. Set `AMBROGIO_VOICE_<L>_MODEL_DIR` of your language (`EN` or `IT`) to its folder, for example:

   ```yaml
   AMBROGIO_VOICE_IT_MODEL_DIR: /opt/ambrogio/voices/vits-piper-it_IT-riccardo-x_low
   ```

3. Recreate the backend with `docker compose up -d`.

## Mount your own voice or speech recognition model

1. Get the model:
   - a voice: a Piper voice converted for sherpa-onnx;
   - speech recognition: a sherpa-onnx streaming transducer from the [sherpa-onnx pretrained models](https://k2-fsa.github.io/sherpa/onnx/pretrained_models/index.html), one that recognises the language you speak.

   Check that its folder has the files listed in [Backend configuration](../../reference/backend-configuration/#voice), and check its license.

2. Put it under a folder of your installation, for example `~/ambrogio/models/voices/my-voice` or `~/ambrogio/models/stt/my-model`.

3. Mount that folder read-only in the `backend` service of `compose.yaml`, under `/custom-models` so that the bundled models stay available:

   ```yaml
   volumes:
     - ./agents:/etc/ambrogio/agents:ro
     - ./models:/custom-models:ro
   ```

4. Point the variable of your language to the path inside the container:

   ```yaml
   AMBROGIO_VOICE_EN_MODEL_DIR: /custom-models/voices/my-voice
   AMBROGIO_VOICE_EN_STT_MODEL_DIR: /custom-models/stt/my-model
   ```

5. Recreate the backend with `docker compose up -d`.

[How voice works](../../explanation/voice/) explains why only these model families are supported.
