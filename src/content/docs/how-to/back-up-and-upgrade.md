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
| Conversations | The SQLite file named in `archivePath`, for example `/srv/ambrogio/data/conversations.sqlite` |
| Configuration and API keys | `/srv/ambrogio/config/` |
| Your own voices or models, if any | `/srv/ambrogio/models/`, `/srv/ambrogio/voices/` |

Satellites and terminal clients store nothing apart from their own configuration file.

The configuration folder contains API keys and tokens. Keep backups somewhere private.

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

1. Read [Versions and compatibility](/reference/versions/). A backend that changes the conversation protocol needs matching clients.
2. Back up the conversations as above.
3. Get the new image: pull the new tag, or build from the new commit.
4. Recreate the container with the same `docker run` options and the new image:

   ```bash
   docker rm -f ambrogio
   docker run -d --name ambrogio ... ghcr.io/adrianofoschi/ambrogio-backend:<new-version>
   ```

5. Check the configuration reference for the new version. The format can still change between versions, and a file that the new version does not accept stops it from starting.

At startup the backend updates the database structure by itself. Your conversations are kept. There is no automatic way back: to return to the old version, restore the backup you made in step 2.

## Upgrade a satellite or the terminal client

From its folder:

```bash
git pull
pnpm install --frozen-lockfile && pnpm build   # satellite
npm ci && npm run build                        # terminal client
```

With Docker, rebuild the satellite image and recreate the container. Restart the program afterwards.

## Turns that were running during the upgrade

Stopping the backend interrupts any answer in progress. Those turns appear in the history as interrupted and are not retried. Upgrade when nobody is talking to Ambrogio.
