---
title: Back up and upgrade
description: Save your conversations and configuration, and move to a newer version of Ambrogio safely.
sidebar:
  label: Back up and upgrade
---

## What to back up

Everything that matters lives on the backend host:

| What | Where (Docker layout from these guides) |
|---|---|
| Conversations | The PostgreSQL database named in `AMBROGIO_DATABASE_URL`; with `compose.example.yaml`, the database `ambrogio` of the `database` service |
| Agent JSON files, Compose file and private `.env` | Your backend repository checkout |
| Your own voices or models, if any | `/srv/ambrogio/models/`, `/srv/ambrogio/voices/` |

Satellites and terminal clients store nothing apart from their own configuration.

The `.env` contains API keys, tokens and the database password; agent files contain none. Keep backups somewhere private.

## Back up the conversations

Use `pg_dump`, which produces a consistent copy while the backend runs. With `compose.example.yaml`, from the backend repository:

```bash
docker compose -f compose.example.yaml exec -T database \
  pg_dump --username ambrogio --format custom ambrogio > /backup/conversations-$(date +%F).dump
```

To restore a copy, stop the backend, then load it into the database and start the backend again:

```bash
docker compose -f compose.example.yaml stop backend
docker compose -f compose.example.yaml exec -T database \
  pg_restore --username ambrogio --dbname ambrogio --clean --if-exists < /backup/conversations-<date>.dump
docker compose -f compose.example.yaml start backend
```

Audio is never stored, so there are no recordings to back up.

## Upgrade the backend

1. Read [Versions and compatibility](../../reference/versions/). A backend that changes the conversation protocol needs matching clients.
2. Back up the conversations as above.
3. Get the new image: pull the new tag, or build from the new commit.
4. Set `AMBROGIO_VERSION` to the new image tag in `.env`, then recreate the backend with `docker compose -f compose.example.yaml up -d`.

5. Check the configuration reference for the new version. The configuration can still change between versions, and a configuration that the new version does not accept stops it from starting. [Versions and compatibility](../../reference/versions/#upgrading-to-backend-v0101-and-satellite-v070) describes the move from TypeScript modules to environment variables.

At startup the backend updates the database structure by itself. Your conversations are kept. There is no automatic way back: to return to the old version, restore the backup you made in step 2.

## Upgrade a satellite or the terminal client

From its folder:

```bash
git pull
pnpm install --frozen-lockfile && pnpm build
```

The terminal client `v0.3.0` needs Node.js 24 and pnpm 12.11.2; a checkout of `v0.1.0` used npm. Install pnpm with `npm install --global pnpm@12.11.2` before the first upgrade.

With Docker, rebuild the satellite image and recreate the container. Restart the program afterwards.

## Turns that were running during the upgrade

Stopping the backend interrupts any answer in progress. Those turns appear in the history as interrupted and are not retried. Upgrade when nobody is talking to Ambrogio.
