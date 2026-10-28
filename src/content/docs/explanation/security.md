---
title: Security and privacy
description: What Ambrogio protects, what it leaves to you, and what that means for where you run it.
sidebar:
  label: Security and privacy
---

Ambrogio is built for a trusted home network. Knowing where that trust is placed helps you decide how to install it.

## There is no login

Ambrogio has no user accounts and no passwords. Anyone who can reach the backend can read every conversation and talk to every agent, including the agents that control your home. The protection comes from your network:

- run the backend on your home network only, and do not forward its port on your router;
- for access from outside, use a VPN, or a [reverse proxy](../../how-to/reverse-proxy-https/) that only lets your own devices in;
- remember that every device on the network, guests' phones and smart TVs included, can reach it unless you separate them.

## Web pages cannot use it behind your back

A web page opened in a family member's browser cannot talk to Ambrogio, unless you list its address in `AMBROGIO_ALLOWED_ORIGINS`. List only the address of your web chat.

## Secrets

API keys and tokens live only in environment variables, in your private `.env`. Agent files only name the variable that holds each secret, so you can share them without exposing a key. Ambrogio never sends one agent's credentials to another agent or to an LLM, and never writes them in its logs.

Protecting `.env` and its backups is up to you: keep them readable only by you, and never commit them to a repository.

## What leaves your home

It depends on the LLMs and the services you choose. Each agent, the orchestrator included, can use a cloud LLM provider or an LLM that runs on your own network; see [Choose the LLM provider](../../how-to/choose-llm-provider/).

| Data | Goes to |
|---|---|
| The text of the conversation, with every message | The LLM of the orchestrator and of the agent that answers: outside your home with a cloud provider, nowhere with an LLM on your network |
| Tool calls and their results | The services the agent is connected to, and its LLM |
| Audio | Nowhere: speech is recognised and spoken on your server |

With every LLM and every connected service on your network, nothing leaves your home. A connected service outside your network, such as a public web search, receives the agent's requests.

## What is stored

The backend stores conversations as text, with no time limit, in its database. Keep the database on the backend's machine and never publish its port: the connection to it is not encrypted. Audio is never stored. Ambrogio has no way to delete a conversation yet.

The logs record that something happened, never what was said: no conversation text, no audio, no credentials.

## Agents that act on your home

An agent connected to Home Assistant can switch things on and off. Two settings limit what it can do:

- in Home Assistant, expose only the devices you are comfortable with an AI controlling, and leave out locks and alarms;
- in the agent file, `maxToolCalls` caps the actions per request.

The orchestrator cannot act: only the agent it chooses can. See [Agents and the orchestrator](../agents/).
