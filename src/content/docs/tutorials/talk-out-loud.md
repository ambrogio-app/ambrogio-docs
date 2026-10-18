---
title: Talk to Ambrogio out loud
description: Turn on voice in the backend, start a satellite and have a spoken conversation.
sidebar:
  label: Talk to Ambrogio out loud
---

In this tutorial you will turn on voice in the backend you set up in [Your first conversation](../first-conversation/), start a voice satellite on the same computer, and ask Ambrogio a question out loud. Then you will find that spoken conversation in the terminal client.

It takes about 20 minutes.

## What you need

- The backend from the first tutorial, with its configuration in `~/ambrogio/config`.
- A microphone and a speaker (or headphones) connected to the computer.
- Node.js 24 or later. The satellite needs a newer Node.js than the terminal client.
- The ALSA and OpenMP runtime libraries. On Debian and Ubuntu:

  ```bash
  sudo apt install libasound2 libgomp1
  ```

  On recent Ubuntu releases the first package is called `libasound2t64`.

## Download a speech recognition model

The backend uses [Vosk](https://alphacephei.com/vosk/models) to turn speech into text. The model is not inside the Docker image, so download the small Italian one:

```bash
mkdir -p ~/ambrogio/models && cd ~/ambrogio/models
curl -LO https://alphacephei.com/vosk/models/vosk-model-small-it-0.22.zip
unzip vosk-model-small-it-0.22.zip
ls vosk-model-small-it-0.22
```

You should see folders such as `am`, `conf` and `graph`.

## Turn on voice in the backend

Voice has its own configuration file. Create `voice.json` next to the others:

```json title="~/ambrogio/config/voice.json"
{
  "voskModelPath": "/models/vosk-model-small-it-0.22",
  "voiceEngine": "piper",
  "voiceModelDir": "/opt/ambrogio/voices/vits-piper-it_IT-paola-medium"
}
```

`voskModelPath` is where the container will see the model you just downloaded. `voiceEngine` says the voice is a Piper voice, and `voiceModelDir` picks Paola, one of the two Italian voices already inside the image.

Replace the running container with one that has the model folder and the new file:

```bash
docker rm -f ambrogio
docker run -d --name ambrogio -p 3000:3000 \
  -v ~/ambrogio/config:/etc/ambrogio:ro \
  -v ~/ambrogio/data:/data \
  -v ~/ambrogio/models:/models:ro \
  -e AMBROGIO_HTTP_CONFIG_PATH=/etc/ambrogio/http.json \
  -e AMBROGIO_CONVERSATIONS_CONFIG_PATH=/etc/ambrogio/conversations.json \
  -e AMBROGIO_VOICE_CONFIG_PATH=/etc/ambrogio/voice.json \
  ambrogio-backend:local
```

Removing the container does not touch your conversations: they live in `~/ambrogio/data`.

Check that the backend came up:

```bash
curl http://localhost:3000/api/conversations
```

You get the list of conversations, now with the one from the first tutorial in it. If the connection is refused, `docker logs ambrogio` probably shows `Voice resources are unavailable`; check the two paths in `voice.json`.

## Build the satellite

```bash
cd ~/ambrogio/src
git clone https://github.com/ambrogio-app/ambrogio-satellite.git
cd ambrogio-satellite
npm install --global pnpm
pnpm install --frozen-lockfile
pnpm build
```

## Configure the satellite

Copy the example configuration:

```bash
cp config.example.json config.json
```

Open `config.json` and change the `client` section. The satellite introduces itself to the backend with these values:

```json title="config.json"
{
  "backend": { "baseUrl": "http://localhost:3000" },
  "client": { "id": "desk", "name": "Scrivania" },
  "audio": {},
  "wakeWord": { "model": "hey_jarvis" },
  "interaction": { "replyTimeoutMs": 15000 }
}
```

The empty `audio` section means "use the system's default microphone and speaker".

## Start the satellite

```bash
node dist/main.js --config config.json
```

The satellite writes its log as JSON lines. After a few seconds you see a line that contains:

```
"event":"satellite_ready"
```

It is now listening for the wake word, and nothing you say leaves the computer until it hears it.

## Ask a question

1. Say **"Hey Jarvis"**.
2. Wait for the short beep. It means the backend is ready to listen.
3. Ask: *"Raccontami una curiosità sui gatti."*
4. Stop talking. After a short pause, well under a second, the satellite treats your question as finished.

A moment later Ambrogio answers out loud. When it has finished, the satellite goes back to waiting for "Hey Jarvis".

Now ask something that invites a question back, such as *"Aiutami a scegliere un film per stasera."* If the answer ends with a question for you, the beep sounds again. Answer straight away, without the wake word. If you stay silent for 15 seconds, the satellite stops waiting and goes back to the wake word.

## Find the conversation in the terminal

Open another terminal and start the terminal client:

```bash
cd ~/ambrogio/src/ambrogio-cli
npm start -- --server http://localhost:3000
```

Your spoken conversations are at the top of the list. Open one: your words are there as text, as the backend transcribed them, followed by Ambrogio's answers. You can continue the conversation by typing.

Stop the satellite with `Ctrl+C` when you are done.

## What you have done

You have:

- given the backend a speech recognition model and chosen a voice;
- started a voice satellite and talked to Ambrogio with a wake word;
- answered a follow-up question without repeating the wake word;
- read a spoken conversation in the terminal client.

## Next steps

- [Install a satellite](../../how-to/install-satellite/) on a Raspberry Pi or another device in a different room.
- [Choose audio devices](../../how-to/choose-audio-devices/) if the satellite picked the wrong microphone or speaker.
- [How voice works](../../explanation/voice/) explains the wake word, the beep and the follow-up window.
