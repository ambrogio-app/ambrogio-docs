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

You can run the satellite directly on the host or in Docker. Both read the same environment variables.

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

Get the matching Compose file:

```bash
git clone https://github.com/ambrogio-app/ambrogio-satellite.git
cd ambrogio-satellite
git checkout <version>
```

Compose pulls the versioned image for the device's architecture.

## 2. Set the environment

The satellite reads its configuration from environment variables. `AMBROGIO_ENV` and `AMBROGIO_BACKEND_URL` are required; every other variable has a default or is optional. [Satellite configuration](../../reference/satellite-configuration/) lists them all.

For a host process:

```bash
export AMBROGIO_ENV=production
export AMBROGIO_BACKEND_URL=http://192.168.1.20:3000
export AMBROGIO_CLIENT_ID=kitchen
export AMBROGIO_CLIENT_NAME=Kitchen
```

Give each satellite a distinct `AMBROGIO_CLIENT_ID`. Without it the satellite uses `satellite-<hostname>`.

For Docker Compose, create `.env` next to `compose.example.yaml`:

```dotenv
AMBROGIO_SATELLITE_VERSION=<version>
AMBROGIO_BACKEND_URL=http://192.168.1.20:3000
```

The example Compose file sets `AMBROGIO_ENV: production` and passes `AMBROGIO_BACKEND_URL`. To set another variable, add it to the satellite service's `environment` section, for example:

```yaml
AMBROGIO_CLIENT_ID: kitchen
AMBROGIO_CLIENT_NAME: Kitchen
```

Keep `.env` private.

## 3. Start it

On the host:

```bash
node dist/main.js
```

With Docker Compose:

```bash
docker compose -f compose.example.yaml up -d
```

The example Compose file uses the host network and gives the container access to `/dev/snd`. If the host sound server holds the device, run the satellite on the host or configure access to that server.

## 4. Check it

Watch the log. On the host it is printed to the terminal; with Compose, run `docker compose -f compose.example.yaml logs -f satellite`. When the satellite is listening you see:

```
{"level":"info","time":...,"event":"satellite_ready"}
```

Say "Hey Jarvis", wait for the beep and ask something.

- If you hear two descending tones and the log shows `satellite_failure`, the satellite cannot reach the backend. From the device, run `curl http://192.168.1.20:3000/api/v1/conversations` with your address.
- If the satellite exits at once with `"event":"invalid_configuration"`, the `variable` in the same line names the variable it refused and `condition` says whether it is `missing` or `invalid`. See [Troubleshooting](../troubleshoot/#the-satellite-exits-with-invalid_configuration).
