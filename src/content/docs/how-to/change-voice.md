---
title: Change the voice
description: Switch between the bundled Italian voices, use a different Piper voice or use a Kokoro model.
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

Keep `"voiceEngine": "piper"`, change `voiceModelDir` in `voice.json` and restart the backend:

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

4. Point `voiceModelDir` at the new voice, keep `"voiceEngine": "piper"` and recreate the container.

When running from source, put the voice anywhere and use its host path in `voiceModelDir`.

## Use Kokoro

[Kokoro](https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models) models are larger voice models with many voices in several languages. None is in the image; you download the one you want. The steps below use `kokoro-multi-lang-v1_0`; any other Kokoro model from the same release works the same way.

Before you start, check the CPU of the backend host. Kokoro needs much more computing power than the Piper voices. On a 4-core Intel Celeron N5095 it takes about 1.7 seconds to produce each second of speech, so answers start late and pause between sentences; keep a Piper voice on hardware of that class. A recent desktop CPU is fast enough.

1. Download the model on the backend host, check its checksum and unpack it:

   ```bash
   sudo mkdir -p /srv/ambrogio/kokoro && cd /srv/ambrogio/kokoro
   sudo curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_0.tar.bz2
   echo "c5f7e2d2caf082bc1d20fb70334a61d99d20b484500aad32e7cf84c128ea3298  kokoro-multi-lang-v1_0.tar.bz2" | sha256sum -c
   sudo tar xjf kokoro-multi-lang-v1_0.tar.bz2
   ```

   `sha256sum` must print `OK`. The checksum is the one listed in the backend repository's `voices/README.md`; for other archives, check them against their release.

2. Check the folder. It must contain exactly one `.onnx` file, `voices.bin`, `tokens.txt` and an `espeak-ng-data` folder:

   ```bash
   ls /srv/ambrogio/kokoro/kokoro-multi-lang-v1_0
   ```

3. Mount the folder in its own place by adding this to your `docker run` command:

   ```bash
   -v /srv/ambrogio/kokoro/kokoro-multi-lang-v1_0:/opt/ambrogio/kokoro:ro
   ```

   Do not mount it over `/opt/ambrogio/voices`: that would hide the bundled voices.

4. Change `voice.json`:

   ```json title="/srv/ambrogio/config/voice.json"
   {
     "voskModelPath": "/models/vosk-model-small-it-0.22",
     "voiceEngine": "kokoro",
     "voiceModelDir": "/opt/ambrogio/kokoro",
     "voiceSpeaker": 36,
     "voiceLanguage": "it"
   }
   ```

   `voiceSpeaker` is the number of the voice in the model and `voiceLanguage` the language it reads: here 36 is `im_nicola`, an Italian male voice. For an American English female voice, use `"voiceSpeaker": 3` (`af_heart`) and `"voiceLanguage": "en"`. [Voices of `kokoro-multi-lang-v1_0`](../../reference/backend-configuration/#voices-of-kokoro-multi-lang-v1_0) lists the numbers.

5. Recreate the container, as in [Enable voice](../enable-voice/#3-restart-the-backend-with-voice), with the extra mount.

To go back to Paola, set `voiceEngine` to `piper`, remove `voiceSpeaker` and `voiceLanguage`, point `voiceModelDir` at a bundled voice and restart.

## Mind the language

The voice only reads text aloud. The language of the answers comes from the agents' instructions, and the language of speech recognition comes from the Vosk model. Change all three together; with Kokoro, also set `voiceLanguage`.
