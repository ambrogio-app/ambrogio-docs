---
title: Logs
description: What the backend and the satellite write to their logs, and what they never write.
sidebar:
  label: Logs
---

Both the backend and the satellite write logs to standard output, one JSON object per line, using [Pino](https://getpino.io/). Where the lines end up (Docker's log driver, journald, a file) depends on how you run them. Neither program rotates or ships logs by itself.

## What is never logged

- The text of conversations and the answers.
- Audio.
- API keys, tokens and other configuration values.
- Details of errors raised by third-party libraries or services: these are replaced by a fixed description.

So the logs tell you *that* something failed and where, not what was said.

## Backend

The backend logs warnings and errors only. It does not log ordinary requests.

| Event | Meaning |
|---|---|
| `server_startup_failed` | The backend could not start. See below. |
| `http.unexpected_failure` | An HTTP request failed with a server error. |
| `conversation_list_http_failed` | Reading the conversation list failed. |
| `conversation_history_http_failed` | Reading a conversation failed. |
| `conversation_turn_admission_failed` | A turn could not be stored when it arrived. |
| `conversation_reply_failed` | Producing an answer failed: model error, 30-second limit, tool limit or invalid agent choice. |
| `conversation_turn_completion_failed` | The outcome of a turn could not be stored. |
| `conversation_session_delivery_failed` | A message could not be delivered to a client. |
| `conversation_speech_synthesis_failed` | Speech synthesis failed. |

Each event carries a `correlationId`. For HTTP requests it equals the `X-Request-Id` response header. For a WebSocket session it is the same for every event of that session, so you can follow one client's activity.

If the backend cannot start, it writes one `server_startup_failed` event (level `error`) whose `err.message` names the problem, prints `Unable to start HTTP server.` to standard error and exits with code `1`. Messages of failures that come from outside Ambrogio are replaced by the name of the startup step. [Troubleshooting](../../how-to/troubleshoot/#the-backend-does-not-start) lists the messages.

## Satellite

| Event | Level | Meaning |
|---|---|---|
| `satellite_ready` | info | Started and listening for the wake word. |
| `satellite_wake_detected` | info | The wake word was detected. `score` is the classifier score of the block that confirmed it, rounded to three decimals; `chunks` is the number of consecutive 80 ms blocks that reached the threshold (`AMBROGIO_WAKE_WORD_THRESHOLD`). A detection ignored because it came too soon after the previous one is not logged. |
| `satellite_session_unavailable` | info | The session to the backend could not be opened at startup. The satellite tries again at the next wake word. |
| `invalid_arguments` | info | The command line has arguments; the satellite takes none. The satellite exits. |
| `invalid_configuration` | info | The configuration was refused and the satellite exits with code `2`. `variable` names the environment variable and `condition` is `missing` (unset or empty) or `invalid` (a value the satellite does not accept, such as a wake word model that is not in the models folder). Values are never logged. |
| `satellite_voice_unavailable` | info | The backend answered a voice turn in text, because voice is disabled. The satellite plays the error tone instead and goes back to the wake word. |
| `satellite_failure` | error | An interaction failed. The satellite plays the error tone and goes back to the wake word. |
| `satellite_error_tone_failed` | error | The error tone could not be played. The satellite goes back to the wake word anyway. |
| `satellite_ready_cue_failed` | error | The beep could not be played. The satellite listens anyway. |
| `satellite_attenuation_failed` | warn | The [attenuation](../satellite-configuration/#attenuation-of-other-audio) control could not be set. `operation` is `attenuate` or `restore`; `reason` is `exit_code` (`amixer` failed), `timeout` (no answer within 2 seconds) or `spawn_failed` (`amixer` could not be started). The interaction or the wait for the wake word continues. |
| `satellite_process_failed` | error | The satellite failed to start or stopped because of an error. It exits with code `1`. |
| `satellite_shutdown_timeout` | error | After `SIGINT` or `SIGTERM`, the orderly shutdown did not finish within `timeoutMs` (5000) milliseconds, for example because an audio device did not close. The satellite exits with code `1`. A second signal does not restart the wait. |
