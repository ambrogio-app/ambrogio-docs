---
title: Search past conversations
description: Let Ambrogio answer questions about what the family said in earlier conversations.
sidebar:
  label: Search past conversations
---

The Memory agent answers questions such as *"When did I say the dentist appointment was?"* by searching the family's past conversations. The backend itself serves the search, as an MCP server at `/mcp/memory`, so you only add the agent file.

## Prerequisites

- A backend from release `v0.17.0` on, with the PostgreSQL archive.
- The credential of the agent's model in the backend environment, `MISTRAL_API_KEY` in the example.

## 1. Add the agent file

Copy [`examples/agents/memory.json`](https://github.com/ambrogio-app/ambrogio-backend/blob/main/examples/agents/memory.json) into the agents folder of the backend:

```json title="memory.json"
{
  "description": "Searches the family's past conversations to answer questions about what was said before.",
  "instructions": "You answer questions about the family's past conversations by searching them. Before answering a question about something said, asked or decided before, call search_conversations with the most distinctive words of the question. When a search finds nothing, try again with synonyms or more general words. Answer only from the results: when nothing relevant is found, say so instead of guessing. When you use a result, mention the date of that conversation. Answer briefly.",
  "llm": {
    "provider": "mistral",
    "model": "mistral-medium-latest",
    "apiKeyEnv": "MISTRAL_API_KEY"
  },
  "maxToolCalls": 4,
  "mcp": {
    "url": "http://127.0.0.1:3000/mcp/memory",
    "tools": ["search_conversations"]
  }
}
```

`mcp.url` points to the backend itself. Change the port if `AMBROGIO_HTTP_PORT` is not `3000`. Keep `127.0.0.1`: the backend connects to its own MCP server from inside its container.

## 2. Restart the backend

Restart the backend. Once it is listening, the Memory agent connects to `/mcp/memory`. If the log has an `agent_mcp_unavailable` line for `memory`, check the port in `mcp.url`.

## 3. Ask

Ask about something said before: *"What did we decide for Saturday dinner?"*. The orchestrator chooses the Memory agent, which searches and answers with the date of the conversation it found.

## How the search works

- It searches the question and the answer of every answered turn, in all conversations. Turns that failed, were interrupted or are still in progress are not searched.
- It finds the words of the question in any form of the language of the installation, `AMBROGIO_LANGUAGE`: for example *dentista* also finds *dentisti*. It does not find a word written without its accent, or a synonym; the agent's instructions ask it to try synonyms when a search finds nothing.
- A turn can be found as soon as it ends.

## Keep the server private

The MCP server at `/mcp/memory` has no authentication, like the rest of the backend. It is outside `/api/`, so a reverse proxy that forwards only `/api/*` does not expose it. It refuses any request with an `Origin` header, so a web page cannot use it through a browser.
