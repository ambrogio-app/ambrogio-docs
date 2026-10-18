---
title: Messages
description: Every message Ambrogio itself can show or say to the family, with its cause.
sidebar:
  label: Messages
---

These are the messages written by Ambrogio, not by the AI. The backend's messages follow `language` in [`conversations.json`](../backend-configuration/#conversationsjson). The satellite has no spoken messages of its own.

## Refusal reasons

Sent with `turn.rejected` when a turn is not accepted. The turn is not stored.

| `reason` | Italian | English | Cause |
|---|---|---|---|
| `invalid` | Messaggio non valido. | Invalid message. | The text is empty or only spaces. |
| `conversation_not_found` | Conversazione non trovata. | Conversation not found. | The conversation to continue does not exist. |
| `occupied` | Un altro turno è in corso. | Another turn is in progress. | That conversation is already answering another turn. |
| `unavailable` | Servizio temporaneamente non disponibile. | Service temporarily unavailable. | The server is stopping, the database refused the turn, or input is disabled after a storage fault (until restart). |
| `too_large` | Richiesta troppo grande. | Request too large. | Text over 64 KiB or audio over 60 seconds. |
| `transcription_failed` | Non ho capito la richiesta. | I didn't understand the request. | Speech recognition returned nothing usable. |
| `audio_unavailable` | La voce non è disponibile. | Voice is not available. | The turn uses audio but voice is disabled. Always sent as text. |
| `failure` | Non riesco a completare la risposta. | I can't complete the response. | Unexpected fault before the turn was accepted. |

## Failed turns

| Italian | English | Cause |
|---|---|---|
| Non riesco a completare la risposta. | I can't complete the response. | Any failure after the turn was accepted: model error, 30-second limit, tool call limit, invalid agent choice, storage fault. |

This text is also stored as the turn's `error`.

## HTTP errors

| Status | Italian | English |
|---|---|---|
| 400 (list) | Richiesta di paginazione non valida. | Invalid pagination request. |
| 404 | Conversazione non trovata. | Conversation not found. |
| 500 | Non riesco a completare la risposta. | I can't complete the response. |

## Satellite sounds

The satellite plays two sounds of its own, the same in every language. It does not speak any message itself.

| Sound | When |
|---|---|
| A short beep (880 Hz, 100 ms) | The satellite is ready to hear you. |
| Two descending tones (660 Hz then 440 Hz, 350 ms in all) | The interaction failed on the satellite's side (backend unreachable, session lost during the turn, protocol error for the request, or no outcome within 60 seconds), or the backend answered in text because voice is disabled. The [log](../logs/#satellite) tells the two cases apart. |

## Terminal client

The terminal client shows the backend's messages as they are. Its own interface texts are in Italian or English, depending on its [language](../terminal-client/#command-line):

| Italian | English | When |
|---|---|---|
| In elaborazione. Aggiorna manualmente più tardi. | In progress. Refresh manually later. | A reopened turn is still being answered. |
| Risposta interrotta. | Response interrupted. | A turn in the history was interrupted. |
| Risposta interrotta. Aggiorna manualmente più tardi. | Response interrupted. Refresh manually later. | The session closed before the turn's outcome. |
