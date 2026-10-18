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
git clone https://github.com/adrianofoschi/ambrogio-backend.git
cd ambrogio-backend
pnpm install --frozen-lockfile
pnpm build
```

## Configure

Create the configuration folder and an archive folder, then write the files described in [Run the backend with Docker](/how-to/run-backend-docker/#3-write-the-configuration). Use host paths instead of container paths:

```bash
sudo mkdir -p /etc/ambrogio/agents /var/lib/ambrogio
sudo chown -R "$USER" /etc/ambrogio /var/lib/ambrogio
```

```json title="/etc/ambrogio/conversations.json"
{ "archivePath": "/var/lib/ambrogio/conversations.sqlite", "language": "it" }
```

The other files (`http.json`, `agents/orchestrator.json` and at least one more agent) are the same as with Docker. With `"host": "127.0.0.1"` only programs on the same machine can connect; use `0.0.0.0` or the host's LAN address to let other devices in.

## Start

```bash
AMBROGIO_HTTP_CONFIG_PATH=/etc/ambrogio/http.json \
AMBROGIO_CONVERSATIONS_CONFIG_PATH=/etc/ambrogio/conversations.json \
node apps/server/dist/main.js
```

Add `AMBROGIO_VOICE_CONFIG_PATH=/etc/ambrogio/voice.json` to enable voice. Without Docker there are no bundled voices: download a sherpa-onnx Piper voice yourself, as described in [Change the voice](/how-to/change-voice/#use-a-different-voice).

Stop the server with `Ctrl+C` or `SIGTERM`. Turns that are still being answered at that moment are saved as *interrupted*; see [Turns and outcomes](/explanation/turns/#when-the-server-stops).

## Update

```bash
git pull
pnpm install --frozen-lockfile
pnpm build
```

Then restart the server. Database changes are applied automatically at startup. Back up the archive first; see [Back up and upgrade](/how-to/back-up-and-upgrade/).
