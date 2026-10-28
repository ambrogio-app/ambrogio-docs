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
| Second generation after an answer without words | 1 | no | The agent is asked once more to write its answer, without tools. If that is empty too, the turn fails with the standard message. |
| Turns the models receive | `AMBROGIO_HISTORY_TURNS` (20), the new turn included | yes | Earlier turns stay stored and visible in the clients, but the orchestrator and the agents do not see them. |
| Session ping interval | 30 seconds | no | A session that does not answer by the next ping is closed. |
| Shutdown after `SIGTERM` or `SIGINT` | 10 seconds | no | The backend logs `server_shutdown_timeout` and exits with code `1`. Give the container at least 15 seconds to stop. |
| Conversations per list page | `AMBROGIO_LIST_PAGE_SIZE` (20), at most `AMBROGIO_MAX_LIST_PAGE_SIZE` (100) | yes | See [Backend configuration](../backend-configuration/#conversations). |
| Speech synthesis threads | 4, or fewer if the CPU has fewer | no | |
| Speech recognition threads | 2, or fewer if the CPU has fewer | no | |
| Silence added at the start of a voice request | 1 second | no | Keeps the first word, which the bundled model loses when speech starts at once. |
| Silence added at the end of a voice request | 0.8 seconds | no | Lets the recognizer finish the last words before the transcription is returned. |

Speech recognition runs while the request is open: each audio frame goes to the recognizer as it arrives, and at `input.end` only the last part remains to decode. The recognizer runs in one worker thread shared by all voice requests, which processes frames in the order they arrive. If the CPU cannot keep up with the audio, frames wait and the text arrives later; no audio is lost. Real-time recognition needs an x86_64 CPU with AVX2; see [Before you install](../requirements/#backend). If the worker stops because of a fault, the transcriptions in progress fail, their turns are refused with `transcription_failed` ("I didn't understand the request."), and the next voice request starts a new worker.

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
