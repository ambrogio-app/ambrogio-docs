---
title: Connect another MCP server
description: Give an Ambrogio agent the tools of any MCP server reachable over HTTP, with or without authentication.
sidebar:
  label: Connect another MCP server
---

Any service that offers an [MCP](https://modelcontextprotocol.io/) server over **Streamable HTTP** can be connected to an Ambrogio agent. Each agent connects to one server.

## Check the server first

- It must speak Streamable HTTP and have an `http://` or `https://` URL. Servers that only run as a local command (stdio) or only offer the older HTTP+SSE transport do not work yet.
- It must be reachable from the backend. In Docker, `localhost` means the container itself, so use the host's LAN address or a Docker network name instead.

## Write the agent file

Create `agents/<name>.json`. The `mcp` section and `maxToolCalls` are what turn a plain agent into one with tools:

```json title="agents/calendar.json"
{
  "description": "Reads and adds events in the family calendar.",
  "instructions": "Answer in Italian. Use the calendar tools; never invent events.",
  "llm": { "provider": "mistral", "model": "mistral-medium-latest", "apiKey": "..." },
  "maxToolCalls": 4,
  "mcp": { "url": "http://192.168.1.30:8080/mcp" }
}
```

Without `auth`, Ambrogio sends no `Authorization` header.

## Add authentication

### Static token

If the server accepts a fixed token as a Bearer header:

```json
"mcp": {
  "url": "https://tools.example.lan/mcp",
  "auth": { "type": "bearer", "token": "..." }
}
```

### OAuth between services

If the server is protected by OAuth and you have registered a client for Ambrogio with its authorization server:

```json
"mcp": {
  "url": "https://tools.example.lan/mcp",
  "auth": {
    "type": "oauth_client_credentials",
    "clientId": "ambrogio",
    "clientSecret": "...",
    "issuer": "https://auth.example.lan",
    "scope": "calendar"
  }
}
```

`scope` is optional. Ambrogio discovers the authorization server from the MCP server's metadata, checks that it matches `issuer` before sending the secret, and renews the token by itself. OAuth flows that need someone to log in through a browser are not supported.

Credentials are used only for that agent's server. They are never sent to the language model and never written to the logs.

## Restart and check

Restart the backend. It connects to every MCP server at startup and refuses to start if one of them fails. If it does not start, the log contains `Agent MCP connection failed: <name>`: test the URL and credentials from the backend host.

[Agent configuration](/reference/agent-configuration/) lists every field.
