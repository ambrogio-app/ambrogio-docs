---
title: Install a voice satellite
description: Put an Ambrogio voice satellite on a Raspberry Pi or another Linux device in a room of your home.
sidebar:
  label: Install a voice satellite
---

A satellite is a Linux device with a microphone and a speaker. It listens for the wake word and talks to the backend over your network. You can run one in each room.

## Before you start

- The backend has voice enabled. If it does not, follow [Enable voice](../enable-voice/) first. A satellite connected to a backend without voice answers every request with an error tone.
- The device runs Linux on x86_64 or arm64, for example a Raspberry Pi 4 or 5 with a 64-bit OS, or a mini PC.
- A microphone and a speaker that work with ALSA.
- The backend's address as seen from the device, for example `http://192.168.1.20:3000`.

You can run the satellite directly on the host or in Docker. The configuration file is the same for both.

## 1. Get the satellite

### On the host

Install Node.js 24 or later and the runtime libraries:

```bash
sudo apt install libasound2 libgomp1    # libasound2t64 on recent Ubuntu
```

Then build the satellite:

```bash
git clone https://github.com/ambrogio-app/ambrogio-satellite.git
cd ambrogio-satellite
npm install --global pnpm
pnpm install --frozen-lockfile
pnpm build
```

### With Docker

Build the image on the device, or on another machine with the same architecture:

```bash
git clone https://github.com/ambrogio-app/ambrogio-satellite.git
cd ambrogio-satellite
docker build -t ambrogio-satellite .
```

Releases are also published as images for amd64 and arm64, for example `ghcr.io/ambrogio-app/ambrogio-satellite:v0.3.0`. To use one, pull it and put its name in place of `ambrogio-satellite` in the commands below. [Versions and compatibility](../../reference/versions/) lists the releases.

## 2. Write the configuration

Start from the example in the repository:

```bash
cp config.example.json config.json
```

Set the backend address and a name for the room:

```json title="config.json"
{
  "backend": { "baseUrl": "http://192.168.1.20:3000" },
  "client": { "id": "kitchen", "name": "Kitchen" }
}
```

Give each satellite its own `client.id`; the backend uses it to tell satellites apart. Every section other than `backend` is optional. Without `audio`, the satellite uses the default microphone and speaker, and [Choose audio devices](../choose-audio-devices/) explains how to pick others. [Satellite configuration](../../reference/satellite-configuration/) lists every field.

## 3. Start it

On the host:

```bash
node dist/main.js --config config.json
```

`--config` is the only option, and it is required. Nothing can be set through environment variables.

With Docker:

```bash
docker run -d --name ambrogio-satellite --restart unless-stopped \
  --network host --device /dev/snd \
  -v "$PWD/config.json:/config/satellite.json:ro" \
  ambrogio-satellite
```

`--device /dev/snd` gives the container the sound card. If the host runs PipeWire or PulseAudio, the container may not reach the device the desktop is using. In that case run the satellite on the host, or set up the container to use the host's sound server.

## 4. Check it

Watch the log. On the host it is printed to the terminal; with Docker, run `docker logs -f ambrogio-satellite`. When the satellite is listening you see:

```
{"level":"info","time":...,"event":"satellite_ready"}
```

Say "Hey Jarvis", wait for the beep and ask something.

- If you hear two descending tones and the log shows `satellite_failure`, the satellite cannot reach the backend. From the device, run `curl http://192.168.1.20:3000/api/conversations` with your address.
- If the satellite exits at once with `"event":"invalid_configuration"`, the `field` in the same line names the setting it refused. See [Troubleshooting](../troubleshoot/#the-satellite-exits-with-invalid_configuration).
