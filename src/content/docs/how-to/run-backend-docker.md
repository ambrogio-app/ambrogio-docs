---
title: Run the backend with Docker
description: Install the Ambrogio backend as a long-running Docker container on your home server.
sidebar:
  label: Run the backend with Docker
---

This guide sets up the backend as a permanent service on a home server. If you have never run Ambrogio, follow [Your first conversation](/tutorials/first-conversation/) first.

## Before you start

- A Linux host with Docker. The image is built for `linux/amd64`.
- A Mistral API key for the agents.
- A decision on where to keep files on the host. This guide uses `/srv/ambrogio`.

## 1. Get an image

Pick one of these:

- **Published image.** Images are published to `ghcr.io/adrianofoschi/ambrogio-backend` with a tag for every release, such as `v0.1.0`. There is no `latest` tag, so you always name a version. See [Versions and compatibility](/reference/versions/).
- **Build it yourself** from a commit you choose:

  ```bash
  git clone https://github.com/adrianofoschi/ambrogio-backend.git
  cd ambrogio-backend
  git checkout <commit-or-tag>
  docker build -t ambrogio-backend:<commit-or-tag> .
  ```

The rest of this guide calls the image `IMAGE`.

## 2. Lay out the host folders

```bash
sudo mkdir -p /srv/ambrogio/config/agents /srv/ambrogio/data
```

| Host path | Mounted at | Contents |
|---|---|---|
| `/srv/ambrogio/config` | `/etc/ambrogio` (read-only) | All JSON configuration, including `agents/` |
| `/srv/ambrogio/data` | `/data` | The SQLite conversation archive |

The backend always looks for agents in `/etc/ambrogio/agents`, so the configuration folder must be mounted at `/etc/ambrogio`.

## 3. Write the configuration

Create at least these files. [Backend configuration](/reference/backend-configuration/) and [Agent configuration](/reference/agent-configuration/) list every field.

```json title="/srv/ambrogio/config/http.json"
{ "host": "0.0.0.0", "port": 3000 }
```

```json title="/srv/ambrogio/config/conversations.json"
{ "archivePath": "/data/conversations.sqlite", "language": "it" }
```

```json title="/srv/ambrogio/config/agents/orchestrator.json"
{
  "instructions": "You are Ambrogio, the assistant of an Italian family.",
  "llm": { "provider": "mistral", "model": "mistral-medium-latest", "apiKey": "..." }
}
```

```json title="/srv/ambrogio/config/agents/general.json"
{
  "description": "Answers general questions and makes conversation.",
  "instructions": "Always answer in Italian, briefly and plainly.",
  "llm": { "provider": "mistral", "model": "mistral-medium-latest", "apiKey": "..." }
}
```

The agent files contain your API key. Make them readable only by the account that runs Docker:

```bash
sudo chmod 600 /srv/ambrogio/config/agents/*.json
```

`host` must be `0.0.0.0` inside a container, otherwise Docker cannot forward the port.

## 4. Start the container

```bash
docker run -d --name ambrogio --restart unless-stopped \
  -p 3000:3000 \
  -v /srv/ambrogio/config:/etc/ambrogio:ro \
  -v /srv/ambrogio/data:/data \
  -e AMBROGIO_HTTP_CONFIG_PATH=/etc/ambrogio/http.json \
  -e AMBROGIO_CONVERSATIONS_CONFIG_PATH=/etc/ambrogio/conversations.json \
  IMAGE
```

`--restart unless-stopped` brings Ambrogio back after a reboot. To expose it only to the host itself, for example behind a reverse proxy on the same machine, use `-p 127.0.0.1:3000:3000`.

## 5. Check it

```bash
curl -s http://localhost:3000/api/conversations
```

A JSON object with `items` and `nextCursor` means the backend is up. If not, see [Troubleshooting](/how-to/troubleshoot/).

## Next

- To add voice, follow [Enable voice](/how-to/enable-voice/).
- To reach Ambrogio over HTTPS, follow [Put the backend behind HTTPS](/how-to/reverse-proxy-https/).
- Read [Security and privacy](/explanation/security/) before you open the port to anything beyond your home network.
