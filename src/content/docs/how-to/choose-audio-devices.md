---
title: Choose audio devices
description: Make the satellite use a specific microphone or speaker instead of the system default.
sidebar:
  label: Choose audio devices
---

Without an `audio` section, the satellite uses the system's default microphone and speaker. When the device has more than one, name the one you want.

## 1. List the devices

From the satellite folder, on the device itself:

```bash
node -e "import('decibri').then(d => { console.table(d.Microphone.devices()); console.table(d.Speaker.devices()); })"
```

The first table shows microphones, the second speakers. Note the `name` and `id` columns. ALSA may print some warnings first; you can ignore them.

With Docker, run the same command inside the image:

```bash
docker run --rm --device /dev/snd --entrypoint node ghcr.io/ambrogio-app/ambrogio-satellite:v0.5.0 \
  -e "import('decibri').then(d => { console.table(d.Microphone.devices()); console.table(d.Speaker.devices()); })"
```

## 2. Pick a selector

Each of `audio.microphone` and `audio.speaker` takes a string, which works in one of two ways:

- **A stable ID** that starts with `alsa:`, copied from the `id` column, such as `alsa:plughw:CARD=Device,DEV=0`. This is the most precise choice.
- **Part of the name**, such as `"USB"` or `"ReSpeaker"`. Case does not matter. Use text that only one device's name contains; when several names match, use the ID instead.

A number is treated as text, not as the row index.

Set the device selectors in the satellite Compose `.env`:

```dotenv
AMBROGIO_MICROPHONE=USB
AMBROGIO_SPEAKER=alsa:plughw:CARD=Headphones,DEV=0
```

You can set only one of the two; the other stays on the default.

## 3. Restart and test

Recreate the satellite with `docker compose -f compose.example.yaml up -d`. A selector that matches no device is never replaced by the default, so a mistake shows up instead of going unnoticed:

- A wrong **microphone** stops the satellite at startup, with `"event":"satellite_process_failed"` in the log.
- A wrong **speaker** is found only when the satellite first plays something. After the wake word you hear no beep, and the log shows `"event":"satellite_ready_cue_failed"`.

Say the wake word once after every change to check both.

Device IDs can differ between machines, and between the host and a container on the same machine. List them again after moving the satellite.
