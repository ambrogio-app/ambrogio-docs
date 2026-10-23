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
- Write access to `/etc/ambrogio`. The backend reads its agents from `/etc/ambrogio/agents`, and that path cannot be changed.

## Build

```bash
git clone https://github.com/ambrogio-app/ambrogio-backend.git
cd ambrogio-backend
pnpm install --frozen-lockfile
pnpm build
```

## Configure

Create the configuration and archive folders:

```bash
sudo mkdir -p /etc/ambrogio/agents /var/lib/ambrogio
sudo chown -R "$USER" /etc/ambrogio /var/lib/ambrogio
```

Copy the modules from `examples/` into `/etc/ambrogio/`, including `agents/orchestrator.ts` and `agents/generic.ts`. Change `archivePath` in `conversations.ts` to a host path through `AMBROGIO_ARCHIVE_PATH`, and set `MISTRAL_API_KEY` for the agents.

```bash
cp examples/http.ts examples/conversations.ts /etc/ambrogio/
cp examples/agents/orchestrator.ts examples/agents/generic.ts /etc/ambrogio/agents/
export AMBROGIO_ARCHIVE_PATH=/var/lib/ambrogio/conversations.sqlite
export AMBROGIO_LANGUAGE=en
export MISTRAL_API_KEY=<your-api-key>
```

Set `AMBROGIO_HTTP_HOST=127.0.0.1` to accept connections only from the same machine. Use `0.0.0.0` or the host LAN address for other devices.

## Start

```bash
AMBROGIO_HTTP_CONFIG_PATH=/etc/ambrogio/http.ts \
AMBROGIO_CONVERSATIONS_CONFIG_PATH=/etc/ambrogio/conversations.ts \
node apps/server/dist/main.js
```

Add `AMBROGIO_VOICE_CONFIG_PATH=/etc/ambrogio/voice.ts` to enable voice. Without Docker there are no bundled models: provide Vosk and sherpa-onnx Piper or Kokoro directories yourself, then put their host paths in `voice.ts`. See [Change the voice](../change-voice/#use-a-different-voice).

Stop the server with `Ctrl+C` or `SIGTERM`. Turns that are still being answered at that moment are saved as *interrupted*; see [Turns and outcomes](../../explanation/turns/#when-the-server-stops).

## Update

```bash
git pull
pnpm install --frozen-lockfile
pnpm build
```

Then restart the server. Database changes are applied automatically at startup. Back up the archive first; see [Back up and upgrade](../back-up-and-upgrade/).
