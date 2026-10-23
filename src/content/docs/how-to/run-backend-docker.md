---
title: Run the backend with Docker
description: Run the Ambrogio backend with Docker Compose and TypeScript configuration.
sidebar:
  label: Run the backend with Docker
---

## Before you start

- A Linux host with Docker Compose.
- A Mistral API key, or credentials for another [supported provider](../../reference/agent-configuration/#providers).
- The backend release checkout for the Compose file and TypeScript modules.

## 1. Get the Compose example

```bash
git clone https://github.com/ambrogio-app/ambrogio-backend.git
cd ambrogio-backend
git checkout v0.9.0
```

`compose.example.yaml` mounts the TypeScript modules in `examples/` and stores the conversation archive in a Docker volume. The backend reads the exported objects once at startup. See [Backend configuration](../../reference/backend-configuration/) and [Agent configuration](../../reference/agent-configuration/) for the fields.

## 2. Set the environment

Create a local `.env` beside `compose.example.yaml`:

```dotenv
AMBROGIO_VERSION=v0.9.0
MISTRAL_API_KEY=<your-api-key>
AMBROGIO_LANGUAGE=en
```

Compose pulls the versioned image when you start the service. Keep `.env` private. The Compose file maps each supported variable into the container's `environment` section; a new variable in `.env` has no effect until you map it there. The `examples/*.ts` modules read those variables through `process.env`. To use another provider, set the provider, model and API key variables shown in `compose.example.yaml`.

## 3. Start and check

```bash
docker compose -f compose.example.yaml up -d
curl -s http://localhost:3000/api/conversations
```

A JSON response with `items` and `nextCursor` shows that the backend is running. Read failures with `docker compose -f compose.example.yaml logs backend` and [Troubleshooting](../troubleshoot/).

The example enables voice and mounts `examples/voice.ts`. To disable it, remove `AMBROGIO_VOICE_CONFIG_PATH` from the service environment; [Enable voice](../enable-voice/) covers its settings. To add a specialist agent, mount its `.ts` module in `/etc/ambrogio/agents/`; see [Add an agent](../add-agent/).
