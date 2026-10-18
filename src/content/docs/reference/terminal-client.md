---
title: Terminal client
description: Options, environment variables and keys of the Ambrogio terminal client.
sidebar:
  label: Terminal client
---

## Command line

```bash
npm start -- --server <url> [--client-id <id>]
```

| Option | Variable | Default | Meaning |
|---|---|---|---|
| `--server <url>` | `AMBROGIO_URL` | none, required | Backend address. Absolute `http://` or `https://` URL with no user name, password, query or fragment. A path prefix is allowed. |
| `--client-id <id>` | `AMBROGIO_CLIENT_ID` | `cli-<hostname>` | Identifier sent to the backend when the session opens. Must not be empty. |
| `--help`, `-h` | | | Prints usage and exits. |

An option wins over its variable. The name sent to the backend is always `Terminale <hostname>`.

The client must run in an interactive terminal of at least 70 × 14 characters. Its interface is in Italian.

| Exit code | Meaning |
|---|---|
| `0` | Normal exit. |
| `2` | Invalid options, missing or invalid server address, or not an interactive terminal. |

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
| Start | Selects a local **Nuova chat**. Nothing is created on the backend until you send the first message. |
| First message sent | Opens the WebSocket session. One session serves every chat. |
| Message empty or larger than 64 KiB | Not sent. |
| Answer arriving | Shows the text as it streams in. |
| `turn.completed` | The turn is done and saved. |
| `turn.failed` or `turn.rejected` | Replaces the partial text with the backend's message. |
| `turn.interrupted`, or the session drops before an outcome | Marks the turn as interrupted locally. |
| A turn still being answered when you open a chat | Shows *"In elaborazione. Aggiorna manualmente più tardi."* Press `Ctrl+R` later. |
| Chat list | Each chat is named after its first message. If a chat's history cannot be loaded, it is shown with a short ID. |

The client ignores `expectsReply`: the input field is always available.

## Compatibility

The backend revision this client is tested against is recorded in `system-model/Contracts/TerminalConversation.md` in its repository. See [Versions and compatibility](../versions/).
