---
title: Put the backend behind HTTPS
description: Serve Ambrogio through a reverse proxy with TLS, and limit who can reach it.
sidebar:
  label: Put the backend behind HTTPS
---

The backend speaks plain HTTP and has no login. To use HTTPS, put a reverse proxy in front of it. The proxy handles the certificate and is also the right place to decide who may connect.

## 1. Keep the backend private

Publish the backend's port only on the loopback interface, so that clients have to go through the proxy:

```bash
docker run ... -p 127.0.0.1:3000:3000 ... IMAGE
```

If the proxy runs in another container, put both on the same Docker network instead and publish nothing.

## 2. Configure the proxy

The proxy must forward two kinds of traffic to the same port:

- ordinary `GET` requests under `/api/conversations`;
- a WebSocket upgrade on `/api/session`.

### Caddy

Caddy forwards WebSocket upgrades on its own:

```txt title="Caddyfile"
ambrogio.example.com {
	@outside not remote_ip 192.168.1.0/24
	respond @outside 403

	reverse_proxy 127.0.0.1:3000
}
```

The `@outside` rule turns away anyone outside your home network. Adjust the range to yours.

### nginx

nginx needs the upgrade headers spelled out:

```nginx title="/etc/nginx/conf.d/ambrogio.conf"
server {
    listen 443 ssl;
    server_name ambrogio.example.com;
    ssl_certificate     /etc/ssl/ambrogio/fullchain.pem;
    ssl_certificate_key /etc/ssl/ambrogio/privkey.pem;

    allow 192.168.1.0/24;
    deny  all;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

The backend pings every session every 30 seconds, which keeps idle connections well inside nginx's default 60-second read timeout.

## 3. Tell the backend it is served over HTTPS

When the public address is HTTPS only, set `publicHttps` in `http.json` so the backend sends a `Strict-Transport-Security` header:

```json title="http.json"
{
  "host": "0.0.0.0",
  "port": 3000,
  "publicHttps": true,
  "hstsMaxAgeSeconds": 86400
}
```

`hstsMaxAgeSeconds` is required with `publicHttps`. Start with one day; raise it to a year (`31536000`) once you are sure HTTPS stays. The backend never adds `includeSubDomains` or `preload`. If your proxy already sends this header, set it in only one place.

Restart the backend.

## 4. Point the clients at the new address

Use the `https://` address everywhere. The clients switch to `wss://` for the session by themselves.

- Terminal client: `npm start -- --server https://ambrogio.example.com`
- Satellite: `"backend": { "baseUrl": "https://ambrogio.example.com" }`
- Web chat: `"backendUrl": "https://ambrogio.example.com"` in `config.json`

All three accept a path prefix, such as `https://example.com/ambrogio/`. The backend itself always serves `/api/...`, so a proxy that uses a prefix must strip it before forwarding.

## About `allowedOrigins`

The terminal client and the satellite are not web pages and send no `Origin` header, so they need nothing here. The [web chat](../install-web-chat/) is a web page: list the HTTPS address where people open it, for example `"https://chat.example.com"`, and set its `config.json` to the HTTPS address of the backend. Add other entries only for browser applications of your own. See [Backend configuration](../../reference/backend-configuration/#httpjson).
