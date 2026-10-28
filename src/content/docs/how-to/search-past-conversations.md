---
title: Search past conversations
description: Let Ambrogio remember what the family says and answer questions about earlier conversations.
sidebar:
  label: Search past conversations
---

The Memory agent answers questions such as *"When did I say the dentist appointment was?"* by searching the family's past conversations. The backend itself serves the search, as an MCP server at `/mcp/memory`, so you only add the [agent](../../explanation/agents/) file. 

## Before you start

- The installation from [Install Ambrogio](../../tutorials/install-ambrogio/), with backend `v0.17.0` or later. Run the commands from `~/ambrogio`.

## 1. Add the agent file

Download the example agent of your backend release, for example `v0.17.0`:

```bash
curl -fsSLo agents/memory.json https://raw.githubusercontent.com/ambrogio-app/ambrogio-backend/v0.17.0/examples/agents/memory.json
```

It contains:

```json title="~/ambrogio/agents/memory.json"
{
  "description": "Handles requests to remember something the family says, and answers questions about the family's own plans, appointments, deadlines and things said before.",
  "instructions": "When the family asks you to remember something, confirm briefly without searching: everything said is kept and can be searched later. You answer questions about the family's past conversations by searching them. Before answering a question about something said, asked or decided before, call search_conversations with the most distinctive words of the question. When a search finds nothing, try again with synonyms or more general words. Answer only from the results: when nothing relevant is found, say so instead of guessing. When you use a result, mention the date of that conversation. Answer briefly.",
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

```bash
docker compose restart backend
```

If `docker compose logs backend` has an `agent_mcp_unavailable` line for `memory`, check the port in `mcp.url`.

## 3. Help the orchestrator choose it

The orchestrator chooses the agent from the descriptions. A question such as *"When do I have to get the car serviced?"* can also look like a general question for a web search agent. If you have one, add a sentence to the instructions of `orchestrator.json`, for example: *"Requests to remember something, and questions about the family's own plans, appointments, deadlines or things they told before, go to memory, even when they could also be general questions."*

## 4. Ask

Tell it something to remember: *"Remember that the car service is due by February."* The Memory agent confirms. Then, in another conversation, ask about it: *"When do I have to get the car serviced?"*. The Memory agent answers with the date of the conversation it found.

The agent searches the question and the answer of every answered exchange, in all conversations. It finds the words in any form of the language set by `AMBROGIO_LANGUAGE`, such as *dentista* and *dentisti*, but not synonyms or words written without their accent: its instructions ask it to try other words when a search finds nothing.

## Keep the server private

`/mcp/memory` has no authentication, like the rest of the backend, and refuses requests from web pages. If you [put the backend behind a reverse proxy](../reverse-proxy-https/), forward only `/api/*`, so that the proxy does not expose it.
