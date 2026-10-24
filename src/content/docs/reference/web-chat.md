---
title: Web chat
description: Configuration file, container, keys, texts and behaviour of the Ambrogio web chat.
sidebar:
  label: Web chat
---

## `config.json`

Read by the page every time it opens, from the same folder as `index.html`, bypassing the browser cache. In the container the path is `/usr/share/nginx/html/config.json`.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `backendUrl` | string | required | Backend address as the browser sees it. Absolute `http://` or `https://` URL with no user name, password, query or fragment. A path prefix is allowed. |
| `language` | `"it"` or `"en"` | the first supported language of the browser, otherwise `"en"` | Language of the interface. |

Any other field, an unsupported `language` or an invalid `backendUrl` makes the file invalid. From `backendUrl` the page derives `api/conversations` for the list and history, and `api/session` for the conversation session, with `ws://` for `http://` and `wss://` for `https://`.

When the file is missing or invalid, the page shows "Invalid web client configuration" in the browser's language (see [Interface texts](#interface-texts)), followed by a technical reason, and contacts nothing else:

| Reason | Meaning |
|---|---|
| `config.json: HTTP <status>` | The file could not be served, for example `404` when it is not mounted. |
| `config.json: cannot be read` | The request failed. |
| `config.json: invalid JSON` | The file is not valid JSON. |
| `config.json: expected a JSON object` | The file is valid JSON but not an object. |
| `backendUrl: required string` | `backendUrl` is missing or not a string. |
| `backendUrl: absolute http(s) URL without credentials, query or fragment` | `backendUrl` is not an acceptable address. |
| `language: unsupported value "<value>"` | `language` is neither `it` nor `en`. |
| `unknown field "<name>"` | The file has a field other than `backendUrl` and `language`. |

## Backend setting

The page's origin must be listed in `allowedOrigins` of the backend's `http.ts`, otherwise the backend refuses the conversation session with `403` and sends no CORS headers for the list and history. See [Backend configuration](../backend-configuration/#httpts).

## Container

| Item | Value |
|---|---|
| Image | `ambrogio-web`, built from the repository. Release images will be published as `ghcr.io/ambrogio-app/ambrogio-web:<tag>` for `linux/amd64` and `linux/arm64`, without a `latest` tag. |
| Port | `8080`, plain HTTP |
| User | Unprivileged (`nginx-unprivileged`) |
| Configuration | `config.json`, mounted read-only at `/usr/share/nginx/html/config.json`. Not included in the image. |

Every response carries these headers:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `no-referrer` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' http: https: ws: wss:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'; object-src 'none'` |
| `Cache-Control` | `no-store` for `index.html`, `config.json` and everything outside `assets/`; `public, max-age=31536000, immutable` under `assets/` |

The `Server` header does not show the nginx version. HTTPS and HSTS are up to your reverse proxy. The page uses relative paths, so a proxy can serve it under a path prefix.

## Keys

| Key | Where | Action |
|---|---|---|
| `Enter` | Message field | Send the message. |
| `Shift+Enter` | Message field | New line. |
| `Tab`, `Shift+Tab` | Anywhere | Move between commands, chats and the message field. |
| `Enter`, `Space` | A button | Activate it. |
| `Esc` | Conversations panel on narrow screens | Close the panel and return to the button that opened it. |

## Behaviour

| Situation | What the page does |
|---|---|
| Opening | Selects a local **New chat** as the first entry. Nothing is created on the backend until you send the first message. |
| First message sent | Opens the WebSocket session. One session serves every chat. The entry takes the first message as its name. |
| Message empty, only spaces, or larger than 64 KiB | Not sent; the page shows "Write a non-empty message." or "Message too large (64 KiB at most)." |
| No `session.ready` within 10 seconds, or the session cannot open | The message ends with "Cannot connect to the backend." |
| Answer arriving | Shows the text as it streams in. When the turn ends, the page reloads the conversation from the backend. |
| `turn.completed` | The turn is done and saved. |
| `turn.failed` or `turn.rejected` | Replaces the partial text with the backend's message. |
| `turn.interrupted`, or the session drops before an outcome | Shows "Response interrupted." |
| `session.error` for the message | Shows "Protocol error." |
| A turn still being answered when you open a chat | Shows "In progress. Refresh later to see the outcome." Press **Refresh** later. |
| While a turn is being answered | You can open other chats, start a new one, refresh and send in other chats. Only the chat that is answering cannot send until the turn ends. Coming back to it shows the answer received so far. |
| **Refresh** | Reloads the first page of the list and the open chat. |
| **More conversations** | Loads the next page. Shown only when there is one. |
| Chat list | Each chat is named after its first message, up to 60 characters with "…". If its history cannot be read, it shows the first 8 characters of its ID. |
| Screen narrower than 720 pixels | The list becomes a panel opened by the **Conversations** button; choosing a chat closes it. |
| Colours | Follow the light or dark setting of the device. |

The page ignores `expectsReply`: the message field is always available.

### Answers

Ambrogio's answers are shown as Markdown, including tables and task lists. HTML inside an answer is shown as text. Only `http:`, `https:` and `mailto:` links are clickable, and they open in a new tab. Images are never loaded: their alternative text is shown instead, as a link when the image address is `http:` or `https:`. Your own messages and error messages are shown as plain text.

### Address of the open chat

The open conversation appears in the address as `#/c/<conversationId>`; **New chat** has no fragment. You can reload the page, bookmark a conversation or use the browser's back button. A fragment of another form is ignored. If the conversation does not exist, the page shows the backend's message, such as "Conversation not found.", and **New chat** stays available.

### Identity

At first use the browser creates the identifier `web-<random UUID>` and keeps it in local storage under `ambrogio.web.clientId`. The name sent to the backend is `Web Firefox`, `Web Chrome`, `Web Edge`, `Web Safari` or `Web browser`. Clearing the site data, or a browser that blocks local storage, gives a new identifier. The identifier only labels the connection: everyone sees the same conversations.

### Accessibility

The chat list is a navigation region and the open chat the main region. Every command has an accessible name and works from the keyboard, the focused element is outlined, and each message is labelled "You" or "Ambrogio". The current chat is marked as current. When a turn ends, screen readers announce the answer, the error or "Response interrupted.", but not each fragment.

## Interface texts

| Key | `it` | `en` |
|---|---|---|
| New chat | Nuova chat | New chat |
| Refresh | Aggiorna | Refresh |
| More conversations | Altre conversazioni | More conversations |
| Conversations panel | Conversazioni | Conversations |
| Send | Invia | Send |
| Message field | Scrivi un messaggio | Write a message |
| Your messages | Tu | You |
| Answers | Ambrogio | Ambrogio |
| Turn in progress | In elaborazione. Aggiorna più tardi per vedere l'esito. | In progress. Refresh later to see the outcome. |
| Interrupted | Risposta interrotta. | Response interrupted. |
| Empty message | Scrivi un messaggio non vuoto. | Write a non-empty message. |
| Message too large | Messaggio troppo grande (massimo 64 KiB). | Message too large (64 KiB at most). |
| Backend unreachable | Impossibile collegarsi al backend. | Cannot connect to the backend. |
| Protocol error | Errore del protocollo. | Protocol error. |
| Invalid configuration | Configurazione del client web non valida | Invalid web client configuration |

Messages produced by the backend, such as refusals and turn errors, appear as the backend sends them, in the language set in its [`conversations.ts`](../backend-configuration/#conversationsts).

## Compatibility

The client uses the `ambrogio.v1` protocol and the HTTP API of the backend, and works with every backend release that offers them. See [Versions and compatibility](../versions/).
