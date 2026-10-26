---
title: Agent configuration
description: JSON files and fields that define the orchestrator and the specialised agents.
sidebar:
  label: Agent configuration
---

Agents are defined by JSON files in the agents folder, `/etc/ambrogio/agents/` unless `AMBROGIO_AGENTS_DIR` says otherwise (see [Backend configuration](../backend-configuration/#agents)). The files hold data only. They never contain secrets: an API key, token or client secret is named by the environment variable that holds it, and the backend reads that variable at startup. The folder is read once at startup and every file is validated before the backend starts.

## Files

| File | Meaning |
|---|---|
| `orchestrator.json` | The orchestrator. Required. |
| `<id>.json` | A specialised agent with identifier `<id>`. At least one is required. |
| anything not ending in `.json` | Ignored. |

`<id>` must match `^[a-z][a-z0-9-]*$`: a lowercase letter, then lowercase letters, digits or hyphens.

Every file must be valid JSON with only the fields listed on this page; any other field, such as a literal `apiKey` or `token`, makes the file invalid. An invalid file stops the backend with `Invalid agent configuration: <id>`. There is no field to disable an agent: remove or rename its file.

## Credentials from environment variables

Fields ending in `Env` name an environment variable. The name must match `^[A-Z][A-Z0-9_]*$`. If the variable is unset or empty at startup, the backend does not start, with `Missing environment variable <NAME> for agent <id>`. Several agents may name the same variable.

| Field | Holds |
|---|---|
| `llm.apiKeyEnv` | The provider API key. |
| `mcp.auth.tokenEnv` | The static Bearer token of the MCP server. |
| `mcp.auth.clientSecretEnv` | The OAuth client secret. |

## `orchestrator.json`

| Field | Type | Required | Meaning |
|---|---|---|---|
| `instructions` | string | yes | Instructions for choosing an agent. Ambrogio appends the list of agents (identifier and `description`) and a request to pick one. |
| `llm` | object | yes | See [`llm`](#llm). |

`description`, `mcp` and `maxToolCalls` are not allowed in this file.

The orchestrator never writes the answer. Its only output is the identifier of the agent that will answer.

## Specialised agent `<id>.json`

| Field | Type | Required | Meaning |
|---|---|---|---|
| `description` | string | yes | What the agent is for. The orchestrator reads it to choose. Its instructions and credentials are never shown to the orchestrator. |
| `instructions` | string | yes | The agent's own instructions. At every turn Ambrogio adds the current date and time and the selected response language; see [Current date and time](#current-date-and-time). |
| `llm` | object | yes | See [`llm`](#llm). |
| `mcp` | object | no | Connection to an MCP server. See [`mcp`](#mcp). |
| `maxToolCalls` | positive integer | with `mcp` only | Most MCP tool calls the agent may make for one turn. Required when `mcp` is present; not allowed when it is absent. |

When the limit is reached, the next tool call is not made and the turn fails with the standard error message. The count restarts at every turn.

### Current date and time

At every turn handled by a specialised agent, Ambrogio adds this line right after the agent's `instructions`, before the server prompts:

```text
Current date and time: Monday, 19 October 2026 at 09:41 (Europe/Rome).
```

The time zone is `AMBROGIO_TIME_ZONE` (see [Backend configuration](../backend-configuration/#conversations)), `UTC` when it is not set. The orchestrator does not get the line. The line is not stored in the conversation.

The backend also tells each specialised agent to answer in the language selected by `AMBROGIO_LANGUAGE`, Italian or English. This applies to agents with and without MCP. The orchestrator does not receive that instruction because it returns only an agent identifier. Agent files can be written in English without repeating the response language.

## `llm`

| Field | Type | Required | Meaning |
|---|---|---|---|
| `provider` | string | yes | Who runs the model. See [Providers](#providers). |
| `model` | string | yes | Model identifier as the provider names it, for example `"mistral-medium-latest"`. |
| `apiKeyEnv` | string | yes | Name of the environment variable that holds the API key, for example `"MISTRAL_API_KEY"`. Required with every provider, even when the server does not check the key. |
| `baseURL` | string | with `openai-compatible` only | Absolute `http://` or `https://` address of the API, for example `"http://localhost:11434/v1"`. Required with `openai-compatible`; not allowed with the other providers. |
| `options` | object | no | Model options. See below. |

No other field is allowed in `llm`.

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

The orchestrator's model must support structured output with a JSON schema: it chooses the agent, and it decides whether an answer with a question expects a reply. The model of every agent with an `mcp` section must support tool calling; an agent without `mcp` is offered no tools. With `openai-compatible`, the orchestrator's requests carry their JSON schema as a `response_format` of type `json_schema`, so the server must accept it. If the provider refuses a request because the model lacks a feature, the turn fails with the standard error message.

`options` may contain only:

| Key | Type | Meaning |
|---|---|---|
| `temperature` | number ≥ 0 | Sampling temperature. |
| `max_tokens` | integer ≥ 1 | Maximum length of the generated output, in tokens. |

The two keys mean the same with every provider.

Requests to the model are not retried. For the orchestrator, `mistral-medium-latest` is the model the project recommends. It is an alias that Mistral AI points to the latest Mistral Medium version, so the model behind it changes when Mistral AI moves the alias.

## `mcp`

| Field | Type | Required | Meaning |
|---|---|---|---|
| `url` | string | yes | Absolute `http://` or `https://` URL of the MCP endpoint. The transport is Streamable HTTP. |
| `auth` | object | no | Credentials. Without it, no `Authorization` header is sent. |
| `tools` | array of strings | no | Names of the server's tools the agent may use, as the server declares them. Without it, every tool is offered. The array must not be empty, and names must be non-empty strings without repeats. |

No other field is allowed in `mcp`, `transport` included. Local (stdio) servers and the older HTTP+SSE transport are not supported.

The backend connects to the server and lists its tools at startup. If the server declares prompts, it also lists the prompts that have no required arguments. If the connection or either list fails, the backend does not start. If a name in `tools` is not among the server's tools, the backend does not start either, with `Agent MCP tool unavailable: <id>`.

| Behaviour | Value |
|---|---|
| Tools shown to the model | All the server's tools, or with `tools` only the listed ones, in the server's order. A call to any other tool never reaches the server. |
| Tool names shown to the model | The server's tool name when it matches `^[A-Za-z_][A-Za-z0-9_-]{0,63}$`, a rule that every supported provider accepts; otherwise `mcp_<index>`, the tool's position in the list, from 0. Names of the form `mcp_<digits>` always get the positional name. |
| Server prompts | Read again at every turn handled by the agent, before the model is called. Their text is added after the agent's `instructions`, under the heading `Instructions and context from the connected MCP server:`. |
| Prompt read fails during a turn | The turn fails with the standard error message; the log cause is `MCP prompt retrieval failed`. |
| Prompt reads and `maxToolCalls` | Not counted. |
| Rules added to `instructions` | Every request to do something with the tools needs its own tool call in that answer, also when it repeats an earlier request, because earlier answers do not show what was done. A message that asks for nothing, such as thanks, needs no tool. The agent writes nothing before or between tool calls and answers only after its last tool call, when it knows how it went: after an action it says in one short sentence what it did and on what, never only "Fatto" or "Ok"; when an action fails it says what did not work. Text written before a tool call anyway is sent at once. If the answer has no words when the model stops calling tools, the agent is asked once more to write it, without tools; if it is still empty, the turn fails with the standard message. |
| History seen by the agent | The latest [`AMBROGIO_HISTORY_TURNS`](../backend-configuration/#conversations) turns. For the turns this agent answered, also its tool calls with their arguments and results, before its answer. Answers of other agents appear as text only; answers without words are left out. Tool calls are never sent to clients or shown by the HTTP API. |
| Positional names with `tools` | Unchanged: the index is the position in the server's full list. |

### `auth` with a static token

| Field | Type | Meaning |
|---|---|---|
| `type` | `"bearer"` | |
| `tokenEnv` | string | Name of the environment variable that holds the token. The token is sent as `Authorization: Bearer <token>` to this agent's `url` only. |

### `auth` with OAuth client credentials

| Field | Type | Required | Meaning |
|---|---|---|---|
| `type` | `"oauth_client_credentials"` | yes | |
| `clientId` | string | yes | Client registered with the authorization server. |
| `clientSecretEnv` | string | yes | Name of the environment variable that holds the client secret. |
| `issuer` | string | yes | Absolute `http://` or `https://` URL of the authorization server. Ambrogio checks that the server advertised by the MCP endpoint matches it before sending the secret. |
| `scope` | string | no | Scope to request. |

Tokens are obtained with the OAuth `client_credentials` flow and renewed automatically while the backend runs.

## Examples

The backend repository provides these files in `examples/agents/`.

Orchestrator, `orchestrator.json`:

```json
{
  "instructions": "Choose the agent that should answer the family's latest message. Route general questions, conversation and unclear requests to generic. If the message answers a question from an agent, choose the same agent. Return only the selected agent identifier.",
  "llm": {
    "provider": "mistral",
    "model": "mistral-medium-latest",
    "apiKeyEnv": "MISTRAL_API_KEY"
  }
}
```

Agent without tools, `generic.json`:

```json
{
  "description": "Answers general questions and makes conversation.",
  "instructions": "You are Ambrogio, the family assistant. Answer briefly and plainly. Requests may come from speech recognition and contain misheard words; interpret them in context. If you cannot understand a request, ask the family to repeat it.",
  "llm": {
    "provider": "mistral",
    "model": "mistral-medium-latest",
    "apiKeyEnv": "MISTRAL_API_KEY"
  }
}
```

Agent with an MCP server, `home-assistant.json`:

```json
{
  "description": "Reads the state of the home's lights, switches and sensors through Home Assistant and turns devices on or off.",
  "instructions": "You control the family's home through Home Assistant. Answer briefly. Choose freely among the available tools and use the ones the request needs. To answer a question about the state of a device or a sensor, read its current state and do not turn on, turn off or change anything. Change a device only when the user asks for a change. When the user refers to several devices, for example all the lights or the lights of a room, act on all of them, using the area or the device type when a tool allows it. Say that an action happened only after a tool has confirmed it; if a tool fails or a device is not available, say so.",
  "llm": {
    "provider": "mistral",
    "model": "mistral-medium-latest",
    "apiKeyEnv": "MISTRAL_API_KEY"
  },
  "maxToolCalls": 5,
  "mcp": {
    "url": "http://homeassistant.local:8123/api/mcp",
    "auth": {
      "type": "bearer",
      "tokenEnv": "HOME_ASSISTANT_LONG_LIVED_ACCESS_TOKEN"
    }
  }
}
```

Every file above names `MISTRAL_API_KEY`, and the Home Assistant file also names `HOME_ASSISTANT_LONG_LIVED_ACCESS_TOKEN`; set those variables in the backend environment. Replace the `mcp.url` placeholder with the address of your server.
