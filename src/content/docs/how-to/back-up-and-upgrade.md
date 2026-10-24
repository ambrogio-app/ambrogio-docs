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
| Conversations | The SQLite file named in `AMBROGIO_ARCHIVE_PATH`, for example `/srv/ambrogio/data/conversations.sqlite` on the host |
| Agent JSON files, Compose file and private `.env` | Your backend repository checkout |
| Your own voices or models, if any | `/srv/ambrogio/models/`, `/srv/ambrogio/voices/` |

Satellites and terminal clients store nothing apart from their own configuration.

The `.env` contains API keys or tokens; agent files contain none. Keep backups somewhere private.

## Back up the conversations

The simplest safe copy is taken with the backend stopped:

```bash
docker stop ambrogio
cp /srv/ambrogio/data/conversations.sqlite /backup/conversations-$(date +%F).sqlite
docker start ambrogio
```

To copy without stopping, use SQLite's own backup command, which produces a consistent file while the server runs:

```bash
sqlite3 /srv/ambrogio/data/conversations.sqlite ".backup '/backup/conversations-$(date +%F).sqlite'"
```

Audio is never stored, so there are no recordings to back up.

## Upgrade the backend

1. Read [Versions and compatibility](../../reference/versions/). A backend that changes the conversation protocol needs matching clients.
2. Back up the conversations as above.
3. Get the new image: pull the new tag, or build from the new commit.
4. Set `AMBROGIO_VERSION` to the new image tag in `.env`, then recreate the backend with `docker compose -f compose.example.yaml up -d`.

5. Check the configuration reference for the new version. The configuration can still change between versions, and a configuration that the new version does not accept stops it from starting. [Versions and compatibility](../../reference/versions/#next-release-configuration-change) describes the move from TypeScript modules to environment variables.

At startup the backend updates the database structure by itself. Your conversations are kept. There is no automatic way back: to return to the old version, restore the backup you made in step 2.

## Upgrade a satellite or the terminal client

From its folder:

```bash
git pull
pnpm install --frozen-lockfile && pnpm build
```

The terminal client `v0.2.0` needs Node.js 24 and pnpm 12.11.2; a checkout of `v0.1.0` used npm. Install pnpm with `npm install --global pnpm@12.11.2` before the first upgrade.

With Docker, rebuild the satellite image and recreate the container. Restart the program afterwards.

## Turns that were running during the upgrade

Stopping the backend interrupts any answer in progress. Those turns appear in the history as interrupted and are not retried. Upgrade when nobody is talking to Ambrogio.
