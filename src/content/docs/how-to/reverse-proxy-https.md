---
title: Put the backend behind HTTPS
description: Serve the backend and the web chat through a reverse proxy with TLS, and limit who can reach them.
sidebar:
  label: Put the backend behind HTTPS
---

The backend speaks plain HTTP and [has no login](../../explanation/security/#there-is-no-login). A reverse proxy in front of it handles the certificate and decides who may connect. This guide serves the backend and the web chat at one HTTPS address, `https://ambrogio.example.com`: the proxy sends `/api/*` to the backend and everything else to the web chat.

## Before you start

- The installation from [Install Ambrogio](../../tutorials/install-ambrogio/). Run the commands from `~/ambrogio`.
- Caddy or nginx on the same host, and a name for the address with a certificate for it.

## 1. Keep the backend and the web chat private

In `compose.yaml`, publish both ports on the loopback interface only, so that clients have to go through the proxy:

```yaml
  backend:
    ports:
      - "127.0.0.1:3000:3000"
  web:
    ports:
      - "127.0.0.1:8080:8080"
```

If the proxy runs in a container, put it on the same Docker network as `backend` and `web` instead, and publish neither port.

## 2. Configure the proxy

Forward only `/api/*` to the backend: it carries the HTTP API and the WebSocket upgrade on `/api/session`. Other paths of the backend, such as `/mcp/memory`, stay inside the server.

### Caddy

Caddy forwards WebSocket upgrades on its own:

```txt title="Caddyfile"
ambrogio.example.com {
	@outside not remote_ip 192.168.1.0/24
	respond @outside 403

	handle /api/* {
		reverse_proxy 127.0.0.1:3000
	}
	handle {
		reverse_proxy 127.0.0.1:8080
	}
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

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
    }
}
```

The default read timeout of nginx, 60 seconds, is enough: the backend pings every session every 30 seconds.

## 3. Tell the backend about the new address

In the `environment` section of the `backend` service in `compose.yaml`, set:

```yaml
AMBROGIO_ALLOWED_ORIGINS: https://ambrogio.example.com
AMBROGIO_PUBLIC_HTTPS: "true"
AMBROGIO_HSTS_MAX_AGE_SECONDS: "86400"
```

Start with one day of HSTS; raise it to a year (`31536000`) once you are sure HTTPS stays. If your proxy already sends a `Strict-Transport-Security` header, remove it there or here. See [Backend configuration](../../reference/backend-configuration/#http-listener).

## 4. Point the web chat at the new address

In `web/config.json`, set:

```json
"backendUrl": "https://ambrogio.example.com"
```

Then recreate the containers:

```bash
docker compose up -d
```

## 5. Point the other clients at the new address

- Terminal client: `pnpm start --server https://ambrogio.example.com`
- Satellite: `AMBROGIO_BACKEND_URL: https://ambrogio.example.com`

## Check it

Open `https://ambrogio.example.com` and send a message. If it ends with "Cannot connect to the backend.", the origin in `AMBROGIO_ALLOWED_ORIGINS` differs from the address bar, or the proxy does not forward the WebSocket upgrade on `/api/session`.
