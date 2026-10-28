---
title: Before you install
description: Hardware, software and accounts that each Ambrogio program needs.
sidebar:
  label: Before you install
---

| Program | Needed |
|---|---|
| Backend | Always, one per home. |
| Web chat | Optional. |
| Terminal client | Optional. |
| Voice satellite | Optional, one per room you want to talk in. |

None of the clients is required: install only the ones you want, in any combination. To talk to Ambrogio you need at least one of them. The sections below list what each program needs.

## Backend

| Need | Requirement |
|---|---|
| Host | Linux on x86_64. The backend image is published for `linux/amd64` only. |
| CPU for voice | x86_64 with AVX2. Without AVX2, for example on a low-end Celeron, speech recognition falls behind: the text of a voice turn arrives after the end of the sentence, with a delay that grows with its length. `grep -o -m1 avx2 /proc/cpuinfo` prints `avx2` when the CPU has it. Text conversations do not need it. |
| Software | Docker with the Compose plugin. The database runs as a second container, image `pgvector/pgvector:pg18`. |
| LLM provider | An account and an API key with one of the [supported providers](../agent-configuration/#providers), or an OpenAI-compatible model server on your network. |
| Network | Reachable from every client on your home network. The backend has no login: do not expose it to the internet. See [Security and privacy](../../explanation/security/). |

## Web chat

| Need | Requirement |
|---|---|
| Host | Docker on `linux/amd64` or `linux/arm64`, usually the backend's host. |
| Backend | Its address must be listed in `AMBROGIO_ALLOWED_ORIGINS`. See [Web chat](../web-chat/#backend-setting). |

## Terminal client

| Need | Requirement |
|---|---|
| Software | Node.js 24 or later and pnpm 12.11.2. |
| Terminal | Interactive, at least 70 columns and 14 rows. |

## Voice satellite

| Need | Requirement |
|---|---|
| Device | Linux on x86_64 or arm64, for example a Raspberry Pi 4 or 5 with a 64-bit OS, or a mini PC. |
| Audio | A microphone and a speaker that work with ALSA. |
| Software | Docker with the Compose plugin, and access to `/dev/snd`. |
| Backend | Voice enabled. See [Configure voice](../../how-to/configure-voice/). |

## Optional services

| Service | Requirement |
|---|---|
| Home Assistant | The **Model Context Protocol Server** integration, in a release that serves the Streamable HTTP endpoint `/api/mcp`. See [Connect Home Assistant](../../how-to/connect-home-assistant/). |
| Music Assistant | The **FastMCP Server** plugin. See [Connect Music Assistant](../../how-to/connect-music-assistant/). |
| OpenCloud | Full-text search and the independent [opencloud-mcp](https://github.com/adrianofoschi/opencloud-mcp) server. See [Connect OpenCloud](../../how-to/connect-opencloud/). |
| Other MCP servers | Streamable HTTP over `http://` or `https://`. See [Agent configuration](../agent-configuration/#mcp). |
