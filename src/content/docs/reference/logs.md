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

As an extra safeguard, the value of any field whose name contains `token`, `password`, `passwd`, `secret`, `authorization`, `cookie`, `credential`, `apikey`, `api_key` or `api-key` (case-insensitive, at any depth, for example `MISTRAL_API_KEY`) is written as `[redacted]`.

So the logs tell you *that* something failed and where, not what was said.

## The `err` field

Events about a failure carry an `err` object. For an error raised by Ambrogio itself it has `type`, `message` and `stack`, and `message` names what failed, such as `HTTP listener could not start`. When several independent failures happened, for example two resources that could not be closed, `type` is `LifecycleError` and `faults` lists each of them in the order they happened. Any other error becomes `{"type":"Error","message":"Unexpected backend failure","stack":"[redacted]"}` in the backend and the same with `Unexpected satellite failure` in the satellite.

## Fatal errors

An error that escapes every check stops the program at once. It writes only `Ambrogio backend stopped after a fatal error.` or `Ambrogio satellite stopped after a fatal error.` to standard error, with no JSON line, and exits with code `1`. Such an error is a bug: report it with the version you run.

## Backend

The backend logs from level `info`: the timing of each answered voice turn, warnings and errors. It does not log ordinary requests.

| Event | Meaning |
|---|---|
| `conversation_voice_turn_timing` | Level `info`. A turn with spoken input was answered. `audioMs` is the length of the audio received for the request. The other durations, in milliseconds, are counted from the moment the backend received `input.end`: `transcriptionMs` until the transcription was complete, `firstTextMs` until the agents produced the first piece of the answer, `firstAudioMs` until the first audio of the spoken answer was sent (only when the answer is spoken), and `completedMs` until the turn was completed. Text turns and rejected, failed or interrupted turns write no line. |
| `conversation_reply_timing` | Level `info`. The answer to a turn was produced. `agent` is the chosen agent; `routerMs` the time the orchestrator took to choose it; `agentMs` the time the agent took; `modelSteps` the calls the agent made to its model, including the second generation after an answer without words; `replyCheckMs`, only for an answer with a question mark, the time the orchestrator's model took to decide whether it expects a reply. For an agent with tools, `toolCalls` and `toolMs` are the MCP tool calls and the time spent in them,. The line has no `correlationId`: match it to `conversation_voice_turn_timing` by its time. A failed answer writes no line. |
| `server_startup_failed` | The backend could not start. See below. |
| `http.unexpected_failure` | An HTTP request failed with a server error, including a failed read of the conversation list or of a conversation through HTTP API `v1`. |
| `conversation_turn_admission_failed` | A turn could not be stored when it arrived. |
| `conversation_reply_check_failed` | Level `warn`. Deciding whether an answer with a question expects a reply failed; a question mark at the end of the answer decided instead. `err` has the type and message of the failure, without conversation texts. |
| `conversation_reply_failed` | Producing an answer failed: model error, 30-second limit, tool limit, invalid agent choice, or a chosen agent whose MCP server is unavailable (cause `Agent unavailable: <id>`). |
| `conversation_turn_completion_failed` | The outcome of a turn could not be stored. |
| `conversation_archive_connection_failed` | An idle connection to the database of the archive failed, for example because PostgreSQL restarted. The message is `Conversation archive connection failed`. The backend keeps running and opens new connections when it needs them; an operation that fails because the database does not answer is reported by its own event. |
| `agent_mcp_unavailable` | Level `error`. The single connection attempt to the MCP server of an agent failed, after the backend started listening. `agent` is the agent; `reason` is `connection_failed` when the connection or the list of tools or prompts failed, or `tool_unavailable` when a name of `mcp.tools` is not among the server's tools, named in `tool`. The message is `Agent MCP unavailable`. The agent stays unavailable until the backend restarts; the other agents keep working. See [Troubleshooting](../../how-to/troubleshoot/#an-agent-with-an-mcp-server-does-not-work). |
| `conversation_memory_search_failed` | Level `error`. A search of the Memory agent in the past conversations failed in the archive; the agent receives `Conversation search failed`. The words searched are not logged. |
| `conversation_session_delivery_failed` | A message could not be delivered to a client. |
| `conversation_speech_synthesis_failed` | Speech synthesis failed. |
| `server_shutdown_failed` | After `SIGTERM` or `SIGINT`, a resource could not be closed. `err` names it. The backend exits with code `1`. |
| `server_shutdown_timeout` | After `SIGTERM` or `SIGINT`, the shutdown did not finish within `timeoutMs` (10000) milliseconds. `err` lists the failures seen so far, if any. The backend exits with code `1`. |

Each request and session event carries a `correlationId`. For HTTP requests it equals the `X-Request-Id` response header. For a WebSocket session it is the same for every event of that session, so you can follow one client's activity.

If the backend cannot start, it writes one `server_startup_failed` event (level `error`) whose `err.message` names the problem, prints `Unable to start HTTP server.` to standard error and exits with code `1`. Messages of failures that come from outside Ambrogio are replaced by the name of the startup step. [Troubleshooting](../../how-to/troubleshoot/#the-backend-does-not-start) lists the messages.

## Satellite

| Event | Level | Meaning |
|---|---|---|
| `satellite_ready` | info | Started and listening for the wake word. |
| `satellite_wake_detected` | info | The wake word was detected and the speech detector confirmed speech in the 1.5 seconds that end with the detection. The line has only `level`, `time` and `event`. A detection ignored because it came less than 2 seconds after the previous one is not logged. |
| `satellite_wake_rejected` | info | The keyword spotter detected the wake word, but the speech detector heard no speech in the 1.5 seconds that end with the detection, so the detection was discarded. The line has only `level`, `time` and `event`. |
| `satellite_request_timing` | info | The reply to a request was played to the end. Durations in milliseconds: `speechMs` from the moment the speech detector confirmed your speech until the satellite sent `input.end`, `firstAudioMs` from `input.end` until the first audio of the reply arrived (only when the reply had audio), and `playedMs` from `input.end` until the reply finished playing. The satellite sends `input.end` once the speech detector has heard 0.64 seconds of silence, or when the request reaches 60 seconds. A request abandoned or ended by a failure writes no line. |
| `satellite_session_unavailable` | info | The session to the backend could not be opened at startup. The satellite tries again at the next wake word. |
| `invalid_arguments` | info | The command line has arguments; the satellite takes none. The satellite exits. |
| `invalid_configuration` | info | The configuration was refused and the satellite exits with code `2`. `variable` names the environment variable and `condition` is `missing` (unset or empty) or `invalid` (a value the satellite does not accept, such as a wake word that the keyword spotting model's vocabulary cannot represent). Values are never logged. |
| `satellite_voice_unavailable` | info | The backend answered a voice turn in text, because voice is disabled. The satellite plays the error tone instead and goes back to the wake word. |
| `satellite_failure` | error | An interaction failed. The satellite plays the error tone and goes back to the wake word. |
| `satellite_error_tone_failed` | error | The error tone could not be played. The satellite goes back to the wake word anyway. |
| `satellite_ready_cue_failed` | error | The beep could not be played. The satellite listens anyway. |
| `satellite_attenuation_failed` | warn | The [attenuation](../satellite-configuration/#attenuation-of-other-audio) control could not be set. `operation` is `attenuate` or `restore`; `reason` is `exit_code` (`amixer` failed), `timeout` (no answer within 2 seconds) or `spawn_failed` (`amixer` could not be started). The interaction or the wait for the wake word continues. |
| `satellite_startup_failed` | error | The satellite could not start. `err.message` names the step: `Wake word model could not be loaded`, `Voice activity model could not be loaded` or `Microphone could not be started`. The satellite also prints `Unable to start Ambrogio satellite.` to standard error and exits with code `1`. |
| `satellite_process_failed` | error | After `SIGINT` or `SIGTERM`, a resource could not be released. `err` names it. The satellite exits with code `1`. |
| `satellite_shutdown_timeout` | error | After `SIGINT` or `SIGTERM`, the orderly shutdown did not finish within `timeoutMs` (5000) milliseconds, for example because an audio device did not close. `err` lists the failures seen so far, if any. The satellite exits with code `1`. A second signal does not restart the wait. |

The speech library of the satellite, sherpa-onnx, can write its own lines to standard error. They are not JSON and start with the path of one of its source files, such as `/shared/sherpa-onnx/`. They are not events of the satellite.
