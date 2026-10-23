---
title: HTTP API
description: The read-only HTTP endpoints that list conversations and return their history.
sidebar:
  label: HTTP API
---

Two `GET` endpoints let a client browse stored conversations. New turns are not sent over HTTP: they go through the [conversation protocol](../conversation-protocol/).

There is no authentication. Every response carries an `X-Request-Id` header; the same value appears as `correlationId` in the backend log. Responses that contain conversation data, including errors, carry `Cache-Control: no-store`.

## `GET /api/conversations`

Lists conversations, most recently active first. Activity means the time the latest turn was accepted.

| Query parameter | Meaning |
|---|---|
| `limit` | Optional. Page size, from 1 to `maxListPageSize`. Defaults to `listPageSize` from [`conversations.ts`](../backend-configuration/#conversationsts). |
| `cursor` | Optional. The `nextCursor` value from the previous page. Treat it as opaque. |

Any other parameter is an error.

**200**

```json
{
  "items": [
    { "id": "6f1c…", "lastActivityAt": "2026-10-17T18:42:10.512Z" }
  ],
  "nextCursor": "eyJpZCI6…"
}
```

`nextCursor` is `null` on the last page. If conversations change while you page through, start again without `cursor`.

**400** `{ "error": "Invalid pagination request." }` for a bad `cursor` or `limit` or an unknown parameter.
**500** `{ "error": "I can't complete the response." }` on a server fault.

## `GET /api/conversations/{conversationId}`

Returns one conversation with every turn, oldest first. This is a snapshot: it does not stream and does not include partial answers.

**200**

```json
{
  "id": "6f1c…",
  "createdAt": "2026-10-17T18:40:02.001Z",
  "lastActivityAt": "2026-10-17T18:42:10.512Z",
  "turns": [
    {
      "id": "a93e…",
      "text": "Mi consigli un libro?",
      "acceptedAt": "2026-10-17T18:40:02.001Z",
      "status": "answered",
      "answer": "Ti propongo …",
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

**404** `{ "error": "Conversation not found." }`
**500** `{ "error": "I can't complete the response." }`

## Language

Error messages follow `language` in `conversations.ts`. Both languages are listed in [Messages](../messages/).

## Browsers

Only `GET` is allowed across origins, and only for origins listed in `allowedOrigins`. See [Backend configuration](../backend-configuration/#httpts).
