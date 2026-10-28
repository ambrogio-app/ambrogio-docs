---
title: Add an agent
description: Give Ambrogio another specialised agent with its own instructions and model.
sidebar:
  label: Add an agent
---

An agent is a JSON file with a description, instructions, a model and optionally tools; [What an agent is](../../explanation/agents/) explains each part. This guide adds a cooking agent that uses a cheaper model than the general one, to the installation from [Install Ambrogio](../../tutorials/install-ambrogio/). Run the commands from `~/ambrogio`.

## 1. Write the agent file

Create `agents/cooking.json`. The file name without `.json` is the agent's identifier; [Agent configuration](../../reference/agent-configuration/#files) lists the names you can use.

```json title="~/ambrogio/agents/cooking.json"
{
  "description": "Recipes, cooking times and ingredient substitutions.",
  "instructions": "Give quantities in grams and times in minutes. Keep recipes brief.",
  "llm": {
    "provider": "mistral",
    "model": "mistral-small-latest",
    "apiKeyEnv": "MISTRAL_API_KEY",
    "options": { "temperature": 0.3, "max_tokens": 400 }
  }
}
```

- Write in `description` what the agent is for, and make it distinct from the other agents' descriptions: the orchestrator chooses from those alone.
- Write in `instructions` how the agent should answer.
- To use another provider, see [Choose the LLM provider](../choose-llm-provider/).

## 2. Restart the backend

```bash
docker compose restart backend
```

If the backend does not start, `docker compose logs backend` names the agent and the problem; see [Troubleshooting](../troubleshoot/#the-backend-does-not-start).

## 3. Try it

Ask something that clearly belongs to the new agent, for example *"How do I make a meatless lasagne?"*. Then ask a general question in the same conversation: the second answer should come from the general agent.

If the wrong agent keeps answering, make the descriptions more distinct, or say in the `instructions` of `agents/orchestrator.json` how to choose, then restart the backend.

## Remove an agent

Delete its file from `agents/` and restart the backend. At least one agent besides the orchestrator must remain.

## See also

- [Agent configuration](../../reference/agent-configuration/) for every field.
- [Agents and the orchestrator](../../explanation/agents/) for how the choice is made and what makes a good description.
