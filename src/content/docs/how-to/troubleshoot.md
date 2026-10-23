---
title: Troubleshooting
description: Find out why the backend does not start, a client cannot connect, or a satellite stays silent.
sidebar:
  label: Troubleshooting
---

Start with the logs. The backend and the satellite both write one JSON object per line to standard output. With Docker, read them with `docker logs <container>`. [Logs](../../reference/logs/) lists the events.

## The backend does not start

When the backend refuses to start, it writes `Unable to start HTTP server.` to standard error and, just before it, one JSON line on standard output that says why:

```bash
docker logs ambrogio 2>&1 | grep server_startup_failed
```

```
{"level":50,...,"event":"server_startup_failed","err":{"type":"ProjectError","message":"Invalid agent configuration: general",...},"msg":"Server startup failed"}
```

Look at `err.message` and find it in this table.

| `err.message` | What to check |
|---|---|
| `Missing HTTP configuration path`, `Missing conversation configuration path` | `AMBROGIO_HTTP_CONFIG_PATH` or `AMBROGIO_CONVERSATIONS_CONFIG_PATH` is not set. In Docker, `docker inspect ambrogio` shows the variables. |
| `Invalid HTTP configuration file`, `Invalid conversation configuration file`, `Invalid voice configuration file` | The file does not exist at that path (in Docker: inside the container), cannot be read, cannot be imported, or does not export a valid object. For voice, `languages` may contain only `it` and `en`; the active language needs a profile. Each profile requires `voiceEngine`; `voiceSpeaker` (a whole number) and `voiceLanguage` are required with `kokoro` and not allowed with `piper`. |
| `Invalid HTTP listener configuration` | `host` or `port` in `http.ts`. |
| `Invalid HTTP CORS origins` | An entry in `allowedOrigins` has a path, a trailing slash or `*`. |
| `Invalid public HTTPS configuration`, `Invalid HSTS duration` | `publicHttps` must be a boolean; with `true`, set `hstsMaxAgeSeconds` to a positive whole number. |
| `Invalid conversation list limits`, `Invalid conversation language`, `Invalid conversation archive path`, `Missing conversation archive path` | The named field in `conversations.ts`. |
| `Invalid conversation time zone` | `timeZone` in `conversations.ts` is not an IANA time zone name such as `Europe/Rome`. Remove it to use UTC. |
| `Conversation archive could not be prepared` | The folder of `archivePath` does not exist or is not writable, or the database could not be updated. |
| `Invalid voice configuration path` | `AMBROGIO_VOICE_CONFIG_PATH` is set but empty. Remove it to run without voice. |
| `Voice resources are unavailable` | `voskModelPath` is not a readable folder, or `voiceModelDir` lacks the files of its engine: with `piper` exactly one `.onnx` file, `tokens.txt` and `espeak-ng-data/`; with `kokoro` exactly one `.onnx` file, `voices.bin`, `tokens.txt` and `espeak-ng-data/`. |
| `Voice speaker is not in the model` | `voiceSpeaker` is not lower than the number of voices of the Kokoro model. See [Voices of `kokoro-multi-lang-v1_0`](../../reference/backend-configuration/#voices-of-kokoro-multi-lang-v1_0). |
| `Voice components could not be loaded` | The files are there but a model failed to load. Download it again. |
| `Agent configuration directory unavailable` | `/etc/ambrogio/agents` does not exist. In Docker, check that the configuration folder is mounted at `/etc/ambrogio`. |
| `Missing orchestrator configuration` | There is no `orchestrator.ts`. |
| `No specialist agent configured` | There is no agent file besides `orchestrator.ts`. |
| `Invalid agent configuration filename: <file>` | The name must be lowercase letters, digits and hyphens, starting with a letter. |
| `Invalid agent configuration: <id>` | That agent's file. Common mistakes: a module that cannot be imported, `description` missing (or present in `orchestrator.ts`), `maxToolCalls` missing with `mcp` or present without it, `provider` not among `mistral`, `openai`, `anthropic`, `google` and `openai-compatible`, `baseURL` missing or not an `http(s)://` address with `openai-compatible` or present with another provider, an `mcp.url` that is not `http(s)://`, an `mcp.tools` that is empty, not an array or with a repeated name. |
| `Invalid agent options: <id>` | `llm.options` may contain only `temperature` (0 or more) and `max_tokens` (1 or more). |
| `Agent MCP connection failed: <id>` | The backend could not connect to that agent's MCP server or list its tools. Test `mcp.url` from the backend host (in Docker, `localhost` is the container), and check the token or OAuth settings. |
| `Agent MCP tool unavailable: <id>` | A name in that agent's `mcp.tools` is not among the tools of its MCP server. Names are case-sensitive and must be written as the server declares them. |
| `HTTP listener could not start` | The port is already in use, or `host` is not an address of this machine. |

For errors that come from outside Ambrogio (a library, the network, the operating system), the line shows only the step that failed, not the original message, so no secret can end up in the log.

[Backend configuration](../../reference/backend-configuration/) and [Agent configuration](../../reference/agent-configuration/) list every rule.

## The terminal client cannot connect

- Check the address from the same computer: `curl http://ambrogio.home.lan:3000/api/conversations`.
- The client refuses addresses with a user name, password, query string or `#fragment`.
- If the list loads but sending a message fails, the WebSocket on `/api/session` is being blocked. Behind a proxy, check that it forwards upgrades; see [Put the backend behind HTTPS](../reverse-proxy-https/).
- A backend built from a commit older than the `ambrogio.v1` protocol cannot hold a session with the current client. Use a release, or a commit from `58b0df4` onwards; see [Versions and compatibility](../../reference/versions/).

## The terminal says to enlarge the window

The client needs at least 70 columns and 14 rows. Make the window bigger; your conversation is kept.

## A turn shows "In progress"

The backend accepted the turn and has not saved an outcome yet. Press `Ctrl+R` later to refresh. If it never changes, the backend probably stopped while answering; after the next restart the turn shows as interrupted.

## Every answer is "I can't complete the response."

This is the standard message for a turn that failed after it was accepted. Common causes:

- the provider's API key is wrong, out of credit, or rate-limited;
- the model does not support tool calling or structured JSON output, or not both in the same request for an agent with `mcp`; see [Providers](../../reference/agent-configuration/#providers);
- the answer took longer than 30 seconds;
- an agent with tools needed more than its `maxToolCalls`;
- the orchestrator chose no valid agent.

The backend log has a `conversation_reply_failed` event for each of these.

## The satellite exits with `invalid_configuration`

The satellite checks its whole file before it starts and stops at the first problem. The log line says what it found:

```
{"level":"info","time":...,"event":"invalid_configuration","reason":"invalid_configuration","field":"wakeWord.model"}
```

- `"reason":"configuration_unavailable"`: the file does not exist or cannot be read. Check the path after `--config`, or the mount at `/config/satellite.ts` in Docker.
- `"field":"config"`: the module does not export a valid object, or it has a section the satellite does not know. A misspelt section, such as `wakeword` instead of `wakeWord`, ends up here.
- Any other `field`: that field is wrong. [Satellite configuration](../../reference/satellite-configuration/) lists the rules for each one. The usual suspects are a `baseUrl` with spaces or a query string, a `wakeWord.model` that is not in the models folder, a `threshold` outside 0–1, a `patience` that is not a whole number from 1 to 10, a `replyTimeoutMs` that is not a whole number, and audio selectors with spaces around them.

`invalid_arguments` means the command line was wrong: it must be exactly `--config <file>`.

## The satellite plays two descending tones

The satellite plays this error tone in two cases. Its log tells you which:

- `satellite_failure`: the interaction failed on the satellite's side. The backend cannot be reached, the session dropped during the turn, or no outcome arrived within 60 seconds. Check the address and the network from the device, then the backend logs. The satellite keeps running and tries again at the next wake word.
- `satellite_voice_unavailable`: the backend is running without voice and answered in text. [Enable voice](../enable-voice/) on the backend.

## The satellite never reacts to the wake word

- Check that the microphone works: `arecord -d 5 test.wav && aplay test.wav`.
- Make sure the satellite uses the right microphone; see [Choose audio devices](../choose-audio-devices/).
- With the `alexa` model, say only "Alexa".
- Lower `wakeWord.threshold` a little, for example to `0.4`.
- Lower `wakeWord.patience` to `1`.

## The satellite wakes up by itself

Every wake-up writes a `satellite_wake_detected` line with its `score` and `chunks`. Compare the lines of the false wake-ups with those of your real requests to choose the values below.

- If a cough, a clap or another short sound wakes it up, raise `wakeWord.patience`, for example to `3`.
- Otherwise raise `wakeWord.threshold` a little, for example to `0.6`.
- Move the device away from the TV.

## No beep after the wake word

The satellite plays the beep once the backend session is ready. If the speaker cannot play it, the log shows `satellite_ready_cue_failed` and the satellite listens anyway. Check the speaker selector.

## My question is cut short

The satellite decides you have finished after about two-thirds of a second of silence. Speak without long pauses. A request may last at most 60 seconds.
