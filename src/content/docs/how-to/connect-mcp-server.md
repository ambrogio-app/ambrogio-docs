---
title: Connect another MCP server
description: Give an Ambrogio agent the tools of any MCP server reachable over HTTP, with or without authentication.
sidebar:
  label: Connect another MCP server
---

Any service that offers an [MCP](https://modelcontextprotocol.io/) server over **Streamable HTTP** can be connected to an Ambrogio agent. Each agent connects to one server; [Agents with tools](../../explanation/agents/) explains what the agent can then do.

## Before you start

- The server speaks Streamable HTTP at an `http://` or `https://` URL. Servers that only run as a local command (stdio) or only offer the older HTTP+SSE transport do not work.
- The server is reachable from the backend container. There, `localhost` is the container itself: use the host's LAN address or a Docker network name.
- The installation from [Self-host Ambrogio](../../tutorials/install-ambrogio/). Run the commands from `~/ambrogio`.

## Write the agent file

Create `agents/<name>.json`. The `mcp` section and `maxToolCalls` give the agent tools:

```json title="~/ambrogio/agents/calendar.json"
{
  "description": "Reads and adds events in the family calendar.",
  "instructions": "Use the calendar tools; never invent events.",
  "llm": { "provider": "mistral", "model": "mistral-medium-latest", "apiKeyEnv": "MISTRAL_API_KEY" },
  "maxToolCalls": 4,
  "mcp": { "url": "http://calendar.example:8080/mcp" }
}
```

Replace the URL with your server's address. Without `auth`, Ambrogio sends no `Authorization` header.

## Add authentication

### Static token

If the server accepts a fixed token as a Bearer header:

```json
"mcp": {
  "url": "http://calendar.example:8080/mcp",
  "auth": { "type": "bearer", "tokenEnv": "CALENDAR_MCP_TOKEN" }
}
```

### OAuth between services

If the server is protected by OAuth and you have registered a client for Ambrogio with its authorization server:

```json
"mcp": {
  "url": "http://calendar.example:8080/mcp",
  "auth": {
    "type": "oauth_client_credentials",
    "clientId": "ambrogio",
    "clientSecretEnv": "CALENDAR_CLIENT_SECRET",
    "issuer": "https://auth.example",
    "scope": "calendar"
  }
}
```

`scope` is optional. OAuth flows that need someone to log in through a browser are not supported; [Agent configuration](../../reference/agent-configuration/#auth-with-oauth-client-credentials) describes the flow.

### Pass the secret to the backend

The file only names the variable that holds each secret. Add every named variable to the `environment` section of the `backend` service in `compose.yaml`:

```yaml
CALENDAR_MCP_TOKEN: ${CALENDAR_MCP_TOKEN:?Set CALENDAR_MCP_TOKEN}
```

and its value to `.env`.

## Offer only the tools the agent needs

A server with many tools makes every answer slower; see [Agents with tools](../../explanation/agents/). List the tools the agent may use in `mcp.tools`, with the names the server gives them:

```json
"mcp": {
  "url": "http://weather.example:8080/mcp",
  "auth": { "type": "bearer", "tokenEnv": "WEATHER_MCP_TOKEN" },
  "tools": ["geocoding", "weather_forecast"]
}
```

Take the names from the server's documentation.

## Restart and check

1. Recreate the backend:

   ```bash
   docker compose up -d
   ```

2. Ask the agent something that needs its tools.

If the backend does not start, or the agent does not answer, see [Troubleshooting](../troubleshoot/#an-agent-with-an-mcp-server-does-not-work).

[Agent configuration](../../reference/agent-configuration/#mcp) lists every field.
