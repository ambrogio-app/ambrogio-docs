---
title: Add an agent
description: Give Ambrogio another specialised agent with its own instructions and model.
sidebar:
  label: Add an agent
---

An agent is one JSON file in the `agents` folder of the backend configuration. Adding a file adds an agent; removing it removes the agent. Changes take effect when the backend restarts.

This guide adds a cooking agent that uses a cheaper model than the general one.

## 1. Choose a name

The file name without `.json` is the agent's identifier. It must start with a lowercase letter and contain only lowercase letters, digits and hyphens: `cooking`, `home-assistant` and `kids2` work, `Cooking` and `my_agent` do not. `orchestrator` is reserved.

## 2. Write the file

```json title="agents/cooking.json"
{
  "description": "Recipes, cooking times, ingredient substitutions and weekly meal plans.",
  "instructions": "You help an Italian family in the kitchen. Answer in Italian. Give quantities in grams and times in minutes. Keep recipes short enough to read aloud.",
  "llm": {
    "provider": "mistral",
    "model": "mistral-small-latest",
    "apiKey": "..."
  }
}
```

- `description` is what the orchestrator reads when it decides who answers. Describe what the agent is for, not how it behaves. If two descriptions overlap, the orchestrator has to guess.
- `instructions` is the agent's system prompt. The family never sees it.
- `llm` can name a different model from the other agents.

To make answers more or less varied, or to cap their length, add `options`:

```json
"llm": {
  "provider": "mistral",
  "model": "mistral-small-latest",
  "apiKey": "...",
  "options": { "temperature": 0.3, "max_tokens": 400 }
}
```

## 3. Restart the backend

```bash
docker restart ambrogio
```

If the file has a mistake, the backend does not start, and its log has a `server_startup_failed` line with `Invalid agent configuration: cooking`. Every agent file must be valid for the backend to start.

## 4. Try it

Ask something that clearly belongs to the new agent, for example *"Come faccio il ragù senza carne?"*. Then ask a general question in the same conversation. The orchestrator chooses again for each turn, so the second answer should come from the general agent.

If the wrong agent keeps answering, make the descriptions more distinct, or say in the orchestrator's `instructions` how to choose.

## Remove an agent

Delete or rename the file so that it no longer ends in `.json`, then restart. At least one agent besides the orchestrator must remain.

## See also

- [Agent configuration](../../reference/agent-configuration/) for every field and rule.
- [Agents and the orchestrator](../../explanation/agents/) for how the choice is made.
- [Connect Home Assistant](../connect-home-assistant/) to give an agent tools.
