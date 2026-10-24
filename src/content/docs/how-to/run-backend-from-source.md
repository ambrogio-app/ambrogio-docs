---
title: Run the backend from source
description: Build and start the Ambrogio backend with Node.js and pnpm, without Docker.
sidebar:
  label: Run the backend from source
---

Use this when you want to run the backend directly on a Linux host, for example to follow the latest commits or because you do not use Docker.

## Before you start

- Linux with Node.js 24 or later and `pnpm`.
- `libgomp1` if you plan to enable voice (`sudo apt install libgomp1` on Debian and Ubuntu).

## Build

```bash
git clone https://github.com/ambrogio-app/ambrogio-backend.git
cd ambrogio-backend
pnpm install --frozen-lockfile
pnpm build
```

## Configure

Create a folder for the agent files and one for the archive, and copy the example agents:

```bash
sudo mkdir -p /etc/ambrogio/agents /var/lib/ambrogio
sudo chown -R "$USER" /etc/ambrogio /var/lib/ambrogio
cp examples/agents/orchestrator.json examples/agents/generic.json /etc/ambrogio/agents/
```

Set the variables the backend requires in production. Put them in the environment of the service that starts the backend, for example a systemd unit, or export them in the shell:

```bash
export AMBROGIO_ENV=production
export AMBROGIO_HTTP_HOST=127.0.0.1
export AMBROGIO_HTTP_PORT=3000
export AMBROGIO_PUBLIC_HTTPS=false
export AMBROGIO_ARCHIVE_PATH=/var/lib/ambrogio/conversations.sqlite
export MISTRAL_API_KEY=<your-api-key>
```

`AMBROGIO_HTTP_HOST=127.0.0.1` accepts connections only from the same machine. Use `0.0.0.0` or the host LAN address for other devices. To keep the agent files elsewhere, set `AMBROGIO_AGENTS_DIR`. [Backend configuration](../../reference/backend-configuration/) lists every variable and its default.

## Start

```bash
node apps/server/dist/main.js
```

To enable voice, set `AMBROGIO_VOICE_LANGUAGES` and the profile variables of each listed language. Without Docker there are no bundled models: provide Vosk and sherpa-onnx Piper or Kokoro directories yourself and set their host paths. See [Change the voice](../change-voice/#use-a-different-voice).

## Develop with a local `.env`

For development, copy `.env.example` to `.env`, fill in the values you need and start with:

```bash
pnpm dev
```

`pnpm dev` runs `node --env-file=.env apps/server/dist/main.js`, with `AMBROGIO_ENV=development`. In development the HTTP listener defaults to `127.0.0.1:3000` without HTTPS. Variables already set in the shell take precedence over `.env`. The backend never loads `.env` by itself, so `node apps/server/dist/main.js` ignores it. Do not commit `.env`.

Stop the server with `Ctrl+C` or `SIGTERM`. Turns that are still being answered at that moment are saved as *interrupted*; see [Turns and outcomes](../../explanation/turns/#when-the-server-stops).

## Update

```bash
git pull
pnpm install --frozen-lockfile
pnpm build
```

Then restart the server. Database changes are applied automatically at startup. Back up the archive first; see [Back up and upgrade](../back-up-and-upgrade/).
