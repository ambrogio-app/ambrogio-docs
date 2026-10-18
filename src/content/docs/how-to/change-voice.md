---
title: Change the voice
description: Switch between the bundled Italian voices or use a different Piper voice.
sidebar:
  label: Change the voice
---

The backend speaks with one voice, chosen in `voice.json`. The choice applies to every satellite and takes effect when the backend restarts.

## Switch between the bundled voices

The Docker image contains two Italian voices:

| Voice | `voiceModelDir` |
|---|---|
| Paola, medium quality | `/opt/ambrogio/voices/vits-piper-it_IT-paola-medium` |
| Riccardo, low quality, lighter | `/opt/ambrogio/voices/vits-piper-it_IT-riccardo-x_low` |

Change `voiceModelDir` in `voice.json` and restart the backend:

```bash
docker restart ambrogio
```

## Use a different voice

Ambrogio uses [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) to speak, so it needs Piper voices converted for sherpa-onnx. k2-fsa publishes many in the [`tts-models` release](https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models); their names start with `vits-piper-`.

1. Download and unpack the voice on the backend host, in a folder of voices:

   ```bash
   sudo mkdir -p /srv/ambrogio/voices && cd /srv/ambrogio/voices
   sudo curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-it_IT-paola-medium.tar.bz2
   sudo tar xjf vits-piper-it_IT-paola-medium.tar.bz2
   ```

   Replace the file name with the voice you want.

2. Check the folder. It must contain exactly one `.onnx` file, a `tokens.txt` file and an `espeak-ng-data` folder:

   ```bash
   ls /srv/ambrogio/voices/vits-piper-it_IT-paola-medium
   ```

3. Mount the folder of voices over the bundled one by adding this to your `docker run` command:

   ```bash
   -v /srv/ambrogio/voices:/opt/ambrogio/voices:ro
   ```

   The mount replaces the bundled voices completely. Keep in it every voice you want to use.

4. Point `voiceModelDir` at the new voice and recreate the container.

When running from source, put the voice anywhere and use its host path in `voiceModelDir`.

## Mind the language

The voice only reads text aloud. The language of the answers comes from the agents' instructions, and the language of speech recognition comes from the Vosk model. Change all three together. The satellite's own warning messages are recorded in Italian and do not change.
