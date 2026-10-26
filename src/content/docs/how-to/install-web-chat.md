---
title: Install the web chat
description: Add the optional browser chat to an Ambrogio installation as a Docker container next to the backend.
sidebar:
  label: Install the web chat
---

The web chat is an optional container that serves a chat page to the browsers of your home. The page talks to the backend directly, so the backend must allow the page's address.

## Before you start

- A running backend. See [Versions and compatibility](../../reference/versions/).
- A Linux host with Docker. It can be the same host as the backend.
- The address where people will open the chat, for example `http://ambrogio.home.lan:8080`. This guide calls it the *chat address*.
- The backend address as the browser sees it, for example `http://ambrogio.home.lan:3000`.

If people open the chat over HTTPS, the backend address must be HTTPS too: browsers block plain `http://` and `ws://` connections from an HTTPS page.

## 1. Pull the image

The image is published for `amd64` and `arm64`:

```bash
docker pull ghcr.io/ambrogio-app/ambrogio-web:v0.3.1
```

## 2. Write `config.json`

The page reads this file when it opens. Keep it outside the image, for example in `/srv/ambrogio-web/config.json`:

```json title="/srv/ambrogio-web/config.json"
{
  "backendUrl": "http://ambrogio.home.lan:3000",
  "language": "en"
}
```

`backendUrl` is required. Without `language`, the page follows the browser's language, with English as fallback. Any other field makes the file invalid. See [Web chat](../../reference/web-chat/#configjson).

## 3. Allow the chat address in the backend

Add the chat address to `AMBROGIO_ALLOWED_ORIGINS` in the backend configuration. Write it exactly as it appears in the browser's address bar, with scheme and port, without a path or trailing slash:

Add `AMBROGIO_ALLOWED_ORIGINS: https://chat.example.com` to the backend service's `environment` section of the Compose file. Separate several origins with commas.

Restart the backend. Without this entry the backend refuses the page: the sidebar shows "Cannot connect to the backend." instead of the conversations, and every message ends with the same text.

The entry is needed even when the chat and the backend share the same address behind a reverse proxy, because browsers always declare the page's address when they open the conversation session.

## 4. Start the container

```bash
docker run -d --name ambrogio-web --restart unless-stopped \
  -p 8080:8080 \
  -v /srv/ambrogio-web/config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/ambrogio-app/ambrogio-web:v0.3.1
```

The container listens on port 8080 as an unprivileged user. With Docker Compose, add a service next to the backend:

```yaml title="compose.yaml"
services:
  ambrogio-web:
    image: ghcr.io/ambrogio-app/ambrogio-web:v0.3.1
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - /srv/ambrogio-web/config.json:/usr/share/nginx/html/config.json:ro
```

## 5. Check it

Open the chat address in a browser. The sidebar shows **New chat** and your stored conversations. Send a message and watch the answer appear.

| What you see | Cause |
|---|---|
| "Invalid web client configuration" with a reason | `config.json` is missing, not mounted at the right path, or has a wrong field. The reason names the problem. |
| "Cannot connect to the backend." in the sidebar or after sending | The chat address is not in `AMBROGIO_ALLOWED_ORIGINS`, the backend is not reachable from the browser, or an HTTPS page points at an `http://` backend. |

## Next

- To serve the chat over HTTPS, put it behind the same reverse proxy as the backend; see [Put the backend behind HTTPS](../reverse-proxy-https/). The container serves plain HTTP.
- Everything the page does is listed in [Web chat](../../reference/web-chat/).
