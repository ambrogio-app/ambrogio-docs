---
title: HTTP API
description: The read-only HTTP endpoints that list conversations and return their history, and their error responses.
sidebar:
  label: HTTP API
---

Two `GET` endpoints let a client browse stored conversations. New turns are not sent over HTTP: they go through the [conversation protocol](../conversation-protocol/).

The API carries its major version in the path. The current version is `v1`, under `/api/v1/`. It has its own version cycle, independent of the conversation protocol: the session stays on `/api/session` and is versioned by its WebSocket subprotocol, `ambrogio.v1`. The backend serves only this version: paths under `/api/` without a version, such as `/api/conversations`, get the `404` Problem Details of an unknown path. See [Versions and compatibility](../versions/).

There is no authentication. Every response carries an `X-Request-Id` header; the same value appears as `correlationId` in the backend log. Responses that contain conversation data, and every error response, carry `Cache-Control: no-store`.

## `GET /api/v1/conversations`

Lists conversations, most recently active first. Activity means the time the latest turn was accepted.

| Query parameter | Meaning |
|---|---|
| `limit` | Optional. Page size, a decimal integer from 1 to `AMBROGIO_MAX_LIST_PAGE_SIZE`. Defaults to `AMBROGIO_LIST_PAGE_SIZE`; see [Backend configuration](../backend-configuration/#conversations). |
| `cursor` | Optional. The `nextCursor` value from the previous page. Treat it as opaque. |

**200** `application/json`

```json
{
  "items": [
    { "id": "6f1c…", "lastActivityAt": "2026-10-17T18:42:10.512Z" }
  ],
  "nextCursor": "eyJpZCI6…"
}
```

`nextCursor` is `null` on the last page. If conversations change while you page through, start again without `cursor`.

| Status | `type` | When |
|---|---|---|
| 400 | `/problems/invalid-pagination` | `cursor` is not a cursor returned by the backend, or `limit` is not an integer within the limits. |
| 400 | `/problems/request-validation` | An unknown or repeated query parameter. |
| 500 | `about:blank` | A server fault. |

## `GET /api/v1/conversations/{conversationId}`

Returns one conversation with every turn, oldest first. This is a snapshot: it does not stream and does not include partial answers.

**200** `application/json`

```json
{
  "id": "6f1c…",
  "createdAt": "2026-10-17T18:40:02.001Z",
  "lastActivityAt": "2026-10-17T18:42:10.512Z",
  "turns": [
    {
      "id": "a93e…",
      "text": "Can you recommend a book?",
      "acceptedAt": "2026-10-17T18:40:02.001Z",
      "status": "answered",
      "answer": "Here is one …",
      "finishedAt": "2026-10-17T18:40:05.870Z"
    }
  ]
}
```

| `status` | Extra fields | Meaning |
|---|---|---|
| `pending` | none | Accepted, answer still being produced. |
| `answered` | `answer`, `finishedAt` | Answered successfully. |
| `failed` | `error`, `finishedAt` | Failed; `error` is the message the family saw. |
| `interrupted` | `finishedAt` | The backend stopped before an outcome was saved. |

For a spoken turn, `text` is the transcription. All times are ISO 8601 in UTC.

| Status | `type` | When |
|---|---|---|
| 404 | `/problems/conversation-not-found` | No conversation has this identifier. |
| 400 | `/problems/request-validation` | An empty identifier. |
| 500 | `about:blank` | A server fault. |

## Error responses

Every error response of the backend is a Problem Details object ([RFC 9457](https://www.rfc-editor.org/rfc/rfc9457)) with `Content-Type: application/problem+json`:

```json
{ "type": "/problems/conversation-not-found", "title": "Conversation not found", "status": 404 }
```

| Member | Meaning |
|---|---|
| `type` | The only value a program reads to tell problems apart. Either `about:blank`, when the status says everything, or a relative reference `/problems/<name>`. The references are identifiers: the backend does not serve a page at those addresses. |
| `title` | A short English text, always the same for the same `type`. |
| `status` | The HTTP status of the response. |
| `detail` | Optional. A short English text for people. |
| `errors` | Only in `/problems/request-validation`. |

The texts are always in English, whatever `AMBROGIO_LANGUAGE` says. Clients choose their own text from `type`. A response has no other members.

### Problem types

| `type` | Status | `title` | Meaning |
|---|---|---|---|
| `/problems/conversation-not-found` | 404 | `Conversation not found` | The conversation does not exist. |
| `/problems/invalid-pagination` | 400 | `Invalid pagination request` | The `cursor` or `limit` of the list is not acceptable. `detail`: "The cursor or the limit is not valid." |
| `/problems/request-validation` | 400 | `Request validation failed` | The request does not match the parameters of the endpoint. |
| `/problems/malformed-json` | 400 | `Malformed JSON` | A body declared as JSON is empty or not valid JSON. `detail`: "The request body is not valid JSON." |
| `/problems/origin-not-allowed` | 403 | `Origin not allowed` | A browser opened the [conversation session](../conversation-protocol/) from an origin not listed in `AMBROGIO_ALLOWED_ORIGINS`. |
| `/problems/unsupported-subprotocol` | 400 | `Unsupported subprotocol` | A session opening did not offer the `ambrogio.v1` subprotocol. |
| `about:blank` | 404 | `Not Found` | No endpoint has this path and method. |
| `about:blank` | 405 | `Method Not Allowed` | `POST`, `PUT`, `PATCH` or `DELETE` on a `v1` endpoint. The `Allow` header lists `GET, HEAD`. |
| `about:blank` | 413 | `Content Too Large` | The request body is too large. |
| `about:blank` | 415 | `Unsupported Media Type` | The request body has a content type the backend does not read. |
| `about:blank` | 500 | `Internal Server Error` | A server fault. The response has nothing else; the backend log has an `http.unexpected_failure` event with the same `correlationId`. |

No endpoint accepts a body today: the backend reads a body before it chooses the endpoint, so a body sent to an endpoint can produce 400, 413 or 415 instead of 405.

`errors` is a list of violations. Each one has:

| Member | Meaning |
|---|---|
| `location` | `query`, `path`, `header` or `body`. |
| `pointer` | A JSON Pointer to the value inside that part, such as `/limit`. |
| `code` | `unknown-field` for a parameter the endpoint does not have, `invalid-value` for any other violation. |
| `detail` | "The field is not allowed." or "The value is not valid." |

## Browsers

Only `GET` is allowed across origins, and only for origins listed in `AMBROGIO_ALLOWED_ORIGINS`. See [Backend configuration](../backend-configuration/#http-listener).

## Memory MCP server `/mcp/memory`

The backend also serves an [MCP](https://modelcontextprotocol.io/) server over Streamable HTTP at `/mcp/memory`, from backend `v0.17.0`, for the Memory agent. It is outside `/api/` and not part of HTTP API `v1`. See [Search past conversations](../../how-to/search-past-conversations/).

| Item | Value |
|---|---|
| Tool | `search_conversations` |
| What it searches | The question and the answer of every answered turn, in all conversations. Failed, interrupted and pending turns are not searched. A turn can be found as soon as it ends. |
| Matching | The words of the query in any form of the language set by `AMBROGIO_LANGUAGE`: *dentista* also finds *dentisti*. A word written without its accent, or a synonym, is not found. |
| Authentication | None. |
| Requests with an `Origin` header | Refused, so a web page cannot use the server through a browser. |
| Search failure | The agent receives `Conversation search failed`; the log has `conversation_memory_search_failed`. |
