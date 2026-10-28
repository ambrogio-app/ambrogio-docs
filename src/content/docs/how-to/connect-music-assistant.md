---
title: Connect Music Assistant
description: Let Ambrogio search your music library and play it on the speakers of your home through Music Assistant's MCP server.
sidebar:
  label: Connect Music Assistant
---

[Music Assistant](https://music-assistant.io/) can act as an [MCP](https://modelcontextprotocol.io/) server through its **FastMCP Server** plugin. You give Ambrogio an [agent with tools](../../explanation/agents/) that connects to it, and that agent can then find tracks, albums, artists and playlists, play them on your players, and pause, skip or change the volume during a conversation.

## Before you start

- Music Assistant reachable from the machine that runs the Ambrogio backend, with your music providers and players already set up in Music Assistant.
- You can log in to Music Assistant.
- The installation from [Self-host Ambrogio](../../tutorials/install-ambrogio/). Run the commands from `~/ambrogio`.

## 1. Turn on the MCP server in Music Assistant

1. In Music Assistant, open **Settings → Plugins** and select **Add a plugin**.
2. Choose **FastMCP Server** and keep **Require authentication** on, so that the server refuses clients without a token.

The server is now available at `/mcp/v1` on your Music Assistant address, for example `http://music-assistant.local:8095/mcp/v1`. It uses the same port as the web interface.

## 2. Create an access token

1. In Music Assistant, open your profile and go to **Long-lived access tokens**.
2. Create a token named `Ambrogio`.
3. Copy the token.

## 3. Add the agent file

1. Create `agents/music.json`:

   ```json title="~/ambrogio/agents/music.json"
   {
     "description": "Searches the family music library and plays music on the speakers of the house through Music Assistant: tracks, albums, artists, playlists, playback control, volume and favorites.",
     "instructions": "You play the family music library on the speakers of the house through Music Assistant. Use the search tools to find tracks, albums, artists and playlists. To play something, first find the item, then call players_list_players to find the player the family names, and start playback with playback_play_media using the item URI and that player. If no player is named and only one player is available, use it; otherwise ask which player. Use pause, resume, stop, next track and volume only on the player in question. Add or remove favorites only when asked. Names in the request come from speech recognition and may be misspelled. If a search finds nothing, try again with only the title, then only the artist, or with the most likely correct spelling of the name, up to three searches, before saying that nothing was found. If a tool fails, say that the music service is not available and do not claim any result. Never invent tracks, players or actions you did not perform. Answer briefly, in plain sentences without lists or formatting, because the answer may be spoken.",
     "llm": {
       "provider": "mistral",
       "model": "mistral-medium-latest",
       "apiKeyEnv": "MISTRAL_API_KEY"
     },
     "maxToolCalls": 6,
     "mcp": {
       "url": "http://music-assistant.local:8095/mcp/v1",
       "auth": {
         "type": "bearer",
         "tokenEnv": "MUSIC_ASSISTANT_TOKEN"
       },
       "tools": [
         "library_search_tracks",
         "library_search_albums",
         "library_search_artists",
         "library_list_library_playlists",
         "players_list_players",
         "playback_play_media",
         "playback_pause",
         "playback_resume",
         "playback_stop",
         "playback_next_track",
         "volume_volume_set",
         "queue_add_to_queue",
         "media_add_to_favorites",
         "media_remove_from_favorites"
       ]
     }
   }
   ```

2. Set `mcp.url` to your Music Assistant address followed by `/mcp/v1`. The tools in `mcp.tools` are the ones the agent needs to search and play; [Agents with tools](../../explanation/agents/) explains why the list is short.

3. The file names the token's variable, `MUSIC_ASSISTANT_TOKEN`, in `mcp.auth.tokenEnv`. Add it to the `environment` section of the `backend` service in `compose.yaml`:

   ```yaml
   MUSIC_ASSISTANT_TOKEN: ${MUSIC_ASSISTANT_TOKEN:?Set MUSIC_ASSISTANT_TOKEN}
   ```

4. Add the token to `.env`:

   ```dotenv
   MUSIC_ASSISTANT_TOKEN=<your-token>
   ```

5. Start Music Assistant first, then recreate the backend:

   ```bash
   docker compose up -d
   ```

   The backend connects to Music Assistant once, after it starts.

## 4. Try it

Ask: *"Play some jazz in the kitchen."*, followed by *"Turn the volume down."* and *"Pause the music."*.

The agent finds a player by the name you gave it in Music Assistant: name the players after the rooms, so that you can say where to play. When you name no player and Music Assistant has more than one, the agent asks which one.

If the music requests get the standard error answer, look for `agent_mcp_unavailable` in `docker compose logs backend`; see [Troubleshooting](../troubleshoot/#an-agent-with-an-mcp-server-does-not-work).

## If the orchestrator picks the wrong agent

Make the music agent's `description` more specific, for example by naming the kinds of music you have, and the general one clearly about other things. Then run `docker compose restart backend`.
