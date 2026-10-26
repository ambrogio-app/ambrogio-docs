---
title: Talk to Ambrogio out loud
description: Turn on voice in the backend, start a satellite and have a spoken conversation.
sidebar:
  label: Talk to Ambrogio out loud
---

In this tutorial you will turn on voice in the backend you set up in [Your first conversation](../first-conversation/), start a voice satellite on the same computer, and ask Ambrogio a question out loud. Then you will find that spoken conversation in the terminal client.

It takes about 20 minutes.

## What you need

- The backend from the first tutorial, running with `compose.example.yaml`.
- A microphone and a speaker (or headphones) connected to the computer.
- Node.js 24 or later.
- The ALSA runtime library. On Debian and Ubuntu:

  ```bash
  sudo apt install libasound2
  ```

  On recent Ubuntu releases the package is called `libasound2t64`.

## Check voice in the backend

The backend Compose example from the first tutorial already enables voice with `AMBROGIO_VOICE_LANGUAGES`. Its English profile uses a Piper voice and the Nemotron speech recognition model included in the image. Check that the backend still answers:

```bash
curl -s http://localhost:3000/api/v1/conversations
```

If it does not, read `docker compose -f compose.example.yaml logs backend` in the backend repository. [Backend configuration](../../reference/backend-configuration/#voice) lists the voice settings.

## Build the satellite

```bash
cd ~/ambrogio/src
git clone https://github.com/ambrogio-app/ambrogio-satellite.git
cd ambrogio-satellite
npm install --global pnpm@12.11.2
pnpm install --frozen-lockfile
pnpm build
```

## Configure the satellite

The satellite reads its configuration from environment variables. In the satellite repository, run:

```bash
export AMBROGIO_ENV=production
export AMBROGIO_BACKEND_URL=http://localhost:3000
export AMBROGIO_CLIENT_ID=desk
export AMBROGIO_CLIENT_NAME=Desk
node dist/main.js
```

The satellite writes its log as JSON lines. After a few seconds you see a line that contains:

```
"event":"satellite_ready"
```

It is now listening for the wake word, and nothing you say leaves the computer until it hears it.

## Ask a question

1. Say **"Alexa"**.
2. Wait for the short beep. It means the backend is ready to listen.
3. Ask: *"Tell me a fun fact about cats."*
4. Stop talking. After a short pause, well under a second, the satellite treats your question as finished.

A moment later Ambrogio answers out loud. When it has finished, the satellite goes back to waiting for "Alexa".

Now ask something that invites a question back, such as *"Help me choose a film for tonight."* If the answer ends with a question for you, the beep sounds again. Answer straight away, without the wake word. If you stay silent for 15 seconds, the satellite stops waiting and goes back to the wake word.

## Find the conversation in the terminal

Open another terminal and start the terminal client:

```bash
cd ~/ambrogio/src/ambrogio-cli
pnpm start --server http://localhost:3000
```

Your spoken conversations are at the top of the list. Open one: your words are there as text, as the backend transcribed them, followed by Ambrogio's answers. You can continue the conversation by typing.

Stop the satellite with `Ctrl+C` when you are done.

## What you have done

You have:

- enabled the speech recognition model and voice included in the backend image;
- started a voice satellite and talked to Ambrogio with a wake word;
- answered a follow-up question without repeating the wake word;
- read a spoken conversation in the terminal client.

## Next steps

- [Install a satellite](../../how-to/install-satellite/) on a Raspberry Pi or another device in a different room.
- [Choose audio devices](../../how-to/choose-audio-devices/) if the satellite picked the wrong microphone or speaker.
- [How voice works](../../explanation/voice/) explains the wake word, the beep and the follow-up window.
