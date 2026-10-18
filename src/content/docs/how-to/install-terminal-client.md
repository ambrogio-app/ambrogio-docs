---
title: Install the terminal client
description: Set up the Ambrogio terminal chat on any computer that can reach the backend.
sidebar:
  label: Install the terminal client
---

The terminal client runs from a checkout of its repository. There is no installable package yet.

## Before you start

- Node.js 22 or later, with npm.
- A terminal window at least 70 columns wide and 14 rows high.
- The backend's address, for example `http://ambrogio.home.lan:3000`, reachable from this computer.

## Install

```bash
git clone https://github.com/ambrogio-app/ambrogio-cli.git
cd ambrogio-cli
npm ci
npm run build
```

## Run

Pass the backend's address with `--server`:

```bash
npm start -- --server http://ambrogio.home.lan:3000
```

The `--` separates npm's own options from the client's.

To avoid typing the address every time, set it in your shell profile:

```bash
export AMBROGIO_URL=http://ambrogio.home.lan:3000
```

Then `npm start` is enough. If you pass `--server` as well, it wins over the variable.

## Give the client a stable name

The client introduces itself to the backend as `cli-<hostname>`. If several people share a computer, or the hostname changes, set your own identifier:

```bash
npm start -- --server http://ambrogio.home.lan:3000 --client-id cli-anna-laptop
```

or `export AMBROGIO_CLIENT_ID=cli-anna-laptop`. The identifier only labels the connection on the backend. It does not separate conversations: everyone sees the same list.

## Update

```bash
git pull
npm ci
npm run build
```

Check that the new version matches your backend; see [Versions and compatibility](../../reference/versions/).

All options and keys are listed in [Terminal client](../../reference/terminal-client/).
