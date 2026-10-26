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
| `Missing environment variable <NAME>` | A required variable is not set, or is set to an empty string. In production `AMBROGIO_ENV`, `AMBROGIO_HTTP_HOST`, `AMBROGIO_HTTP_PORT`, `AMBROGIO_PUBLIC_HTTPS` and `AMBROGIO_ARCHIVE_PATH` are required; with voice, each listed language needs its profile variables. In Docker, `docker inspect ambrogio` shows the variables of the container. |
| `Invalid environment variable <NAME>: <condition>` | The variable has a value the backend does not accept; the condition says what it expects. Common cases: `AMBROGIO_ENV` other than `development`, `test` or `production`; a port outside 1–65535; `AMBROGIO_PUBLIC_HTTPS` other than `true` or `false`; `AMBROGIO_HSTS_MAX_AGE_SECONDS` missing with `AMBROGIO_PUBLIC_HTTPS=true`; an origin with a path, a trailing slash or `*`; `AMBROGIO_LANGUAGE` other than `en` or `it`; a time zone that is not an IANA name such as `Europe/Rome`; `AMBROGIO_LIST_PAGE_SIZE` above `AMBROGIO_MAX_LIST_PAGE_SIZE`; `AMBROGIO_VOICE_LANGUAGES` without `AMBROGIO_LANGUAGE` or with an unknown or repeated language. |
| `Conversation archive could not be prepared` | The folder of `AMBROGIO_ARCHIVE_PATH` does not exist or is not writable, or the database could not be updated. |
| `Voice resources are unavailable` | `AMBROGIO_VOICE_<L>_STT_MODEL_DIR` of the active language lacks the files of a streaming transducer: exactly one file whose name contains `encoder` and ends with `.onnx`, exactly one that contains `decoder` and ends with `.onnx`, exactly one that contains `joiner` and ends with `.onnx`, and exactly one that ends with `tokens.txt`. Or `AMBROGIO_VOICE_<L>_MODEL_DIR` lacks the files of a Piper voice: exactly one `.onnx` file, `tokens.txt` and `espeak-ng-data/`. |
| `Voice components could not be loaded` | The files are there but a model failed to load. Download it again. |
| `Agent configuration directory unavailable` | The agents folder, `AMBROGIO_AGENTS_DIR` or `/etc/ambrogio/agents` by default, does not exist. In Docker, check the mounts of the agent files. |
| `Missing orchestrator configuration` | There is no `orchestrator.json`. |
| `No specialist agent configured` | There is no agent file besides `orchestrator.json`. |
| `Invalid agent configuration filename: <file>` | The name must be lowercase letters, digits and hyphens, starting with a letter. |
| `Missing environment variable <NAME> for agent <id>` | The variable named by `apiKeyEnv`, `tokenEnv` or `clientSecretEnv` in that agent's file is not set in the backend environment. In Docker, add it to the service's `environment` section. |
| `Invalid agent configuration: <id>` | That agent's file. Common mistakes: invalid JSON, a field the backend does not know (a literal `apiKey`, `token` or `clientSecret` included: name the variable with `apiKeyEnv`, `tokenEnv` or `clientSecretEnv` instead), a variable name that is not uppercase letters, digits and underscores, `description` missing (or present in `orchestrator.json`), `maxToolCalls` missing with `mcp` or present without it, `provider` not among `mistral`, `openai`, `anthropic`, `google` and `openai-compatible`, `baseURL` missing or not an `http(s)://` address with `openai-compatible` or present with another provider, an `mcp.url` that is not `http(s)://`, an `mcp.tools` that is empty, not an array or with a repeated name. |
| `Invalid agent options: <id>` | `llm.options` may contain only `temperature` (0 or more) and `max_tokens` (1 or more). |
| `Agent MCP connection failed: <id>` | The backend could not connect to that agent's MCP server or list its tools. Test `mcp.url` from the backend host (in Docker, `localhost` is the container), and check the token or OAuth settings. |
| `Agent MCP tool unavailable: <id>` | A name in that agent's `mcp.tools` is not among the tools of its MCP server. Names are case-sensitive and must be written as the server declares them. |
| `HTTP listener could not start` | The port is already in use, or `AMBROGIO_HTTP_HOST` is not an address of this machine. |

For errors that come from outside Ambrogio (a library, the network, the operating system), the line shows only the step that failed, not the original message, so no secret can end up in the log.

[Backend configuration](../../reference/backend-configuration/) and [Agent configuration](../../reference/agent-configuration/) list every rule.

## The terminal client cannot connect

- Check the address from the same computer: `curl http://ambrogio.home.lan:3000/api/v1/conversations`.
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
- the orchestrator's model does not support structured JSON output, or a specialised agent's model does not support a required tool call; see [Providers](../../reference/agent-configuration/#providers);
- the answer took longer than 30 seconds;
- an agent with tools needed more than its `maxToolCalls`;
- the orchestrator chose no valid agent.

The backend log has a `conversation_reply_failed` event for each of these.

## The satellite exits with `invalid_configuration`

The satellite checks its environment variables before it starts and stops at the first problem. The log line names the variable and the problem, never its value:

```
{"level":"info","time":...,"event":"invalid_configuration","variable":"AMBROGIO_WAKE_WORD","condition":"invalid"}
```

- `"condition":"missing"`: the variable is not set, or is empty. `AMBROGIO_ENV` and `AMBROGIO_BACKEND_URL` are always required; the three `AMBROGIO_ATTENUATION_*` variables go together. In Docker, check the service's `environment` section.
- `"condition":"invalid"`: the value is wrong. [Satellite configuration](../../reference/satellite-configuration/) lists the rules for each variable. The usual suspects are an `AMBROGIO_ENV` other than `development`, `test` or `production`, an `AMBROGIO_BACKEND_URL` with spaces or a query string, an `AMBROGIO_WAKE_WORD` with characters other than ASCII letters, single spaces and inner apostrophes, or longer than 64 characters, a threshold that is not above 0 and below 1, a reply timeout that is not a whole number, and audio selectors with spaces around them.

`invalid_arguments` means the command line had arguments: the satellite takes none.

## The satellite does not start

When the satellite cannot start, it prints `Unable to start Ambrogio satellite.` to standard error and writes one `satellite_startup_failed` line. Its `err.message` says which step failed:

| `err.message` | What to check |
|---|---|
| `Wake word model could not be loaded` | The keyword spotting model is missing or damaged. If you mount your own model at `/app/models/kws`, the folder must contain exactly one `encoder*.onnx`, one `decoder*.onnx` and one `joiner*.onnx` file, plus `tokens.txt` and `bpe.model`; see [Change the wake word](../change-wake-word/#replace-the-keyword-spotting-model). Otherwise reinstall the satellite or pull the image again. |
| `Voice activity model could not be loaded` | The bundled speech detection model is damaged. Reinstall the satellite or pull the image again. |
| `Microphone could not be started` | The selected microphone does not exist or is busy. See [Choose audio devices](../choose-audio-devices/). |

Lines on standard error that start with `/shared/sherpa-onnx/` come from the speech library, not from the satellite.

When two things fail, for example the microphone and then the release of a model, `err.type` is `LifecycleError` and `err.faults` lists both.

## The satellite plays two descending tones

The satellite plays this error tone in two cases. Its log tells you which:

- `satellite_failure`: the interaction failed on the satellite's side. The backend cannot be reached, the session dropped during the turn, or no outcome arrived within 60 seconds. Check the address and the network from the device, then the backend logs. The satellite keeps running and tries again at the next wake word.
- `satellite_voice_unavailable`: the backend is running without voice and answered in text. [Enable voice](../enable-voice/) on the backend.

## The satellite never reacts to the wake word

- Check that the microphone works: `arecord -d 5 test.wav && aplay test.wav`.
- Make sure the satellite uses the right microphone; see [Choose audio devices](../choose-audio-devices/).
- Say the word set in `AMBROGIO_WAKE_WORD`, `Alexa` unless you changed it.
- If the log shows `satellite_wake_rejected` when you say it, the word was spotted but the speech detector heard no speech around it. Check the microphone level and speak towards the device.
- If the log shows nothing, lower `AMBROGIO_WAKE_WORD_THRESHOLD` a little, for example to `0.2`.
- The bundled model is trained on English speech. If your word does not sound English, try another one; see [Change the wake word](../change-wake-word/).

## The satellite wakes up by itself

Every wake-up writes a `satellite_wake_detected` line. A detection without speech around it, for example from a noise, is discarded and writes `satellite_wake_rejected` instead, without waking the satellite. So a false wake-up happens when the keyword spotter reacts while someone, or a TV, is speaking.

- Raise `AMBROGIO_WAKE_WORD_THRESHOLD` a little, for example to `0.3`.
- Try another wake word: how well a word is recognised, false wake-ups included, depends on the word. See [Change the wake word](../change-wake-word/).
- Move the device away from the TV.

## No beep after the wake word

The satellite plays the beep once the backend session is ready. If the speaker cannot play it, the log shows `satellite_ready_cue_failed` and the satellite listens anyway. Check the speaker selector.

## My question is cut short

The satellite decides you have finished after about two-thirds of a second of silence. Speak without long pauses. A request may last at most 60 seconds.

## Voice answers start long after I stop speaking

The backend recognises speech while you talk, so after the end of a sentence only the last part remains to decode. If the delay grows with the length of what you say, the backend CPU cannot recognise speech in real time: audio waits and the text arrives late, but nothing is lost.

1. Check that the backend host has an x86_64 CPU with AVX2. This prints `avx2` when it does:

   ```bash
   grep -o -m1 avx2 /proc/cpuinfo
   ```

2. Without AVX2, for example on a low-end Celeron, recognition falls behind. Run the backend on a CPU with AVX2.
