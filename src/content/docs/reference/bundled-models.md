---
title: Bundled models and licenses
description: The speech, voice and wake word models shipped with Ambrogio, where they come from and under which license.
sidebar:
  label: Bundled models and licenses
---

Ambrogio's source code is released under the MIT license. The models it ships with are separate works with their own licenses.

## Backend

| Model | Use | Location | License |
|---|---|---|---|
| Piper voice *Paola* (medium), sherpa-onnx conversion | Speech synthesis | `/opt/ambrogio/voices/vits-piper-it_IT-paola-medium` in the image | MIT, from [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices); converted by k2-fsa |
| Piper voice *Riccardo* (x_low), sherpa-onnx conversion | Speech synthesis | `/opt/ambrogio/voices/vits-piper-it_IT-riccardo-x_low` in the image | MIT, as above |

The voices are downloaded from the [sherpa-onnx `tts-models` release](https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models) when the image is built, and their SHA-256 checksums are verified. Each folder includes the voice's model card. The backend repository's `voices/README.md` lists the checksums.

The Vosk speech recognition model is **not** bundled. You download it yourself from [alphacephei.com/vosk/models](https://alphacephei.com/vosk/models); its license is stated there.

## Satellite

| Model | Use | Location | License |
|---|---|---|---|
| openWakeWord `hey_jarvis_v0.1.onnx` | Wake word "Hey Jarvis" | `models/wakeword/` | CC BY-NC-SA 4.0 |
| openWakeWord `hey_mycroft_v0.1.onnx` | Wake word "Hey Mycroft" | `models/wakeword/` | CC BY-NC-SA 4.0 |
| openWakeWord `alexa_v0.1.onnx` | Wake word "Alexa" | `models/wakeword/` | CC BY-NC-SA 4.0 |
| openWakeWord `melspectrogram.onnx`, `embedding_model.onnx` | Shared by all wake words | `models/wakeword/` | CC BY-NC-SA 4.0 |
| Silero VAD | Detecting when you speak | inside the Decibri package | MIT, see `models/SILERO-LICENSE.txt` |

The wake word models come from the [openWakeWord v0.5.1 release](https://github.com/dscripka/openWakeWord/releases/tag/v0.5.1).

:::caution[Non-commercial use]
The bundled wake word models are licensed **CC BY-NC-SA 4.0**: you may use them only for non-commercial purposes. If that does not fit your situation, replace them with models whose license does; see [Change the wake word](../../how-to/change-wake-word/#add-your-own-wake-word).
:::

The satellite also ships two short recordings, `backend-unavailable.wav` and `voice-unavailable.wav`, generated with the Piper *Riccardo* voice (MIT). The model used to make them is not included.
