---
title: Connect Home Assistant
description: Let Ambrogio read and control your Home Assistant devices through Home Assistant's MCP server.
sidebar:
  label: Connect Home Assistant
---

Home Assistant can act as an [MCP](https://modelcontextprotocol.io/) server. You give Ambrogio an [agent with tools](../../explanation/agents/) that connects to it, and that agent can then read the state of your devices and switch them on and off during a conversation. [Agents that act on your home](../../explanation/security/#agents-that-act-on-your-home) explains how to limit what it can do.

## Before you start

- Home Assistant reachable from the machine that runs the Ambrogio backend, in a release whose **Model Context Protocol Server** integration serves the Streamable HTTP endpoint `/api/mcp`. The first releases of the integration offer only an SSE endpoint, which Ambrogio does not use.
- You can log in to Home Assistant as an administrator.
- The installation from [Install Ambrogio](../../tutorials/install-ambrogio/). Run the commands from `~/ambrogio`.

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

1. Download the example agent of your backend release, for example `v0.17.0`:

   ```bash
   curl -fsSLo agents/home-assistant.json https://raw.githubusercontent.com/ambrogio-app/ambrogio-backend/v0.17.0/examples/agents/home-assistant.json
   ```

2. In `agents/home-assistant.json`, set `mcp.url` to your Home Assistant address followed by `/api/mcp`, for example `http://homeassistant.local:8123/api/mcp`.

3. The file names the token's variable, `HOME_ASSISTANT_LONG_LIVED_ACCESS_TOKEN`, in `mcp.auth.tokenEnv`. Add it to the `environment` section of the `backend` service in `compose.yaml`:

   ```yaml
   HOME_ASSISTANT_LONG_LIVED_ACCESS_TOKEN: ${HOME_ASSISTANT_LONG_LIVED_ACCESS_TOKEN:?Set HOME_ASSISTANT_LONG_LIVED_ACCESS_TOKEN}
   ```

4. Add the token to `.env`:

   ```dotenv
   HOME_ASSISTANT_LONG_LIVED_ACCESS_TOKEN=<your-token>
   ```

5. Start Home Assistant first, then recreate the backend:

   ```bash
   docker compose up -d
   ```

   The backend connects to Home Assistant once, after it starts.

## 5. Try it

Ask: *"Which lights are on?"*, followed by *"Turn off the kitchen one."* and *"Turn off all the lights."*.

If the home requests get the standard error answer, look for `agent_mcp_unavailable` in `docker compose logs backend`; see [Troubleshooting](../troubleshoot/#an-agent-with-an-mcp-server-does-not-work).

## If the orchestrator picks the wrong agent

Make the Home Assistant agent's `description` more specific, for example by naming the rooms or kinds of devices, and the general one clearly about other things. Then run `docker compose restart backend`.
