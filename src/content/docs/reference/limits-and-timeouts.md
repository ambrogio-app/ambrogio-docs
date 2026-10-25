---
title: Limits and timeouts
description: Fixed sizes, durations and thresholds built into Ambrogio, and the few that you can configure.
sidebar:
  label: Limits and timeouts
---

## Backend

| Limit | Value | Configurable | Effect when reached |
|---|---|---|---|
| Text of one turn | 64 KiB (65 536 bytes, UTF-8) | no | Refused with `too_large`. |
| Audio of one turn | 60 seconds | no | Refused with `too_large`. |
| Time to produce an answer | 30 seconds, from the start of the agent choice to the end of the answer, tool calls included | no | Turn fails with the standard message. |
| Tool calls per turn | `maxToolCalls` | per agent | Turn fails with the standard message. |
| Turns per conversation at a time | 1 | no | Further turns on that conversation are refused with `occupied`. Turns on other conversations run in parallel. |
| Incoming audio streams per session | 1 | no | `session.error` with `audio_busy`. |
| Model request retries | 0 | no | A model error fails the turn. |
| Session ping interval | 30 seconds | no | A session that does not answer by the next ping is closed. |
| Shutdown after `SIGTERM` or `SIGINT` | 10 seconds | no | The backend logs `server_shutdown_timeout` and exits with code `1`. Give the container at least 15 seconds to stop. |
| Conversations per list page | `AMBROGIO_LIST_PAGE_SIZE` (20), at most `AMBROGIO_MAX_LIST_PAGE_SIZE` (100) | yes | See [Backend configuration](../backend-configuration/#conversations). |
| Speech synthesis threads | 4, or fewer if the CPU has fewer | no | |
| Speech recognition threads | 2, or fewer if the CPU has fewer | no | |
| Audio decoded by Whisper at a time | windows of at most 30 seconds | no | The request is split into windows and the texts are joined with a space. A word spoken across a window boundary is split between the two. |

Speech recognition runs when the client ends the request with `input.end`, so each voice turn includes the time Whisper needs to decode the whole request. There is one recognizer: requests that end at the same time are decoded one after another, in the order they ended.

Turns are never queued and never retried automatically.

## Satellite

| Setting | Value | Configurable |
|---|---|---|
| Wake word threshold | 0.25 | `AMBROGIO_WAKE_WORD_THRESHOLD` |
| Length of the wake word | 64 characters | no |
| Speech needed around a wake word | some speech in the 1.5 seconds that end with the detection; otherwise the detection is discarded | no |
| Pause between wake-ups | 2 seconds | no |
| Audio kept from before you start speaking | 1.5 seconds | no |
| Speech detection window | 32 ms (512 samples at 16 kHz) | no |
| Speech probability that counts as speech | above 0.26 | no |
| Speech probability that counts as silence | 0.11 or lower | no |
| Speech needed to start a request | 128 ms | no |
| Silence that ends a request | 640 ms | no |
| Continuous speech before the request is closed at the next short pause | 55 seconds | no |
| Wait for an outcome after you stop speaking | 60 seconds | no |
| Wait for a follow-up reply | 15 seconds, restarted after each answer | `AMBROGIO_REPLY_TIMEOUT_MS` |
| Level of other local audio during an interaction | set per installation, 100% otherwise | `AMBROGIO_ATTENUATION_LEVEL` |
| Time allowed for each `amixer` call | 2 seconds | no |
| Shutdown after `SIGTERM` or `SIGINT` | 5 seconds | no |

The satellite does not listen while it is speaking: you cannot interrupt an answer.

## Terminal client

| Limit | Value |
|---|---|
| Minimum terminal size | 70 × 14 characters |
| Largest message | 64 KiB in UTF-8, checked before sending |
