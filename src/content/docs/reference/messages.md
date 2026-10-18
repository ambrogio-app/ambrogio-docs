---
title: Messages
description: Every message Ambrogio itself can show or say to the family, with its cause.
sidebar:
  label: Messages
---

These are the messages written by Ambrogio, not by the AI. The backend's messages follow `language` in [`conversations.json`](/reference/backend-configuration/#conversationsjson). The satellite's are recordings in Italian.

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

## Satellite recordings

Played by the satellite itself, in Italian, whatever the backend's language.

| Says | When |
|---|---|
| "Non riesco a contattare Ambrogio. Riprova tra poco." | The interaction failed on the satellite's side: backend unreachable, session lost during the turn, protocol error for the request, or no outcome within 60 seconds. |
| "La voce non è disponibile." | The backend answered in text, which happens when voice is disabled. |

A short beep means the satellite is ready to hear you.

## Terminal client

The terminal client shows the backend's messages as they are. Its own interface texts are in Italian, for example *"In elaborazione. Aggiorna manualmente più tardi."* for a turn that is still being answered and *"Risposta interrotta."* for an interrupted one.
