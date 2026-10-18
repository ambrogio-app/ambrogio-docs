---
title: Security and privacy
description: What Ambrogio protects by design, what it does not, and what that means for where you run it.
sidebar:
  label: Security and privacy
---

Ambrogio is built for a trusted home network. Knowing exactly where that trust is placed helps you decide how to install it.

## There is no login

The backend has no user accounts and no authentication. Anyone who can reach its port can read every conversation and talk to every agent, including agents that control your home through Home Assistant.

This is a deliberate choice for the first versions: the family shares one identity, and the protection comes from the network rather than from passwords. In practice:

- run the backend on your home network only;
- do not forward its port on your router;
- if you need access from outside, use a VPN, or a reverse proxy that only lets your own devices in ([Put the backend behind HTTPS](../../how-to/reverse-proxy-https/) shows an IP allow-list);
- remember that every device on the network, including guests' phones and smart TVs, can reach it unless you separate them.

## What the backend does protect

- **Browsers.** Web pages cannot call the API or open a session from another site unless you list that site in `allowedOrigins`. This stops a malicious web page from talking to Ambrogio through a family member's browser. It does nothing against programs that are not browsers. List only the address of the [web chat](../../reference/web-chat/) and of browser applications you trust.
- **HTTP headers.** Responses carry standard security headers, and HSTS when you declare the public address HTTPS-only.
- **Caching.** Responses that contain conversations are marked not to be cached by browsers or proxies.

## Secrets

API keys and MCP tokens live in plain JSON files in the configuration folder, one agent per file. The backend:

- never sends one agent's credentials to another agent or to the language model;
- never writes them to the logs or to error messages.

Protecting the files themselves is up to you: restrict their permissions, mount them read-only into the container, and keep backups private. Never commit them to a repository.

## What leaves your home

| Data | Goes to |
|---|---|
| The text of each conversation, sent with every turn | Mistral, to produce the answer |
| Tool calls and their results | The MCP servers you configured, and the model |
| Audio | Nowhere outside your network |

If you configure an MCP server outside your network, the agent's requests to it leave your home too.

## What is stored

The backend stores conversations as text, indefinitely, in one SQLite file. It does not store audio. There is no built-in way to delete a conversation yet; the archive is yours to manage.

Logs record that something happened, never what was said: no conversation text, no audio, no credentials. See [Logs](../../reference/logs/).

## Tools that act on your home

An agent connected to Home Assistant can switch things on and off. Two settings limit what it can do:

- in Home Assistant, expose only the entities you are comfortable with an AI controlling;
- in Ambrogio, `maxToolCalls` caps the number of actions per request.

The orchestrator itself cannot act or claim to have acted; only the chosen agent can call tools. See [Agents and the orchestrator](../agents/#why-the-orchestrator-never-answers).
