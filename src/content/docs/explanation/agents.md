---
title: Agents and the orchestrator
description: What an agent is, the difference between an agent with and without tools, and how the orchestrator chooses who answers.
sidebar:
  label: Agents and the orchestrator
---

An **agent** is a JSON file in the `agents/` folder. It has:

- a **description**: what the agent is for;
- **instructions**: how it answers;
- an **LLM**: the model that writes its answers;
- optionally, **tools**: a connection to one service of your home through [MCP](https://modelcontextprotocol.io/).

The **orchestrator** is a special agent that never answers: for every message it chooses which agent answers. See [The orchestrator](#the-orchestrator).

## An agent without tools

It answers from what its LLM knows. Use it for conversation, explanations and advice.

```json title="agents/cooking.json"
{
  "description": "Recipes, cooking times and ingredient substitutions.",
  "instructions": "Give quantities in grams and times in minutes. Keep recipes brief.",
  "llm": { "provider": "mistral", "model": "mistral-small-latest", "apiKeyEnv": "MISTRAL_API_KEY" }
}
```

*"How long do I boil an egg?"* goes to `cooking`, which answers on its own.

## An agent with tools

It also has an `mcp` section: the address of a service, here Home Assistant, the variable that holds its token, and the `tools` of that service the agent may use. While answering, it calls those tools to read and change things in your home. `maxToolCalls` limits how many calls it can make for one request.

```json title="agents/home-assistant.json"
{
  "description": "Reads the state of the home's lights, switches and sensors through Home Assistant and turns devices on or off.",
  "instructions": "Answer briefly. Change a device only when the family asks for a change.",
  "llm": { "provider": "mistral", "model": "mistral-medium-latest", "apiKeyEnv": "MISTRAL_API_KEY" },
  "maxToolCalls": 5,
  "mcp": {
    "url": "http://homeassistant.local:8123/api/mcp",
    "auth": { "type": "bearer", "tokenEnv": "HOME_ASSISTANT_LONG_LIVED_ACCESS_TOKEN" },
    "tools": ["homeassistant__GetLiveContext", "intent__HassTurnOn"]
  }
}
```

*"Turn on the kitchen light"* goes to `home-assistant`, which reads the devices with `homeassistant__GetLiveContext`, switches the light on with `intent__HassTurnOn`, and only then answers *"I turned on the kitchen light."*

Without `tools`, the agent may use every tool the service offers. Listing only the ones it needs makes answers faster and limits what it can do. Tool names are the ones the service declares, and can change with its version: these are those of Home Assistant 2026.10.

## The difference

| | Without tools | With tools |
|---|---|---|
| Knows | What its LLM learned | Also the live state of a service |
| Can act | No | Yes, through the service's tools |
| Extra fields | none | `mcp`, with its optional `tools`, and `maxToolCalls` |
| LLM | Any | One that supports tool calling |

## The orchestrator

The orchestrator is the file `agents/orchestrator.json`, and every installation needs one. It has only instructions and an LLM: no description, because nobody chooses it, and no tools, because it never acts.

```json title="agents/orchestrator.json"
{
  "instructions": "Choose the agent that should answer the family's latest message. Route general questions, conversation and unclear requests to generic. If the message answers a question from an agent, choose the same agent. Return only the selected agent identifier.",
  "llm": { "provider": "mistral", "model": "mistral-medium-latest", "apiKeyEnv": "MISTRAL_API_KEY" }
}
```

For every message, Ambrogio gives the orchestrator the latest messages of the conversation and the name and description of every agent. The orchestrator replies with one name, and that agent answers. With `generic`, `cooking` and `home-assistant` installed:

| Message | Chosen agent |
|---|---|
| *"How long do I boil an egg?"* | `cooking` |
| *"Turn on the kitchen light"* | `home-assistant` |
| *"Tell me a joke"* | `generic` |

The choice is made again at every message, so one conversation can move from one agent to another. Use the orchestrator's instructions to say how to choose in borderline cases. Its LLM must support structured output.

## Writing good agents

- Write descriptions that do not overlap, or the orchestrator has to guess.
- Put tone and rules in each agent's instructions.
- To give Ambrogio a new skill, add an agent.

[Agent configuration](../../reference/agent-configuration/) lists every field. [Add an agent](../../how-to/add-agent/) and [Connect Home Assistant](../../how-to/connect-home-assistant/) show how.
