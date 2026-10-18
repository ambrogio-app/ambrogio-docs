---
title: Agent configuration
description: Files and fields that define the orchestrator and the specialised agents.
sidebar:
  label: Agent configuration
---

Agents are defined by JSON files in `/etc/ambrogio/agents/`. The folder is read once at startup.

## Files

| File | Meaning |
|---|---|
| `orchestrator.json` | The orchestrator. Required. |
| `<id>.json` | A specialised agent with identifier `<id>`. At least one is required. |
| anything not ending in `.json` | Ignored. |

`<id>` must match `^[a-z][a-z0-9-]*$`: a lowercase letter, then lowercase letters, digits or hyphens.

Every file must be valid for the backend to start. There is no field to disable an agent: remove or rename its file.

## `orchestrator.json`

| Field | Type | Required | Meaning |
|---|---|---|---|
| `instructions` | string | yes | Instructions for choosing an agent. Ambrogio appends the list of agents (identifier and `description`) and a request to pick one. |
| `llm` | object | yes | See [`llm`](#llm). |

`description` and `mcp` are not allowed in this file.

The orchestrator never writes the answer. Its only output is the identifier of the agent that will answer.

## Specialised agent `<id>.json`

| Field | Type | Required | Meaning |
|---|---|---|---|
| `description` | string | yes | What the agent is for. The orchestrator reads it to choose. Its instructions and credentials are never shown to the orchestrator. |
| `instructions` | string | yes | The agent's own instructions. |
| `llm` | object | yes | See [`llm`](#llm). |
| `mcp` | object | no | Connection to an MCP server. See [`mcp`](#mcp). |
| `maxToolCalls` | positive integer | with `mcp` only | Most MCP tool calls the agent may make for one turn. Required when `mcp` is present; not allowed when it is absent. |

When the limit is reached, the next tool call is not made and the turn fails with the standard error message. The count restarts at every turn.

## `llm`

| Field | Type | Required | Meaning |
|---|---|---|---|
| `provider` | string | yes | Must be `"mistral"`. |
| `model` | string | yes | Mistral model identifier, for example `"mistral-medium-latest"`. |
| `apiKey` | string | yes | Mistral API key. |
| `options` | object | no | Model options. See below. |

`options` may contain only:

| Key | Type | Meaning |
|---|---|---|
| `temperature` | number ≥ 0 | Sampling temperature. |
| `max_tokens` | integer ≥ 1 | Maximum length of the generated output, in tokens. |

Requests to the model are not retried. For the orchestrator, `mistral-medium-latest` is the model the project recommends.

## `mcp`

| Field | Type | Required | Meaning |
|---|---|---|---|
| `url` | string | yes | Absolute `http://` or `https://` URL of the MCP endpoint. The transport is Streamable HTTP. |
| `auth` | object | no | Credentials. Without it, no `Authorization` header is sent. |

A `transport` field is not allowed. Local (stdio) servers and the older HTTP+SSE transport are not supported.

The backend connects to the server and lists its tools at startup. If the connection fails, the backend does not start.

### `auth` with a static token

| Field | Type | Meaning |
|---|---|---|
| `type` | `"bearer"` | |
| `token` | string | Sent as `Authorization: Bearer <token>` to this agent's `url` only. |

### `auth` with OAuth client credentials

| Field | Type | Required | Meaning |
|---|---|---|---|
| `type` | `"oauth_client_credentials"` | yes | |
| `clientId` | string | yes | Client registered with the authorization server. |
| `clientSecret` | string | yes | Its secret. |
| `issuer` | string | yes | Absolute `http://` or `https://` URL of the authorization server. Ambrogio checks that the server advertised by the MCP endpoint matches it before sending the secret. |
| `scope` | string | no | Scope to request. |

Tokens are obtained with the OAuth `client_credentials` flow and renewed automatically while the backend runs.

## Examples

Orchestrator:

```json
{
  "instructions": "You are Ambrogio, the assistant of an Italian family.",
  "llm": { "provider": "mistral", "model": "mistral-medium-latest", "apiKey": "..." }
}
```

Agent without tools:

```json
{
  "description": "Answers general questions and makes conversation.",
  "instructions": "Always answer in Italian, briefly and plainly.",
  "llm": {
    "provider": "mistral",
    "model": "mistral-small-latest",
    "apiKey": "...",
    "options": { "temperature": 0.4 }
  }
}
```

Agent with an MCP server:

```json
{
  "description": "Reads the state of the home's devices and turns them on or off.",
  "instructions": "Answer in Italian. Only report actions that a tool has confirmed.",
  "llm": { "provider": "mistral", "model": "mistral-medium-latest", "apiKey": "..." },
  "maxToolCalls": 5,
  "mcp": {
    "url": "http://homeassistant.local:8123/api/mcp",
    "auth": { "type": "bearer", "token": "..." }
  }
}
```
