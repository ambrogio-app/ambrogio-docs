---
title: Conversation protocol (ambrogio.v1)
description: Summary of the WebSocket protocol that every Ambrogio client uses to send turns and receive answers.
sidebar:
  label: Conversation protocol
---

Text and voice clients use the same protocol, `ambrogio.v1`, over a WebSocket. This page summarises it for people who write their own client or debug a connection. The machine-readable definition is [`protocol/ambrogio-v1.schema.json`](https://github.com/ambrogio-app/ambrogio-backend/blob/main/protocol/ambrogio-v1.schema.json) (JSON Schema 2020-12) in the backend repository. Messages are closed objects: unknown fields are rejected.

## Connection

| Item | Value |
|---|---|
| Path | `/api/session`, on the same port as HTTP |
| Subprotocol | `ambrogio.v1` (required; otherwise `400` with the Problem Details `/problems/unsupported-subprotocol`) |
| `Origin` header | Absent, or listed in `AMBROGIO_ALLOWED_ORIGINS` (otherwise `403` with the Problem Details `/problems/origin-not-allowed`; see [HTTP API](../http-api/#problem-types)) |
| Keep-alive | The server pings every 30 seconds and closes a session that does not answer by the next ping. |

One session carries turns for many conversations. Several sessions with the same `clientId` are independent.

## Frames

- **Text frames** carry one JSON message with a string `type`.
- **Binary frames** carry audio: 4 bytes with the stream number (unsigned 32-bit, big-endian), then PCM samples, 16-bit little-endian, mono.

## Opening

| Direction | Message | Fields |
|---|---|---|
| client → server | `session.hello` | `clientId`, `name` (non-empty strings) |
| server → client | `session.ready` | `protocol: "ambrogio.v1"` |

Nothing else is accepted before `session.ready`. A second `session.hello` is an error.

## Sending a turn

| Message | Fields |
|---|---|
| `input.start` | `requestId` (unique among open requests), `stream` (positive integer, unique among the client's open streams), `content`, `reply`, optional `conversationId` |
| `input.chunk` | `requestId`, `text` (text content only; chunks are concatenated) |
| *binary frames* | audio content only, PCM16 mono at 16 kHz |
| `input.end` | `requestId` |

- `content` is `{"type":"text"}` or `{"type":"audio","sampleRate":16000}`.
- `reply` is `"text"` or `"audio"`: the form in which the client wants everything the server sends for this turn.
- Leave out `conversationId` to start a new conversation.
- A session can have one incoming audio stream open at a time.

The server processes the turn after `input.end`, except that it refuses at once when a limit is exceeded. The request does not include earlier messages; the server reads the history itself.

## Receiving the answer

After `input.end` the server sends either `turn.accepted` or a refusal.

| Message | Fields |
|---|---|
| `turn.accepted` | `requestId`, `conversationId`, `turnId`, `text` (the stored text, or the transcription) |
| `output.start` | `requestId`, `turnId` (if accepted), `stream`, `content` |
| `output.chunk` | `stream`, `text` (only the new fragment) |
| *binary frames* | audio at the sample rate given in `output.start` |
| `output.end` | `stream` |

The answer streams while it is being generated. Every message meant for the family, including refusals and errors, comes as an `output.start` … `output.end` stream in the form asked for with `reply`. The one exception is `audio_unavailable`, always sent as text. If an error happens mid-answer, the current stream is closed and a new one carries the error message.

## Outcomes

Every turn ends with exactly one of these, after its last stream:

| Message | Fields | Meaning |
|---|---|---|
| `turn.completed` | `turnId`, `expectsReply` | Answered and saved. `expectsReply` is `true` when the answer asks the family something. |
| `turn.failed` | `turnId`, `message` | Failed after being accepted. |
| `turn.interrupted` | `turnId` | The server stopped before finishing. |
| `turn.rejected` | `requestId`, `reason`, `message` | Not accepted. Nothing is stored. |

`reason` values are listed in [Messages](../messages/#refusal-reasons). Only `turn.completed` means the outcome is saved. If the session closes after `turn.accepted`, the server still finishes and saves the turn; read the result from the [HTTP API](../http-api/).

## Protocol errors

`session.error` with `code`, `message` and, when known, `requestId`. The session stays open.

| `code` | Cause |
|---|---|
| `invalid_message` | The message does not match the schema. |
| `unknown_type` | Unknown `type`. |
| `unknown_stream` | Unknown or closed request or stream, or binary data for no open stream. |
| `session_not_ready` | Sent before `session.ready`. |
| `audio_busy` | A second incoming audio stream while one is open. |

## Server requests

Future revisions may add server messages outside turns. If such a message has an `id`, the client must answer `client.result` with the same `id` and either `ok: true`, or `ok: false` with `reason: "unsupported"`. Messages without `id` can be ignored. Version 1 defines none yet.
