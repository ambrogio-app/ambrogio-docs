---
title: Connect Home Assistant
description: Let Ambrogio read and control your Home Assistant devices through Home Assistant's MCP server.
sidebar:
  label: Connect Home Assistant
---

Home Assistant can act as an [MCP](https://modelcontextprotocol.io/) server. You give Ambrogio an agent that connects to it, and that agent can then read the state of your devices and switch them on and off during a conversation.

## Before you start

- Home Assistant is reachable from the machine that runs the Ambrogio backend.
- You can log in to Home Assistant as an administrator.
- A backend build with TypeScript configuration modules and a matching repository checkout.

## 1. Turn on the MCP server in Home Assistant

1. In Home Assistant, open **Settings → Devices & services**.
2. Select **Add integration** and choose **Model Context Protocol Server**.
3. Follow the steps on screen.

The server is now available at `/api/mcp` on your Home Assistant address, for example `http://homeassistant.local:8123/api/mcp`.

## 2. Choose what Ambrogio may control

Home Assistant only lets MCP clients see and control the entities that are **exposed to Assist**. Open **Settings → Voice assistants → Expose** and expose the lights, switches and sensors you want Ambrogio to use. Leave out anything you would not want an AI to touch, such as locks or the alarm.

## 3. Create an access token

1. In Home Assistant, open your user profile and go to the **Security** tab.
2. Under **Long-lived access tokens**, select **Create token** and name it `Ambrogio`.
3. Copy the token. Home Assistant shows it only once.

## 4. Add the agent module

The backend repository provides `examples/agents/home-assistant.ts`. Mount it in the backend service in `compose.example.yaml`:

```yaml
- ./examples/agents/home-assistant.ts:/etc/ambrogio/agents/home-assistant.ts:ro
```

The module reads its MCP URL and token from the container environment. Add these mappings under the backend service's `environment` section:

```yaml
AMBROGIO_HOME_ASSISTANT_MCP_URL: ${AMBROGIO_HOME_ASSISTANT_MCP_URL:-http://homeassistant.local:8123/api/mcp}
HOME_ASSISTANT_LONG_LIVED_ACCESS_TOKEN: ${HOME_ASSISTANT_LONG_LIVED_ACCESS_TOKEN:?Set HOME_ASSISTANT_LONG_LIVED_ACCESS_TOKEN}
```

Add `HOME_ASSISTANT_LONG_LIVED_ACCESS_TOKEN=<your-token>` to the private `.env`. The example agent uses `MISTRAL_API_KEY` from the existing Compose service. Set `AMBROGIO_HOME_ASSISTANT_MCP_URL` if Home Assistant uses another address. Its `maxToolCalls` limit is five. The file name, `home-assistant`, is the agent identifier. The backend supplies the selected response language from `conversations.ts`.

```bash
docker compose -f compose.example.yaml up -d
```

## 5. Try it

The backend connects to Home Assistant at startup and asks which tools and prompts it offers. At every request it reads Home Assistant's prompt again: it tells the model how to use the tools and lists the areas and devices exposed to Assist. A device you expose or rename in Home Assistant works from the next request, without restarting the backend. If Home Assistant cannot be reached, or the token is wrong, the backend does not start, and its log shows `"event":"server_startup_failed"` with the message `Agent MCP connection failed: home-assistant`.

Then ask: *"Which lights are on?"*, followed by *"Turn off the kitchen one."* and *"Turn off all the lights."*. A question such as *"Is the bedroom light on?"* only reads the state; it does not change any device.

## If the orchestrator picks the wrong agent

The orchestrator only sees each agent's `description`. If home requests end up with the general agent, make the Home Assistant description more specific (name the rooms or kinds of devices) and the general one clearly about other things. See [Agents and the orchestrator](../../explanation/agents/).
