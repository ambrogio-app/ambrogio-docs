---
title: Enable voice
description: Use the Italian and English speech models included in the backend image.
sidebar:
  label: Enable voice
---

Voice is off until the backend is given a voice configuration file. Text chat works either way. The Docker image already includes Vosk, Piper and Kokoro models for Italian and English.

## 1. Write `voice.json`

Create `/srv/ambrogio/config/voice.json` with the paths of the models you want. This example chooses a Piper voice for each language:

```json title="/srv/ambrogio/config/voice.json"
{
  "languages": {
    "it": {
      "voskModelPath": "/opt/ambrogio/models/vosk-model-small-it-0.22",
      "voiceEngine": "piper",
      "voiceModelDir": "/opt/ambrogio/voices/vits-piper-it_IT-paola-medium"
    },
    "en": {
      "voskModelPath": "/opt/ambrogio/models/vosk-model-small-en-us-0.15",
      "voiceEngine": "piper",
      "voiceModelDir": "/opt/ambrogio/voices/vits-piper-en_US-kristin-medium"
    }
  }
}
```

`language` in `conversations.json` selects `it` or `en`. The backend also instructs answering agents to use that language. You can select Riccardo, Kokoro or models from your own Docker mount by changing the paths in the relevant profile; see [Change the voice](../change-voice/).

## 2. Restart the backend with voice

Recreate the container with the voice variable. No model mounts are needed for the models in the example:

```bash
docker rm -f ambrogio
docker run -d --name ambrogio --restart unless-stopped \
  -p 3000:3000 \
  -v /srv/ambrogio/config:/etc/ambrogio:ro \
  -v /srv/ambrogio/data:/data \
  -e AMBROGIO_HTTP_CONFIG_PATH=/etc/ambrogio/http.json \
  -e AMBROGIO_CONVERSATIONS_CONFIG_PATH=/etc/ambrogio/conversations.json \
  -e AMBROGIO_VOICE_CONFIG_PATH=/etc/ambrogio/voice.json \
  IMAGE
```

With Docker Compose, add `AMBROGIO_VOICE_CONFIG_PATH: /etc/ambrogio/voice.json` under the backend service's `environment` section and keep the configuration directory mounted at `/etc/ambrogio`.

When running from source, download or provide the models yourself and use paths visible to the backend process. Set `AMBROGIO_VOICE_CONFIG_PATH` before starting it.

## 3. Check it

Connect a satellite ([Install a voice satellite](../install-satellite/)) and ask a question. The backend loads the selected Vosk and voice models before listening. If it cannot load them, startup fails and its log has a `server_startup_failed` line.

## Turn voice off again

Remove `AMBROGIO_VOICE_CONFIG_PATH` and restart. Setting the variable to an empty string is an error; leave it out entirely.
