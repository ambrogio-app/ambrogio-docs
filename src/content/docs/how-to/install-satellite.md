---
title: Install a voice satellite
description: Put an Ambrogio voice satellite on a Raspberry Pi or another Linux device in a room of your home.
sidebar:
  label: Install a voice satellite
---

A satellite listens for the wake word in a room and talks to the backend over your network; [How voice works](../../explanation/voice/) describes what it does. Repeat this guide for each room.

## Before you start

- The device and the backend meet the [voice satellite requirements](../../reference/requirements/#voice-satellite).
- Voice is on in the backend; see [Configure voice](../configure-voice/). A satellite connected to a backend without voice answers every request with an error tone.
- You know the backend's address as the device sees it. This guide uses `http://ambrogio.home.lan:3000`.
- You chose an identifier and a name for this satellite, for example `kitchen` and `Kitchen`. Each satellite needs its own identifier.

## Install

1. On the device, create a folder for the satellite and go into it:

   ```bash
   mkdir -p ~/ambrogio-satellite && cd ~/ambrogio-satellite
   ```

2. Create `compose.yaml`:

   ```yaml title="~/ambrogio-satellite/compose.yaml"
   services:
     satellite:
       image: ghcr.io/ambrogio-app/ambrogio-satellite:v0.9.0
       restart: unless-stopped
       network_mode: host
       stop_grace_period: 10s
       devices:
         - /dev/snd:/dev/snd
       environment:
         AMBROGIO_ENV: production
         AMBROGIO_BACKEND_URL: http://ambrogio.home.lan:3000
         AMBROGIO_CLIENT_ID: kitchen
         AMBROGIO_CLIENT_NAME: Kitchen
   ```

   Take the release from [Versions and compatibility](../../reference/versions/#current-state).

3. Start it:

   ```bash
   docker compose up -d
   docker compose logs -f satellite
   ```

If the device's sound server holds the audio device, give the container access to that server.

## Check it

1. Wait for this line in the log:

   ```
   {"level":"info","time":...,"event":"satellite_ready"}
   ```

2. Say "Alexa", wait for the beep and ask *"Tell me a fun fact about cats."*

Ambrogio answers out loud. The conversation also appears in the web chat.

If you hear two descending tones, or the satellite exits, see [Troubleshooting](../troubleshoot/#the-satellite-plays-two-descending-tones).

## Next

- [Choose audio devices](../choose-audio-devices/) if the satellite uses the wrong microphone or speaker.
- [Change the wake word](../change-wake-word/).
- Every variable is in [Satellite configuration](../../reference/satellite-configuration/).
