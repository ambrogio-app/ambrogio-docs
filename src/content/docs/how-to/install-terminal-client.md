---
title: Install the terminal client
description: Set up the Ambrogio terminal chat on any computer that can reach the backend.
sidebar:
  label: Install the terminal client
---

The terminal client is a chat in a terminal window, for any computer that can reach the backend; it shows the same conversations as every other client (see [Architecture](../../explanation/architecture/#any-client-any-conversation)). It runs from a checkout of its repository. There is no installable package yet.

## Before you start

- The computer meets the [terminal client requirements](../../reference/requirements/#terminal-client).
- The backend's address, for example `http://ambrogio.home.lan:3000`, reachable from this computer.

## Install

```bash
git clone --branch v0.4.0 https://github.com/ambrogio-app/ambrogio-cli.git
cd ambrogio-cli
npm install --global pnpm@12.11.2
pnpm install --frozen-lockfile
pnpm build
```

## Run

Pass the backend's address with `--server`:

```bash
pnpm start --server http://ambrogio.home.lan:3000
```

To avoid typing the address every time, set it in your shell profile:

```bash
export AMBROGIO_URL=http://ambrogio.home.lan:3000
```

Then `pnpm start` is enough. If you pass `--server` as well, it wins over the variable.

## Give the client a stable name

The client introduces itself to the backend as `cli-<hostname>`. If several people share a computer, or the hostname changes, set your own identifier:

```bash
pnpm start --server http://ambrogio.home.lan:3000 --client-id cli-anna-laptop
```

or `export AMBROGIO_CLIENT_ID=cli-anna-laptop`. The identifier only labels the connection on the backend. It does not separate conversations: everyone sees the same list.

## Update

From the client's folder, check out the new release and build it again:

```bash
git fetch --tags
git checkout <release>
pnpm install --frozen-lockfile
pnpm build
```

All options and keys are listed in [Terminal client](../../reference/terminal-client/).
