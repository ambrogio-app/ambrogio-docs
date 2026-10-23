---
title: Enable voice
description: Configure speech recognition and synthesis in the backend.
sidebar:
  label: Enable voice
---

Voice is active when `AMBROGIO_VOICE_CONFIG_PATH` points to a valid TypeScript module. The backend Docker Compose example already mounts `examples/voice.ts` at `/etc/ambrogio/voice.ts` and sets that path. Its Piper profiles use the included Italian and English models.

## 1. Check the voice module

In `ambrogio-backend/compose.example.yaml`, keep these entries in the backend service:

```yaml
volumes:
  - ./examples/voice.ts:/etc/ambrogio/voice.ts:ro
environment:
  AMBROGIO_VOICE_CONFIG_PATH: /etc/ambrogio/voice.ts
```

Set `AMBROGIO_LANGUAGE=en` or `it` in `.env` to choose the profile. The Compose service forwards it to the container. [Backend configuration](../../reference/backend-configuration/#voicets) describes the fields and validation.

## 2. Recreate the backend

```bash
docker compose -f compose.example.yaml up -d
```

Check `docker compose -f compose.example.yaml logs backend` if startup fails. To use another bundled voice or a custom model, follow [Change the voice](../change-voice/). On a host without Docker, install the models yourself and point the module at their host paths.
