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
- A checkout of `ambrogio-backend` version 0.1.0 or later, for the example file.

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

## 4. Add the agent file

The backend repository ships a ready configuration in `examples/agents/home-assistant.json`. Copy it into the backend's `agents` folder:

```bash
cp ambrogio-backend/examples/agents/home-assistant.json /srv/ambrogio/config/agents/
```

Open the copy and replace the two placeholders, `<MISTRAL_API_KEY>` and `<HOME_ASSISTANT_LONG_LIVED_ACCESS_TOKEN>`. If your Home Assistant is not at `homeassistant.local:8123`, change `mcp.url` too. The result looks like this:

```json title="agents/home-assistant.json"
{
  "description": "Reads the state of the home's lights, switches and sensors through Home Assistant and turns devices on or off.",
  "instructions": "You control the family's home through Home Assistant. Always answer in Italian, briefly. Use the tools to read states and to perform actions. Say that an action happened only after a tool has confirmed it; if a tool fails or a device is not available, say so.",
  "llm": {
    "provider": "mistral",
    "model": "mistral-medium-latest",
    "apiKey": "your Mistral key"
  },
  "maxToolCalls": 5,
  "mcp": {
    "url": "http://homeassistant.local:8123/api/mcp",
    "auth": { "type": "bearer", "token": "the token from step 3" }
  }
}
```

The file name, `home-assistant`, is the agent's name. `maxToolCalls` is the most tool calls the agent may make for one request. Five is enough to check a state and change a couple of devices. If the agent needs more, the turn fails with the standard error message instead of running on.

Protect the file, since it holds two secrets:

```bash
chmod 600 /srv/ambrogio/config/agents/home-assistant.json
```

## 5. Restart and try it

```bash
docker restart ambrogio
```

The backend connects to Home Assistant at startup and asks which tools it offers. If Home Assistant cannot be reached, or the token is wrong, the backend does not start, and its log shows `"event":"server_startup_failed"` with the message `Agent MCP connection failed: home-assistant`.

Then ask: *"Che luci sono accese in casa?"*, followed by *"Spegni quella in cucina."*.

## If the orchestrator picks the wrong agent

The orchestrator only sees each agent's `description`. If home requests end up with the general agent, make the Home Assistant description more specific (name the rooms or kinds of devices) and the general one clearly about other things. See [Agents and the orchestrator](../../explanation/agents/).
