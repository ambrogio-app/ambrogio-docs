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

The terminal client shows the backend's messages as they are. Its own texts are in Italian or English, depending on its [language](../terminal-client/#command-line). `<host>` is the host name, `<n>` an HTTP status, `<text>` your message and `<detail>` the error.

### Start

| Italian | English | When |
|---|---|---|
| Uso: npm start -- --server http://host:porta [--client-id identificativo] [--language it\|en] | Usage: npm start -- --server http://host:port [--client-id identifier] [--language it\|en] | Usage, first line. |
| Oppure imposta AMBROGIO_URL, AMBROGIO_CLIENT_ID e AMBROGIO_LANGUAGE. | Or set AMBROGIO_URL, AMBROGIO_CLIENT_ID and AMBROGIO_LANGUAGE. | Usage, second line. |
| Opzioni non valide. | Invalid options. | An option or the language is not valid. |
| Indica l’URL del backend. | Specify the backend URL. | No backend address. |
| L’identificativo del client non può essere vuoto. | The client identifier must not be empty. | Empty client identifier. |
| Apri il client in un terminale interattivo. | Open the client in an interactive terminal. | Not an interactive terminal. |
| Terminale \<host\> | Terminal \<host\> | Name sent to the backend when the session opens. |

### Screen

| Italian | English | When |
|---|---|---|
| Nuova chat | New chat | The new chat entry in the list. |
| Caricamento conversazioni… | Loading conversations… | At start. |
| Scrivi un messaggio per iniziare questa chat. | Write a message to start this chat. | A chat with no messages. |
| Allarga il terminale ad almeno 70 colonne e 14 righe. La chat corrente resta aperta. | Enlarge the terminal to at least 70 columns and 14 rows. The current chat stays open. | The terminal is too small. Shown on two lines. |
| Scrivi un messaggio e premi Invio | Type a message and press Enter | Label of the input field. |
| Messaggio… | Message… | Placeholder of the input field. |
| ↑↓ scegli · Invio apri | ↑↓ select · Enter open | Keys of the chat list. |
| Tab pannelli · ^N nuova · ^R aggiorna · ^L altre · ^Q esci | Tab panels · ^N new · ^R refresh · ^L more · ^Q quit | General keys. |

The title, AMBROGIO · Chat, is the same in both languages.

### Conversation

| Italian | English | When |
|---|---|---|
| Tu: \<text\> | You: \<text\> | Your message. |
| Ambrogio: In elaborazione. Aggiorna manualmente più tardi. | Ambrogio: In progress. Refresh manually later. | A reopened turn is still being answered. |
| Ambrogio: In elaborazione… | Ambrogio: In progress… | The answer has not started arriving. |
| Errore: \<detail\> | Error: \<detail\> | The turn failed. |
| Risposta interrotta. | Response interrupted. | A turn in the history was interrupted. |
| Risposta interrotta. Aggiorna manualmente più tardi. | Response interrupted. Refresh manually later. | The session closed before the turn's outcome. |

Answers are shown after `Ambrogio: ` in both languages.

### Status line

| Italian | English | When |
|---|---|---|
| Conversazioni aggiornate. | Conversations refreshed. | The list was reloaded. |
| Altre conversazioni caricate. | More conversations loaded. | The next page was loaded. |
| Errore elenco: \<detail\> | List error: \<detail\> | The list could not be loaded. |
| Chat aperta. | Chat opened. | A chat was opened. |
| Errore apertura: \<detail\> | Error opening chat: \<detail\> | A chat could not be opened. |
| Nuova chat pronta. | New chat ready. | A new chat was started. |
| Ambrogio sta rispondendo… | Ambrogio is answering… | A turn is in progress. |
| Risposta conservata. | Answer saved. | The turn was answered. |
| Il turno è terminato con errore. | The turn ended with an error. | The turn failed. |
| Risposta interrotta. Aggiorna manualmente. | Response interrupted. Refresh manually. | The turn was interrupted. |
| Invio non riuscito. | Sending failed. | The message could not be sent. |

### Errors

These texts replace `<detail>` above, or end a turn when the backend sends no message of its own.

| Italian | English | When |
|---|---|---|
| URL del backend non valido. | Invalid backend URL. | The address cannot be parsed. |
| L’URL del backend deve essere HTTP(S), senza credenziali, query o frammento. | The backend URL must be HTTP(S), without credentials, query or fragment. | The address is not allowed. |
| Risposta JSON del backend non valida. | Invalid JSON response from the backend. | The backend's answer is not JSON. |
| Errore HTTP \<n\>. | HTTP error \<n\>. | An HTTP error without a message from the backend. |
| Risposta dell’elenco non valida. | Invalid list response. | The list does not have the expected form. |
| Voce dell’elenco non valida. | Invalid list entry. | An entry of the list does not have the expected form. |
| Risposta dello storico non valida. | Invalid history response. | The history does not have the expected form. |
| Turno dello storico non valido. | Invalid history turn. | A turn of the history does not have the expected form. |
| Risposta del turno non valida. | Invalid turn answer. | The answer of a turn does not have the expected form. |
| Errore del turno non valido. | Invalid turn error. | The error of a turn does not have the expected form. |
| Impossibile collegarsi al backend. | Cannot connect to the backend. | The session could not open. |
| Errore del turno. | Turn error. | `turn.failed` without a message. |
| Turno rifiutato. | Turn rejected. | `turn.rejected` without a message. |
| Errore del protocollo: \<detail\> | Protocol error: \<detail\> | `session.error` for the turn. Without a message, the detail is "messaggio non valido." or "invalid message.". |
| Scrivi un messaggio non vuoto. | Write a non-empty message. | The message is empty. |
| Messaggio troppo grande (massimo 64 KiB). | Message too large (maximum 64 KiB). | The message is over 64 KiB. |

## Web chat

The web chat's own texts are listed in [Web chat](../web-chat/#interface-texts).
