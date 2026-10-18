---
title: Your first conversation
description: Run the Ambrogio backend on one machine and chat with it from the terminal client.
sidebar:
  label: Your first conversation
---

In this tutorial you will start an Ambrogio backend on your own computer and talk to it from the terminal client. At the end you will have a working installation with one AI agent, and a conversation saved on your server that you can reopen later.

It takes about 20 minutes. Everything runs on one Linux machine. Voice comes later, in [Talk to Ambrogio out loud](../talk-out-loud/).

## What you need

- A Linux computer with [Docker](https://docs.docker.com/engine/install/), `git` and Node.js 22 or later.
- A [Mistral](https://console.mistral.ai/) account and an API key. Ambrogio's agents currently use Mistral models, and each answer costs a little API credit.

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
docker build -t ambrogio-backend:local .
```

The build downloads dependencies and two Italian voices, so the first run takes a few minutes. When it finishes, the last line mentions `ambrogio-backend:local`.

:::note
Building the image yourself works with any commit. To skip the build, use the published image `ghcr.io/ambrogio-app/ambrogio-backend:v0.1.2` in place of `ambrogio-backend:local` in the commands below. [Versions and compatibility](../../reference/versions/) lists the releases.
:::

## Write the configuration

The backend reads a few small JSON files. Create a folder for them and a folder for the database:

```bash
mkdir -p ~/ambrogio/config/agents ~/ambrogio/data
cd ~/ambrogio/config
```

First, tell the server where to listen. Create `http.json`:

```json title="~/ambrogio/config/http.json"
{ "host": "0.0.0.0", "port": 3000 }
```

Next, tell it where to store conversations and which language to use for its own messages. Create `conversations.json`:

```json title="~/ambrogio/config/conversations.json"
{ "archivePath": "/data/conversations.sqlite", "language": "it" }
```

`/data` is a path inside the container. In a moment you will connect it to `~/ambrogio/data`.

Now the agents. Every request goes first to the *orchestrator*, which picks the agent that should answer. Create `agents/orchestrator.json`, and replace `YOUR_MISTRAL_KEY` with your key:

```json title="~/ambrogio/config/agents/orchestrator.json"
{
  "instructions": "You are Ambrogio, the assistant of an Italian family.",
  "llm": {
    "provider": "mistral",
    "model": "mistral-medium-latest",
    "apiKey": "YOUR_MISTRAL_KEY"
  }
}
```

The orchestrator never answers by itself, so you need at least one agent that does. Create `agents/general.json`:

```json title="~/ambrogio/config/agents/general.json"
{
  "description": "Answers general questions and makes conversation.",
  "instructions": "You are Ambrogio, the assistant of an Italian family. Always answer in Italian, briefly and plainly.",
  "llm": {
    "provider": "mistral",
    "model": "mistral-medium-latest",
    "apiKey": "YOUR_MISTRAL_KEY"
  }
}
```

The file name, `general`, becomes the agent's name. You should now have four files:

```bash
find ~/ambrogio/config -type f
```

```
/home/you/ambrogio/config/http.json
/home/you/ambrogio/config/conversations.json
/home/you/ambrogio/config/agents/orchestrator.json
/home/you/ambrogio/config/agents/general.json
```

## Start the backend

```bash
docker run -d --name ambrogio -p 3000:3000 \
  -v ~/ambrogio/config:/etc/ambrogio:ro \
  -v ~/ambrogio/data:/data \
  -e AMBROGIO_HTTP_CONFIG_PATH=/etc/ambrogio/http.json \
  -e AMBROGIO_CONVERSATIONS_CONFIG_PATH=/etc/ambrogio/conversations.json \
  ambrogio-backend:local
```

The two `-v` options give the container your configuration (read-only) and the data folder. The two `-e` options tell the backend where its JSON files are. It finds the agents on its own, in `/etc/ambrogio/agents`.

Ask the backend for its list of conversations:

```bash
curl http://localhost:3000/api/conversations
```

```json
{"items":[],"nextCursor":null}
```

The list is empty because nobody has talked to Ambrogio yet. If `curl` cannot connect, run `docker logs ambrogio`. If it contains `Unable to start HTTP server.`, one of the files above has a mistake: the line with `server_startup_failed` just before it names the file or agent, for example `Invalid agent configuration: general`. Compare that file with the example.

## Install the terminal client

Open a second terminal and build the client:

```bash
cd ~/ambrogio/src
git clone https://github.com/ambrogio-app/ambrogio-cli.git
cd ambrogio-cli
npm ci
npm run build
```

## Talk to Ambrogio

Start the client and point it at your backend:

```bash
npm start -- --server http://localhost:3000
```

The screen splits in two. On the left is the list of chats, with **Nuova chat** selected. On the right is the conversation, with the input field at the bottom.

Type a question and press `Enter`:

```
Ciao! Mi consigli un libro da leggere questo weekend?
```

The answer appears a few words at a time. When it stops, the turn is complete and saved on the server. Ask a follow-up question that only makes sense with the previous one:

```
Qualcosa di più breve?
```

Ambrogio knows what "more" refers to, because the backend sends the whole conversation to the agent with every new turn.

## Come back to the conversation

Press `Ctrl+Q` to quit, then start the client again with the same command. Your chat is now in the list on the left, named after its first message.

Press `Tab` to move to the list, select the chat with the arrow keys and press `Enter`. The whole exchange is there, loaded from the backend. Press `Tab` again to return to the input field and carry on.

## What you have done

You have:

- built and started the Ambrogio backend with one orchestrator and one agent;
- talked to it from the terminal client;
- reopened a conversation that the backend stored in `~/ambrogio/data/conversations.sqlite`.

The backend keeps running in the background. Stop it with `docker stop ambrogio` and start it again with `docker start ambrogio`; your conversations survive both.

## Next steps

- [Talk to Ambrogio out loud](../talk-out-loud/) adds speech recognition, a voice and a satellite.
- [Add an agent](../../how-to/add-agent/) shows how to give Ambrogio more specialised helpers.
- [Architecture](../../explanation/architecture/) explains what happened behind the scenes.
