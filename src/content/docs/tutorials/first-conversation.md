---
title: Your first conversation
description: Run the Ambrogio backend on one machine and chat with it from the terminal client.
sidebar:
  label: Your first conversation
---

In this tutorial you will start an Ambrogio backend on your own computer and talk to it from the terminal client. At the end you will have a working installation with one answering AI agent, and a conversation saved on your server that you can reopen later.

Allow time for the image build and dependencies. Everything runs on one Linux machine. Voice comes later, in [Talk to Ambrogio out loud](../talk-out-loud/).

## What you need

- A Linux computer with [Docker](https://docs.docker.com/engine/install/), `git` and Node.js 24 or later.
- A [Mistral](https://console.mistral.ai/) account and an API key. This tutorial uses Mistral models, and each answer costs a little API credit.

Check the tools before you start:

```bash
docker --version
git --version
node --version
```

`node --version` must print `v22` or higher.

## Build the backend image

Clone the backend and build its Docker image:

```bash
mkdir -p ~/ambrogio/src && cd ~/ambrogio/src
git clone https://github.com/ambrogio-app/ambrogio-backend.git
cd ambrogio-backend
docker build -t ghcr.io/ambrogio-app/ambrogio-backend:local .
```

The build downloads dependencies and two bundled voices, so the first run takes a few minutes. When it finishes, the last line mentions `ghcr.io/ambrogio-app/ambrogio-backend:local`.


## Configure and start the backend

The repository includes TypeScript configuration modules and a Compose example. The modules read environment variables and export the values the backend validates at startup. In `ambrogio-backend`, create `.env`:

```dotenv
AMBROGIO_VERSION=local
MISTRAL_API_KEY=<your-api-key>
AMBROGIO_LANGUAGE=en
```

The locally built image contains the TypeScript loader. Keep `.env` private. The example Compose file maps these variables into the container. Start the backend:

```bash
docker compose -f compose.example.yaml up -d
curl -s http://localhost:3000/api/conversations
```

The response has empty `items` and a `nextCursor`. If it does not, check `docker compose -f compose.example.yaml logs backend` and [Troubleshooting](../../how-to/troubleshoot/). The example also enables voice, using models included in the image.

## Install the terminal client

Open a second terminal and build the client:

```bash
cd ~/ambrogio/src
git clone https://github.com/ambrogio-app/ambrogio-cli.git
cd ambrogio-cli
npm install --global pnpm@12.11.2
pnpm install --frozen-lockfile
pnpm build
```

## Talk to Ambrogio

Start the client and point it at your backend:

```bash
pnpm start --server http://localhost:3000
```

The screen splits in two. On the left is the list of chats, with **New chat** selected. On the right is the conversation, with the input field at the bottom.

Type a question and press `Enter`:

```
Can you recommend a book for this weekend?
```

The answer appears a few words at a time. When it stops, the turn is complete and saved on the server. Ask a follow-up question that only makes sense with the previous one:

```
Can you make it shorter?
```

Ambrogio knows what "it" refers to, because the backend sends the whole conversation to the agent with every new turn.

## Come back to the conversation

Press `Ctrl+Q` to quit, then start the client again with the same command. Your chat is now in the list on the left, named after its first message.

Press `Tab` to move to the list, select the chat with the arrow keys and press `Enter`. The whole exchange is there, loaded from the backend. Press `Tab` again to return to the input field and carry on.

## What you have done

You have:

- built and started the Ambrogio backend with one orchestrator and one agent;
- talked to it from the terminal client;
- reopened a conversation that the backend stored in `~/ambrogio/data/conversations.sqlite`.

The backend keeps running in the background. Stop it with `docker compose -f compose.example.yaml stop` and start it again with `docker compose -f compose.example.yaml start`; your conversations survive both.

## Next steps

- [Talk to Ambrogio out loud](../talk-out-loud/) adds speech recognition, a voice and a satellite.
- [Add an agent](../../how-to/add-agent/) shows how to give Ambrogio more specialised helpers.
- [Architecture](../../explanation/architecture/) explains what happened behind the scenes.
