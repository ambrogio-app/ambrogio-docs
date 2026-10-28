---
title: Change the wake word
description: Choose another wake word, tune its sensitivity, or replace the keyword spotting model.
sidebar:
  label: Change the wake word
---

[How voice works](../../explanation/voice/#on-the-satellite) explains how the satellite hears the wake word. The wake word is set per satellite, with the `AMBROGIO_WAKE_WORD` and `AMBROGIO_WAKE_WORD_THRESHOLD` environment variables. Add them to the `environment` section of the satellite's `compose.yaml` and recreate it with `docker compose up -d`.

## Choose another word

1. Pick a word or a short phrase that follows the [wake word rules](../../reference/satellite-configuration/#wake-word). Words that sound English work best with the bundled model.
2. Set it, for example:

   ```yaml
   AMBROGIO_WAKE_WORD: Hey Computer
   ```

3. Recreate the satellite.
4. Say the new word a few times from where you usually speak, and check that each time the log shows `satellite_wake_detected`.

If the satellite exits with `"event":"invalid_configuration"` and `"variable":"AMBROGIO_WAKE_WORD"`, the word breaks the rules or the model cannot represent it: choose another.

## Make it more or less sensitive

1. Watch the log while the satellite runs for a while.
2. Adjust the threshold in small steps:
   - If the satellite wakes up when nobody called it, and the log shows `satellite_wake_detected`, raise it a little, for example to `0.3`.
   - If it often misses you, lower it a little, for example to `0.2`.
3. Set the new value, for example `AMBROGIO_WAKE_WORD_THRESHOLD: "0.3"`, and recreate the satellite.

`satellite_wake_rejected` lines do not call for a higher threshold: the satellite already ignored those detections. See [Logs](../../reference/logs/#satellite).

## Replace the keyword spotting model

You can use another [sherpa-onnx keyword spotting model](https://k2-fsa.github.io/sherpa/onnx/kws/pretrained_models/index.html), for example one trained on another language.

1. Prepare a folder with the files listed in [Satellite configuration](../../reference/satellite-configuration/#wake-word).
2. Mount it read-only over the bundled model in the satellite's `compose.yaml`:

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
