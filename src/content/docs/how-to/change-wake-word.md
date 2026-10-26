---
title: Change the wake word
description: Choose another wake word, tune its sensitivity, or replace the keyword spotting model.
sidebar:
  label: Change the wake word
---

The wake word is set per satellite, with the `AMBROGIO_WAKE_WORD` and `AMBROGIO_WAKE_WORD_THRESHOLD` environment variables. With Docker Compose, add them to the satellite service's `environment` section in the Compose file and recreate the satellite; on the host, export them before starting it.

## Choose another word

The wake word is plain text; no model training is needed. The default is `Alexa`.

1. Pick a word or a short phrase. The bundled model was trained on English speech, so words that sound English work best.
2. Set it, for example:

   ```yaml
   AMBROGIO_WAKE_WORD: Hey Computer
   ```

   Use only the letters `A`–`Z` and `a`–`z`, with single spaces between words and apostrophes only inside a word, as in `Ambrogio's`. The whole text may be at most 64 characters. Letter case does not matter.
3. Recreate the satellite.
4. Say the new word a few times from where you usually speak, and check that each time the log shows `satellite_wake_detected`.

If the text breaks these rules, or the model's vocabulary cannot represent it, the satellite exits with `"event":"invalid_configuration"` and `"variable":"AMBROGIO_WAKE_WORD"`. [Satellite configuration](../../reference/satellite-configuration/#wake-word) lists the rules.

## Make it more or less sensitive

`AMBROGIO_WAKE_WORD_THRESHOLD` is how sure the keyword spotter must be before it reacts. It is a number above 0 and below 1; the default is `0.25`.

1. Watch the log while the satellite runs for a while.
2. Adjust the threshold in small steps:
   - If the satellite wakes up when nobody called it, and the log shows `satellite_wake_detected`, raise it a little, for example to `0.3`.
   - If it often misses you, lower it a little, for example to `0.2`.
3. Set the new value, for example `AMBROGIO_WAKE_WORD_THRESHOLD: "0.3"`, and recreate the satellite.

A `satellite_wake_rejected` line means the word was spotted but no speech was heard around it, so the satellite ignored it; a higher threshold is not needed for those. See [Logs](../../reference/logs/#satellite).

## Replace the keyword spotting model

You can use another [sherpa-onnx keyword spotting model](https://k2-fsa.github.io/sherpa/onnx/kws/pretrained_models/index.html), for example one trained on another language. It must be a transducer with a SentencePiece vocabulary. This works with Docker.

1. Prepare a folder that contains exactly one `encoder*.onnx` file, one `decoder*.onnx` file and one `joiner*.onnx` file, plus `tokens.txt` and `bpe.model`.
2. Mount it read-only over the bundled model in the satellite service of your Compose file:

   ```yaml
   volumes:
     - /path/to/kws-model:/app/models/kws:ro
   ```

3. Set `AMBROGIO_WAKE_WORD` to a word that the new model's vocabulary can represent.
4. Recreate the satellite.

If the folder does not have this layout, the satellite does not start: the log shows `satellite_startup_failed` with `Wake word model could not be loaded`.

:::note[Licenses]
For a model you mount, keeping track of where it came from and under which license is up to you. The bundled models are listed in [Bundled models and licenses](../../reference/bundled-models/#satellite).
:::
