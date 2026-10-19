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
| `instructions` | string | yes | The agent's own instructions. At every turn Ambrogio adds the current date and time after them; see [Current date and time](#current-date-and-time). |
| `llm` | object | yes | See [`llm`](#llm). |
| `mcp` | object | no | Connection to an MCP server. See [`mcp`](#mcp). |
| `maxToolCalls` | positive integer | with `mcp` only | Most MCP tool calls the agent may make for one turn. Required when `mcp` is present; not allowed when it is absent. |

When the limit is reached, the next tool call is not made and the turn fails with the standard error message. The count restarts at every turn.

### Current date and time

At every turn handled by a specialised agent, Ambrogio adds this line right after the agent's `instructions`, before the server prompts:

```text
Current date and time: Monday, 19 October 2026 at 09:41 (Europe/Rome).
```

The time zone is `timeZone` in [`conversations.json`](../backend-configuration/#conversationsjson), `UTC` when it is not set. The orchestrator does not get the line. The line is not stored in the conversation.

## `llm`

| Field | Type | Required | Meaning |
|---|---|---|---|
| `provider` | string | yes | Who runs the model. See [Providers](#providers). |
| `model` | string | yes | Model identifier as the provider names it, for example `"mistral-medium-latest"`. |
| `apiKey` | string | yes | API key for the provider. Required with every provider, even when the server does not check it. |
| `baseURL` | string | with `openai-compatible` only | Absolute `http://` or `https://` address of the API, for example `"http://localhost:11434/v1"`. Required with `openai-compatible`; not allowed with the other providers. |
| `options` | object | no | Model options. See below. |

Each agent, the orchestrator included, has its own `llm`, so agents can use different providers.

### Providers

| `provider` | Service | Endpoint |
|---|---|---|
| `mistral` | Mistral | The provider's own |
| `openai` | OpenAI | The provider's own |
| `anthropic` | Anthropic | The provider's own |
| `google` | Google Gemini API (Google AI Studio) | The provider's own |
| `openai-compatible` | Any API compatible with OpenAI's, such as a local model server or a model aggregator | `baseURL` |

Ambrogio talks to each one through its official [Vercel AI SDK](https://ai-sdk.dev/) package. Providers that need credentials other than an API key, such as Amazon Bedrock, Google Vertex AI or Azure OpenAI, are not supported.

The model must support tool calling and structured output with a JSON schema; an agent with `mcp` needs both in the same request. Gemini models, for example, combine them only from the 3 series. With `openai-compatible`, the request carries the JSON schema of the answer as a `response_format` of type `json_schema`, so the server must accept it. If the provider refuses a request because the model lacks a feature, the turn fails with the standard error message.

`options` may contain only:

| Key | Type | Meaning |
|---|---|---|
| `temperature` | number ≥ 0 | Sampling temperature. |
| `max_tokens` | integer ≥ 1 | Maximum length of the generated output, in tokens. |

The two keys mean the same with every provider.

Requests to the model are not retried. For the orchestrator, `mistral-medium-latest` is the model the project recommends.

## `mcp`

| Field | Type | Required | Meaning |
|---|---|---|---|
| `url` | string | yes | Absolute `http://` or `https://` URL of the MCP endpoint. The transport is Streamable HTTP. |
| `auth` | object | no | Credentials. Without it, no `Authorization` header is sent. |
| `tools` | array of strings | no | Names of the server's tools the agent may use, as the server declares them. Without it, every tool is offered. The array must not be empty, and names must be non-empty strings without repeats. |

A `transport` field is not allowed. Local (stdio) servers and the older HTTP+SSE transport are not supported.

The backend connects to the server and lists its tools at startup. If the server declares prompts, it also lists the prompts that have no required arguments. If the connection or either list fails, the backend does not start. If a name in `tools` is not among the server's tools, the backend does not start either, with `Agent MCP tool unavailable: <id>`.

| Behaviour | Value |
|---|---|
| Tools shown to the model | All the server's tools, or with `tools` only the listed ones, in the server's order. A call to any other tool never reaches the server. |
| Tool names shown to the model | The server's tool name when it matches `^[A-Za-z_][A-Za-z0-9_-]{0,63}$`, a rule that every supported provider accepts; otherwise `mcp_<index>`, the tool's position in the list, from 0. Names of the form `mcp_<digits>` always get the positional name. |
| Server prompts | Read again at every turn handled by the agent, before the model is called. Their text is added after the agent's `instructions`, under the heading `Instructions and context from the connected MCP server:`. |
| Prompt read fails during a turn | The turn fails with the standard error message; the log cause is `MCP prompt retrieval failed`. |
| Prompt reads and `maxToolCalls` | Not counted. |
| Positional names with `tools` | Unchanged: the index is the position in the server's full list. |

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
  "instructions": "You are Ambrogio, the assistant of a family.",
  "llm": { "provider": "mistral", "model": "mistral-medium-latest", "apiKey": "..." }
}
```

Agent without tools:

```json
{
  "description": "Answers general questions and makes conversation.",
  "instructions": "Answer briefly and plainly.",
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
  "instructions": "Only report actions that a tool has confirmed.",
  "llm": { "provider": "mistral", "model": "mistral-medium-latest", "apiKey": "..." },
  "maxToolCalls": 5,
  "mcp": {
    "url": "http://homeassistant.local:8123/api/mcp",
    "auth": { "type": "bearer", "token": "..." }
  }
}
```
