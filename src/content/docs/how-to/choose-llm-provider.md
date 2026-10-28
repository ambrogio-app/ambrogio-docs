---
title: Choose the LLM provider
description: Set the LLM of each agent, from a cloud provider such as Mistral, OpenAI, Anthropic or Google, or from a server in your home.
sidebar:
  label: Choose the LLM provider
---

Each agent, the orchestrator included, has its own LLM, from a cloud provider or from an OpenAI-compatible server on your network; see [Agents and the orchestrator](../../explanation/agents/). The example agents use Mistral. This guide sets another provider. It works on the installation from [Self-host Ambrogio](../../tutorials/install-ambrogio/); run the commands from `~/ambrogio`.

## Before you start

- Choose the provider among the [supported providers](../../reference/agent-configuration/#providers), and a model for the orchestrator and one for each agent. The orchestrator's model must support structured output, and the model of an agent with an `mcp` section must support tool calling.
- Have the provider's API key, or the address of your OpenAI-compatible server.

## 1. Change the agent files

In `agents/orchestrator.json`, `agents/generic.json` and every other agent you want to move, replace the `llm` section. For example, for OpenAI:

```json
"llm": {
  "provider": "openai",
  "model": "<model>",
  "apiKeyEnv": "OPENAI_API_KEY"
}
```

`apiKeyEnv` is the name of the environment variable that will hold the key; choose it freely, with uppercase letters, digits and underscores. Agents of the same provider can share it.

For an OpenAI-compatible server on your network, add its address in `baseURL`:

```json
"llm": {
  "provider": "openai-compatible",
  "model": "<model>",
  "baseURL": "http://192.168.1.30:11434/v1",
  "apiKeyEnv": "LOCAL_LLM_API_KEY"
}
```

`apiKeyEnv` is required even if your server does not check the key: give the variable any value.

Each agent can use a different provider. [Agent configuration](../../reference/agent-configuration/#llm) lists every field of `llm`.

## 2. Pass the key to the backend

1. In the `environment` section of the `backend` service in `compose.yaml`, add the variable named by `apiKeyEnv`:

   ```yaml
   OPENAI_API_KEY: ${OPENAI_API_KEY:?Set OPENAI_API_KEY}
   ```

2. Add its value to `.env`:

   ```dotenv
   OPENAI_API_KEY=<your-api-key>
   ```

3. If no agent uses Mistral any more, remove `MISTRAL_API_KEY` from both files.

## 3. Restart and check

```bash
docker compose up -d
```

Send a message from the web chat. If the backend does not start, or every answer is "I can't complete the response.", see [Troubleshooting](../troubleshoot/).
