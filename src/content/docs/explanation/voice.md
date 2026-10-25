---
title: How voice works
description: The path from your voice to Ambrogio's, what runs on the satellite and what runs on the backend.
sidebar:
  label: How voice works
---

Voice work is split between the satellite and the backend. The satellite decides *when* you are talking to Ambrogio. The backend works out *what* you said and how to say the answer.

```mermaid
flowchart LR
    subgraph sat[Satellite]
        MIC[Microphone] --> WW[Wake word]
        WW --> VAD[Speech detection]
        SPK[Speaker]
    end
    subgraph back[Backend]
        STT[Whisper<br/>speech to text]
        AG[Agents]
        TTS[Piper or Kokoro voice<br/>text to speech]
    end
    VAD -- "audio of your request" --> STT
    STT --> AG --> TTS
    TTS -- "audio of the answer" --> SPK
```

## On the satellite

**The wake word.** The microphone is always open, but the audio goes only to a small keyword spotting model running on the device. Nothing is sent anywhere until it hears "Alexa" or the word you chose. The satellite never writes audio to disk.

The wake word is plain text, not a model trained for one word. The satellite splits it into the pieces of the model's vocabulary, and the keyword spotter listens for that sequence. You can pick any word without training anything. The price is accuracy: the bundled model learned from English speech, so English-sounding words work best, and how often a word is missed or heard by mistake depends on the word, the model and the threshold you choose.

**Checking that someone spoke.** The same audio also goes to the speech detector. A detection counts only if the detector heard speech in the last second and a half; otherwise the satellite discards it and logs `satellite_wake_rejected`. This filters out noises that the keyword spotter mistakes for the word.

**The beep.** After the wake word, the satellite makes sure its session with the backend is ready, then plays a short beep. The beep is a promise: from this moment the backend can receive what you say. If the backend is unreachable you hear a warning instead of the beep.

**Speech detection.** The speech detector, the Silero VAD model, also finds the start and end of your request. The satellite starts sending only once it is confident you are speaking, and stops when you have been silent for about two-thirds of a second. That pause is what ends your request; there is no button.

**Saying it in one breath.** The satellite keeps the last second and a half of audio in memory. When you say *"Alexa, what's the weather like?"* without stopping, the start of the question was spoken before the beep; that buffer means it is not lost.

## On the backend

**Recognition after you stop.** The backend keeps your audio in memory as it arrives and passes it to Whisper once the satellite says you have finished. Whisper reads the whole request, in pieces of at most 30 seconds, so the time it takes is added to every voice turn. One multilingual model serves both Italian and English. The transcription becomes the text of the turn, exactly as if you had typed it. If it comes out empty, the turn is refused with "I didn't understand the request."

**Speaking while it thinks.** The answer is spoken a sentence at a time, as soon as each sentence is complete, instead of waiting for the whole text. Before speaking, the backend strips Markdown symbols such as asterisks, link addresses and table bars, so the voice does not read them out. The stored text keeps its formatting.

**One voice for the house.** The backend loads one voice at startup. All satellites speak with it. When several satellites are answering at once, their sentences are synthesised one after another, because the voice engine handles one sentence at a time.

**Two kinds of voice.** The backend speaks with [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx), which runs either a Piper voice or a Kokoro model inside the backend process. The image includes Italian and English Piper voices and one multilingual Kokoro model. It also includes one multilingual Whisper model for recognition in both languages. `AMBROGIO_LANGUAGE` selects the matching voice profile, whose paths can point to bundled or mounted models. The example configuration chooses Piper because it runs fast enough on a low-power mini PC. Kokoro sounds more natural but needs several times more computing power: on a 4-core Celeron N5095 it is slower than speech itself, so answers would start late and stop between sentences. Both use espeak-ng to turn text into sounds in the language of the voice.

**One speech engine.** The satellite and the backend run all their speech models with [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx): wake word, speech detection, recognition and synthesis. One engine means fewer native libraries, smaller images and fewer combinations to test. A model of a family that Ambrogio supports can be swapped with files and configuration alone; a new family needs a change to the code.

## Follow-up replies

When an answer asks you something, the agent marks it as expecting a reply. After the satellite has played the whole answer, it beeps and listens again in the same conversation, without the wake word. If you do not start speaking within 15 seconds (configurable with `AMBROGIO_REPLY_TIMEOUT_MS`), it goes back to waiting for the wake word.

Each wake word starts a new conversation. A follow-up reply is the only way a satellite continues an existing one. To continue an older conversation, use the terminal client.

While the satellite is speaking, it does not listen. You cannot interrupt an answer.

## When something goes wrong

The satellite always ends an interaction by going back to the wake word. If the backend cannot be reached, the session drops, or no outcome arrives within 60 seconds, it plays a short error tone, two descending notes, and waits for the next wake word. It never resends a request by itself.

If the backend has no voice configured, it answers in text, and the satellite plays the same error tone instead. A tone works whatever language and voice you choose; the log, or the same conversation in the web chat or the terminal client, tells you what went wrong.

## Privacy

- No audio leaves the satellite before the wake word.
- Audio reaches the backend only after the beep and only until the end of your request.
- Neither the satellite nor the backend stores audio. Conversations are stored as text.
- Recognition and synthesis run on your server. Only the transcribed text goes to the language model in the cloud.
