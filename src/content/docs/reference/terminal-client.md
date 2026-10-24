---
title: Terminal client
description: Options, environment variables and keys of the Ambrogio terminal client.
sidebar:
  label: Terminal client
---

## Command line

```bash
pnpm start --server <url> [--client-id <id>] [--language <it|en>]
```

The client needs Node.js 24 or later and is installed with pnpm 12.11.2.

| Option | Variable | Default | Meaning |
|---|---|---|---|
| `--server <url>` | `AMBROGIO_URL` | none, required | Backend address. Absolute `http://` or `https://` URL with no user name, password, query or fragment. A path prefix is allowed. |
| `--client-id <id>` | `AMBROGIO_CLIENT_ID` | `cli-<hostname>` | Identifier sent to the backend when the session opens. Must not be empty. |
| `--language <it\|en>` | `AMBROGIO_LANGUAGE` | from the system locale | Language of the interface: `it` (Italian) or `en` (English). Any other value is an invalid option. An empty variable counts as unset. |
| `--help`, `-h` | | | Prints usage and exits. |

An option wins over its variable. The name sent to the backend is `Terminale <hostname>` in Italian and `Terminal <hostname>` in English; the identifier does not change with the language.

Without `--language` or `AMBROGIO_LANGUAGE`, the client reads the first non-empty value among `LC_ALL`, `LC_MESSAGES` and `LANG`. A value that starts with `it` selects Italian; anything else, including `C`, `POSIX` or no value at all, selects English. `LANGUAGE` is not read. The language applies to every text the client writes, including usage and startup errors; texts that come from the backend are shown as they arrive.

The client must run in an interactive terminal of at least 70 × 14 characters.

| Exit code | Meaning |
|---|---|
| `0` | Normal exit. |
| `2` | Invalid options, including an unsupported language, missing or invalid server address, or not an interactive terminal. |

## Keys

| Key | Where | Action |
|---|---|---|
| `Enter` | Input field | Send the message. |
| `Enter` | Chat list | Open the selected chat. |
| `↑` `↓` | Chat list | Move the selection. |
| `Tab` | Anywhere | Switch between the input field and the chat list. |
| `Ctrl+N` | Anywhere | Start a new chat. |
| `Ctrl+R` | Anywhere | Reload the chat list and the open chat. |
| `Ctrl+L` | Anywhere | Load the next page of chats. |
| `Ctrl+Q`, `Ctrl+C` | Anywhere | Quit. |

## Behaviour

| Situation | What the client does |
|---|---|
| Start | Selects a local **New chat**. Nothing is created on the backend until you send the first message. |
| First message sent | Opens the WebSocket session. One session serves every chat. |
| Message empty or larger than 64 KiB | Not sent: the text stays in the input and the status line shows "Write a non-empty message." or "Message too large (maximum 64 KiB)." |
| Answer arriving | Shows the text as it streams in. |
| `turn.completed` | The turn is done and saved. |
| `turn.failed` or `turn.rejected` | Replaces the partial text with the backend's message. |
| `turn.interrupted`, or the session drops before an outcome | Marks the turn as interrupted locally. |
| A turn still being answered when you open a chat | Shows "Ambrogio: In progress. Refresh manually later." Press `Ctrl+R` later. |
| Chat list | Each chat is named after its first message. If a chat's history cannot be loaded, it is shown with a short ID. |

The client ignores `expectsReply`: the input field is always available.

## Compatibility

The client uses the `ambrogio.v1` protocol and HTTP API `v1` of the backend, and works with every backend release that offers them. See [Versions and compatibility](../versions/).
