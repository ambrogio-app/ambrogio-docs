---
title: Install Ambrogio
description: Install the Ambrogio backend and the web chat on your home server with Docker, and have your first conversation.
sidebar:
  label: Install Ambrogio
---

In this tutorial you will install Ambrogio on your home server: the backend, its database and the web chat. At the end, anyone in your family can open the chat in a browser on any device of your home network, and every conversation is stored on your server.

This is the installation you keep. The other guides add to it: a voice satellite, more agents, HTTPS.

## What you need

- A Linux x86_64 server on your home network with [Docker](https://docs.docker.com/engine/install/) and its Compose plugin.
- The address of the server on your network. This tutorial calls it `ambrogio.home.lan`: replace it with your server's name or IP address wherever it appears.
- A [Mistral](https://console.mistral.ai/) account and an API key. Each answer costs a little API credit.

This tutorial uses Mistral. To use another provider, follow it as written, but leave `MISTRAL_API_KEY` out of `.env` and `compose.yaml`; before [Start Ambrogio](#start-ambrogio), follow [Choose the LLM provider](../../how-to/choose-llm-provider/).

Check Docker on the server:

```bash
docker --version
docker compose version
```

Both commands print a version.

## Create the installation folder

```bash
mkdir -p ~/ambrogio/agents ~/ambrogio/web
cd ~/ambrogio
```

Run every command of this tutorial from `~/ambrogio`.

## Get the agents

Ambrogio answers through AI agents, each described by a JSON file. Download the two example agents of the backend release `v0.17.0`:

```bash
curl -fsSLo agents/orchestrator.json https://raw.githubusercontent.com/ambrogio-app/ambrogio-backend/v0.17.0/examples/agents/orchestrator.json
curl -fsSLo agents/generic.json https://raw.githubusercontent.com/ambrogio-app/ambrogio-backend/v0.17.0/examples/agents/generic.json
```

`orchestrator.json` chooses who answers each message; `generic.json` answers general questions. Both use Mistral models.

## Write the private settings

Create `.env`:

```dotenv title="~/ambrogio/.env"
AMBROGIO_VERSION=v0.17.0
AMBROGIO_WEB_VERSION=v0.3.1
AMBROGIO_DATABASE_PASSWORD=<database-password>
MISTRAL_API_KEY=<your-api-key>
```

For the database password, use the output of `openssl rand -hex 24`. Then make the file readable only by you, because it holds your API key:

```bash
chmod 600 .env
```

[Backend configuration](../../reference/backend-configuration/) describes every variable the backend reads.

## Write the Compose file

Create `compose.yaml`:

```yaml title="~/ambrogio/compose.yaml"
services:
  database:
    image: pgvector/pgvector:pg18
    restart: unless-stopped
    environment:
      POSTGRES_USER: ambrogio
      POSTGRES_DB: ambrogio
      POSTGRES_PASSWORD: ${AMBROGIO_DATABASE_PASSWORD:?Set AMBROGIO_DATABASE_PASSWORD}
    volumes:
      - database:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready --username ambrogio --dbname ambrogio"]
      interval: 5s
      timeout: 5s
      retries: 12

  backend:
    image: ghcr.io/ambrogio-app/ambrogio-backend:${AMBROGIO_VERSION:?Set AMBROGIO_VERSION}
    restart: unless-stopped
    depends_on:
      database:
        condition: service_healthy
    stop_grace_period: 15s
    ports:
      - "3000:3000"
    volumes:
      - ./agents:/etc/ambrogio/agents:ro
    environment:
      AMBROGIO_ENV: production
      AMBROGIO_HTTP_HOST: 0.0.0.0
      AMBROGIO_HTTP_PORT: "3000"
      AMBROGIO_PUBLIC_HTTPS: "false"
      AMBROGIO_ALLOWED_ORIGINS: http://ambrogio.home.lan:8080
      AMBROGIO_DATABASE_URL: postgres://ambrogio:${AMBROGIO_DATABASE_PASSWORD:?Set AMBROGIO_DATABASE_PASSWORD}@database:5432/ambrogio
      MISTRAL_API_KEY: ${MISTRAL_API_KEY:?Set MISTRAL_API_KEY}

  web:
    image: ghcr.io/ambrogio-app/ambrogio-web:${AMBROGIO_WEB_VERSION:?Set AMBROGIO_WEB_VERSION}
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./web/config.json:/usr/share/nginx/html/config.json:ro

volumes:
  database:
```

Three services run on the server: `database` keeps the conversations, `backend` answers them, `web` serves the chat page on port 8080.

## Tell the web chat where the backend is

Create `web/config.json`:

```json title="~/ambrogio/web/config.json"
{
  "backendUrl": "http://ambrogio.home.lan:3000",
  "language": "en"
}
```

## Start Ambrogio

```bash
docker compose up -d
```

The first start downloads the images and takes a few minutes. Then check that the backend answers:

```bash
curl -s http://localhost:3000/api/v1/conversations
```

The response is a JSON object with an empty `items` list: there are no conversations yet. If you get no response, read `docker compose logs backend`.

## Have your first conversation

On a computer or a phone of your home network, open `http://ambrogio.home.lan:8080`. On the left is the list of chats, with **New chat** selected. At the bottom is the message field.

Type a question and press `Enter`:

*"Can you recommend a book for this weekend?"*

The answer appears a few words at a time. Now ask a follow-up question that only makes sense after the first one:

*"Can you make it shorter?"*

Ambrogio knows what "it" refers to: it reads the latest turns of the conversation before every answer.

If the list shows "Cannot connect to the backend." instead, check that `AMBROGIO_ALLOWED_ORIGINS` in `compose.yaml` is exactly the address in your browser's address bar, then run `docker compose up -d` again.

## Come back to the conversation

Close the browser tab and open `http://ambrogio.home.lan:8080` again, on the same device or on another one. Your chat is in the list, named after its first message. Select it: the whole exchange is there, loaded from your server, and you can carry on.

## What you have done

You have:

- installed the Ambrogio backend, its PostgreSQL database and the web chat with Docker Compose, in `~/ambrogio`;
- had a conversation from the browser;
- found it again from any device, because the conversations are stored on your server, in the `database` volume.

Docker starts the three services again when the server restarts.

## Next steps

- [Install a voice satellite](../../how-to/install-satellite/) to talk to Ambrogio out loud.
- [Add an agent](../../how-to/add-agent/) or [connect Home Assistant](../../how-to/connect-home-assistant/).
- [Put the backend behind HTTPS](../../how-to/reverse-proxy-https/).
- [Web chat](../../reference/web-chat/#configjson) describes the fields of `config.json`.
- [Architecture](../../explanation/architecture/) explains what you have just installed.
