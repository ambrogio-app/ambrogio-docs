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
| Conversations per list page | `listPageSize` (20), at most `maxListPageSize` (100) | yes | See [`conversations.json`](../backend-configuration/#conversationsjson). |
| Speech synthesis threads | 4, or fewer if the CPU has fewer | no | |

Turns are never queued and never retried automatically.

## Satellite

| Setting | Value | Configurable |
|---|---|---|
| Wake word threshold | 0.5 | `wakeWord.threshold` |
| Consecutive blocks above the threshold | 2 blocks of 80 ms | `wakeWord.patience` |
| Pause between wake-ups | 2 seconds | no |
| Audio kept from before you start speaking | 1.5 seconds | no |
| Speech detection window | 32 ms (512 samples at 16 kHz) | no |
| Speech probability that counts as speech | 0.18 or higher | no |
| Speech probability that counts as silence | below 0.11 | no |
| Speech needed to start a request | 4 windows (about 130 ms) | no |
| Silence that ends a request | 20 windows (about 640 ms) | no |
| Wait for an outcome after you stop speaking | 60 seconds | no |
| Wait for a follow-up reply | 15 seconds, restarted after each answer | `interaction.replyTimeoutMs` |

The satellite does not listen while it is speaking: you cannot interrupt an answer.

## Terminal client

| Limit | Value |
|---|---|
| Minimum terminal size | 70 × 14 characters |
| Largest message | 64 KiB in UTF-8, checked before sending |
