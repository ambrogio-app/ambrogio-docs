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

Create `<name>.json` in the agents folder. The `mcp` section and `maxToolCalls` are what turn a plain agent into one with tools:

```json title="examples/agents/calendar.json"
{
  "description": "Reads and adds events in the family calendar.",
  "instructions": "Use the calendar tools; never invent events.",
  "llm": { "provider": "mistral", "model": "mistral-medium-latest", "apiKeyEnv": "MISTRAL_API_KEY" },
  "maxToolCalls": 4,
  "mcp": { "url": "http://calendar.example:8080/mcp" }
}
```

Mount this file at `/etc/ambrogio/agents/calendar.json`. Replace the URL with your server's address.

Without `auth`, Ambrogio sends no `Authorization` header. Secrets never go in the file: `auth` names the environment variable that holds each one. Add every named variable to the backend Compose service `environment` section, with its value taken from your private `.env`, for example `CALENDAR_MCP_TOKEN: ${CALENDAR_MCP_TOKEN:?Set CALENDAR_MCP_TOKEN}`.

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

`scope` is optional. Ambrogio discovers the authorization server from the MCP server's metadata, checks that it matches `issuer` before sending the secret, and renews the token by itself. OAuth flows that need someone to log in through a browser are not supported.

Credentials are used only for that agent's server. They are never sent to the language model and never written to the logs.

## Offer only the tools the agent needs

Some servers offer many tools, and the description of every tool is sent to the model at every step. Long lists make answers slower and give the model more ways to go wrong. List the tools the agent may use in `mcp.tools`, with the names the server gives them:

```json
"mcp": {
  "url": "http://weather.example:8080/mcp",
  "auth": { "type": "bearer", "tokenEnv": "WEATHER_MCP_TOKEN" },
  "tools": ["geocoding", "weather_forecast"]
}
```

Take the names from the server's documentation. If one is wrong, the agent stays unavailable and the log says which agent and which tool to check.

## Restart and check

Recreate the backend with `docker compose -f compose.example.yaml up -d`. Once it is listening, it connects once to every MCP server. If the backend does not start, `Missing environment variable <NAME> for agent <name>` means that a variable named in the file is not set in the backend container. If an agent does not answer, look for `agent_mcp_unavailable` in the log: with `reason` `connection_failed`, test the URL and credentials from the backend host; with `tool_unavailable`, the name in `tool` is not one of the server's tools, so check its spelling. Restart the backend after the fix.

[Agent configuration](../../reference/agent-configuration/) lists every field.
