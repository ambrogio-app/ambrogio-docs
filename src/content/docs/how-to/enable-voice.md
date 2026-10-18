---
title: Enable voice
description: Add speech recognition and speech synthesis to an existing Ambrogio backend.
sidebar:
  label: Enable voice
---

Voice is off until you give the backend a voice configuration file. Text chat works either way.

## 1. Get a Vosk model

Download a model for your language from the [Vosk model list](https://alphacephei.com/vosk/models) and unpack it on the backend host. For English, the small model works on modest hardware:

```bash
sudo mkdir -p /srv/ambrogio/models && cd /srv/ambrogio/models
sudo curl -LO https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
sudo unzip vosk-model-small-en-us-0.15.zip
```

## 2. Get a voice

The voices bundled in the Docker image speak Italian. For any other language, download a sherpa-onnx Piper voice into a folder of voices, as described in [Change the voice](../change-voice/#use-a-different-voice). For English:

```bash
sudo mkdir -p /srv/ambrogio/voices && cd /srv/ambrogio/voices
sudo curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-en_US-kristin-medium.tar.bz2
sudo tar xjf vits-piper-en_US-kristin-medium.tar.bz2
```

With Italian, skip this step, use a [bundled voice](../change-voice/#switch-between-the-bundled-voices) and leave out the voices mount in step 4.

## 3. Write `voice.json`

```json title="/srv/ambrogio/config/voice.json"
{
  "voskModelPath": "/models/vosk-model-small-en-us-0.15",
  "voiceEngine": "piper",
  "voiceModelDir": "/opt/ambrogio/voices/vits-piper-en_US-kristin-medium"
}
```

Both paths are as the backend sees them. In Docker, `/models` and `/opt/ambrogio/voices` are the mounts you add in the next step; the second replaces the bundled voices. `voiceEngine` is required: `piper` is the engine of Piper voices. To use Kokoro instead, see [Change the voice](../change-voice/#use-kokoro).

## 4. Restart the backend with voice

Recreate the container with the model and voice folders and the voice variable:

```bash
docker rm -f ambrogio
docker run -d --name ambrogio --restart unless-stopped \
  -p 3000:3000 \
  -v /srv/ambrogio/config:/etc/ambrogio:ro \
  -v /srv/ambrogio/data:/data \
  -v /srv/ambrogio/models:/models:ro \
  -v /srv/ambrogio/voices:/opt/ambrogio/voices:ro \
  -e AMBROGIO_HTTP_CONFIG_PATH=/etc/ambrogio/http.json \
  -e AMBROGIO_CONVERSATIONS_CONFIG_PATH=/etc/ambrogio/conversations.json \
  -e AMBROGIO_VOICE_CONFIG_PATH=/etc/ambrogio/voice.json \
  IMAGE
```

When running from source, set `AMBROGIO_VOICE_CONFIG_PATH` before `node apps/server/dist/main.js`.

The backend loads both models before it starts listening. If either cannot be loaded, it does not start, and the log has a `server_startup_failed` line with `Voice resources are unavailable` or `Voice components could not be loaded`.

## 5. Check it

Connect a satellite ([Install a voice satellite](../install-satellite/)) and ask a question. If the satellite answers with two descending tones and its log shows `satellite_voice_unavailable`, the backend is running without voice: check that the variable is set in the container with `docker inspect ambrogio`.

## Turn voice off again

Remove `AMBROGIO_VOICE_CONFIG_PATH` and restart. Setting the variable to an empty string is an error; leave it out entirely.
