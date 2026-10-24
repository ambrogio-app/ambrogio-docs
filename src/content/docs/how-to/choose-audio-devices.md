---
title: Choose audio devices
description: Make the satellite use a specific microphone or speaker instead of the system default.
sidebar:
  label: Choose audio devices
---

Without `AMBROGIO_MICROPHONE` and `AMBROGIO_SPEAKER`, the satellite uses the system's default microphone and speaker. When the device has more than one, name the one you want.

## 1. List the devices

From the satellite folder, on the device itself:

```bash
node -e "import('decibri').then(d => { console.table(d.Microphone.devices()); console.table(d.Speaker.devices()); })"
```

The first table shows microphones, the second speakers. Note the `name` and `id` columns. ALSA may print some warnings first; you can ignore them.

With Docker, run the same command inside the image:

```bash
docker run --rm --device /dev/snd --entrypoint node ghcr.io/ambrogio-app/ambrogio-satellite:<version> \
  -e "import('decibri').then(d => { console.table(d.Microphone.devices()); console.table(d.Speaker.devices()); })"
```

## 2. Pick a selector

Each of `AMBROGIO_MICROPHONE` and `AMBROGIO_SPEAKER` takes a string, which works in one of two ways:

- **A stable ID** that starts with `alsa:`, copied from the `id` column, such as `alsa:plughw:CARD=Device,DEV=0`. This is the most precise choice.
- **Part of the name**, such as `"USB"` or `"ReSpeaker"`. Case does not matter. Use text that only one device's name contains; when several names match, use the ID instead.

A number is treated as text, not as the row index.

Add the selectors to the satellite service's `environment` section in the Compose file (on the host, export them instead):

```yaml
AMBROGIO_MICROPHONE: USB
AMBROGIO_SPEAKER: alsa:plughw:CARD=Headphones,DEV=0
```

You can set only one of the two; the other stays on the default.

## 3. Restart and test

Recreate the satellite with `docker compose -f compose.example.yaml up -d`. A selector that matches no device is never replaced by the default, so a mistake shows up instead of going unnoticed:

- A wrong **microphone** stops the satellite at startup, with `"event":"satellite_startup_failed"` and the message `Microphone could not be started` in the log.
- A wrong **speaker** is found only when the satellite first plays something. After the wake word you hear no beep, and the log shows `"event":"satellite_ready_cue_failed"`.

Say the wake word once after every change to check both.

Device IDs can differ between machines, and between the host and a container on the same machine. List them again after moving the satellite.
