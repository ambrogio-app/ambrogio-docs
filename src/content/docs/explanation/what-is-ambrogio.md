---
title: What is Ambrogio
description: A family assistant for your homelab, the four programs it is made of, and what each one does.
sidebar:
  label: What is Ambrogio
---

Ambrogio is a home assistant you run yourself. Your family types to it in a browser or a terminal, or talks to it out loud, and it answers through AI agents that you choose and configure, each with an LLM from a cloud provider or one that runs in your home. Conversations are stored on your server, not on someone else's.

The goal is a complete assistant for the family: one that switches the lights and the other devices of the house, plays a song, tells you the weather, finds what is in your documents, and remembers what you told it. Ambrogio does not do these things by itself. Each agent can be connected to a service that already runs in your home, such as Home Assistant or a file cloud, through the [Model Context Protocol](https://modelcontextprotocol.io/), and the orchestrator chooses the right agent for each request.

That is why Ambrogio is designed as the AI part of a homelab: it sits beside the services you already self-host and lets the family use them by talking. The [`ambrogio-homelab-example`](https://github.com/ambrogio-app/ambrogio-homelab-example) repository shows a complete installation of this kind, with Home Assistant, a weather service, a file cloud, web search and a voice satellite.

:::caution[Early development]
Ambrogio is young software. The configuration can still change between releases, and voice has not yet been tested on every kind of audio hardware. [Versions and compatibility](../../reference/versions/) lists what changes in each release.
:::

## Four programs

Ambrogio is split into four programs, each in its own Git repository. You always need the backend; the clients are optional, and you can run as many of them as you like.

**The backend** (`ambrogio-backend`) runs on a machine that is always on, such as a home server or a NAS with Docker. It keeps every conversation in a PostgreSQL database that runs beside it. It sends each request to an *orchestrator*, which picks the agent that should answer, and to that *agent*, which writes the answer; each agent has its own instructions and its own model. It recognises speech while you speak and speaks the answers, with models that run inside the backend and no cloud speech service. Clients reach it through two HTTP endpoints, to read conversations, and a WebSocket session, to talk.

**The web chat** (`ambrogio-web`) is a chat page for the browsers of your home, served by an optional container next to the backend. It shows the answers as Markdown, in Italian or English.

**The terminal client** (`ambrogio-cli`) is the same chat in a terminal window, for any computer that can reach the backend.

**The voice satellite** (`ambrogio-satellite`) is a program for a small device with a microphone and a speaker, such as a Raspberry Pi, one per room. It waits for its wake word, "Alexa" unless you choose another, sends what you say to the backend and plays the answer. It does not recognise speech or generate voices itself.

## One family, one archive

Everyone in the home shares one identity, and every conversation can be opened from any client: a question asked out loud in the kitchen can be continued by typing in the browser. Ambrogio has no user accounts and no login, so it belongs on your home network; [Security and privacy](../security/) explains what that means and what leaves your home.

## Further reading

- [Before you install](../../reference/requirements/) lists what each program needs.
- [Install Ambrogio](../../tutorials/install-ambrogio/) sets up the backend and the web chat.
- [Architecture](../architecture/) explains how the programs fit together, and why.
