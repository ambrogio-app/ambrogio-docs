---
title: Run the backend with Docker
description: Run the Ambrogio backend with Docker Compose and environment variables.
sidebar:
  label: Run the backend with Docker
---

## Before you start

- A Linux x86_64 host with Docker Compose. For voice, its CPU needs AVX2: without it, speech recognition falls behind and the text of a voice turn arrives late.
- A Mistral API key, or credentials for another [supported provider](../../reference/agent-configuration/#providers).
- The backend release checkout for the Compose file and the example agent files.

## 1. Get the Compose example

```bash
git clone https://github.com/ambrogio-app/ambrogio-backend.git
cd ambrogio-backend
git checkout <version>
```

`compose.example.yaml` sets the variables production requires, mounts the agent files `examples/agents/orchestrator.json` and `examples/agents/generic.json` in `/etc/ambrogio/agents/` and starts a `database` service with PostgreSQL 18 (image `pgvector/pgvector:pg18`), which keeps the conversation archive in a Docker volume. The backend starts after the database accepts connections. Every other variable keeps the default the backend applies. The backend reads its configuration once at startup. See [Backend configuration](../../reference/backend-configuration/) and [Agent configuration](../../reference/agent-configuration/).

## 2. Set the environment

Create a local `.env` beside `compose.example.yaml`:

```dotenv
AMBROGIO_VERSION=<version>
AMBROGIO_DATABASE_PASSWORD=<database-password>
MISTRAL_API_KEY=<your-api-key>
```

Use only letters and digits in the database password, for example the output of `openssl rand -hex 24`: it is part of the `AMBROGIO_DATABASE_URL` that Compose builds for the backend.

Compose reads `.env` only to fill in `${AMBROGIO_VERSION}`, `${AMBROGIO_DATABASE_PASSWORD}` and `${MISTRAL_API_KEY}` in the Compose file; the backend itself never reads `.env`. Keep `.env` private. To change a setting, add its variable to the `environment` section of the service, for example `AMBROGIO_LANGUAGE: it` or `AMBROGIO_TIME_ZONE: Europe/Rome`. To use another provider, change `llm` in the agent files and pass the variable named by their `apiKeyEnv`.

## 3. Start and check

```bash
docker compose -f compose.example.yaml up -d
curl -s http://localhost:3000/api/v1/conversations
```

A JSON response with `items` and `nextCursor` shows that the backend is running. Read failures with `docker compose -f compose.example.yaml logs backend` and [Troubleshooting](../troubleshoot/).

The example enables voice in English and Italian with the bundled models. To disable it, remove `AMBROGIO_VOICE_LANGUAGES` and the `AMBROGIO_VOICE_*` variables from the service environment; [Enable voice](../enable-voice/) covers its settings. To add a specialist agent, mount its `.json` file in `/etc/ambrogio/agents/`; see [Add an agent](../add-agent/).

## A complete home installation

The [`ambrogio-homelab-example`](https://github.com/ambrogio-app/ambrogio-homelab-example) repository puts the backend together with a reverse proxy, the web chat, Home Assistant, a weather MCP server, a voice satellite and agents that use them, one Compose file per service. It is an example: it is not updated with every release, and its README names the releases it was written for.
