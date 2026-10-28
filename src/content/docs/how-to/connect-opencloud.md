---
title: Connect OpenCloud
description: Let Ambrogio search and read the family's documents in OpenCloud through the opencloud-mcp server.
sidebar:
  label: Connect OpenCloud
---

[OpenCloud](https://opencloud.eu/) has no MCP server of its own. [opencloud-mcp](https://github.com/adrianofoschi/opencloud-mcp) is an independent, read-only [MCP](https://modelcontextprotocol.io/) server for it: it searches the names and the text of the files an OpenCloud user can see, and reads them. You give Ambrogio an [agent with tools](../../explanation/agents/) that connects to it, and that agent can then answer questions about your documents, such as bills, contracts and payslips, with a link to each document it used.

## Before you start

- OpenCloud with full-text search, so that the search also finds the words inside PDFs and office documents. The [opencloud-mcp README](https://github.com/adrianofoschi/opencloud-mcp#requirements) lists what it needs.
- You can sign in to OpenCloud as an administrator and run its `opencloud` command.
- The installation from [Self-host Ambrogio](../../tutorials/install-ambrogio/). Run the commands from `~/ambrogio`.

## 1. Choose what Ambrogio may read

opencloud-mcp sees exactly what one OpenCloud user sees. Give Ambrogio a user of its own:

1. In OpenCloud, create a user named `ambrogio`.
2. Create a space for the documents Ambrogio may read, add the family as members and `ambrogio` with the role **Can view**.

Anyone who talks to Ambrogio can ask about what this user can read: keep personal documents out of the space.

## 2. Create an app password

Create an app password for `ambrogio` on the OpenCloud server:

```bash
opencloud auth-app create --user-name=ambrogio --expiration=<duration>
```

App passwords expire: choose the duration and create a new one before it ends.

## 3. Start opencloud-mcp

Run opencloud-mcp as its [README](https://github.com/adrianofoschi/opencloud-mcp#configuration) describes, with `OPENCLOUD_USER=ambrogio`, the app password in `OPENCLOUD_APP_TOKEN` and a long random string in `MCP_TOKEN`, for example from `openssl rand -hex 32`. Put it on a Docker network that both OpenCloud and the Ambrogio backend reach, and do not publish its port outside the home network.

## 4. Add the agent file

1. Create `agents/files.json`:

   ```json title="~/ambrogio/agents/files.json"
   {
     "description": "Searches and reads the family's documents stored in OpenCloud, such as invoices, contracts, bills, payslips, bank statements and letters, to answer questions about what they say.",
     "instructions": "You answer questions about the family's documents stored in OpenCloud. Call search_files with the most distinctive words of the question, such as a company, a person, a product, the type of document or a year; when a search finds nothing useful, try again with synonyms or fewer words. Read with read_file only the one or two files that best match, using the excerpts and the dates to choose them, and read further parts with nextOffset only when the answer is not in the first part. Answer only from what the files say: when nothing relevant is found, say so instead of guessing. Answer briefly, in plain sentences without lists or other formatting, because the answer may be spoken, and end with a Markdown link to each document you used, written as [name of the document](link of the search result).",
     "llm": {
       "provider": "mistral",
       "model": "mistral-medium-latest",
       "apiKeyEnv": "MISTRAL_API_KEY"
     },
     "maxToolCalls": 6,
     "mcp": {
       "url": "http://opencloud-mcp:3000/mcp",
       "auth": {
         "type": "bearer",
         "tokenEnv": "OPENCLOUD_MCP_TOKEN"
       },
       "tools": [
         "search_files",
         "read_file"
       ]
     }
   }
   ```

2. Set `mcp.url` to the address of opencloud-mcp as the backend container reaches it, followed by `/mcp`: `http://opencloud-mcp:3000/mcp` when both run on the same Docker network.

3. The file names the token's variable, `OPENCLOUD_MCP_TOKEN`, in `mcp.auth.tokenEnv`. Add it to the `environment` section of the `backend` service in `compose.yaml`:

   ```yaml
   OPENCLOUD_MCP_TOKEN: ${OPENCLOUD_MCP_TOKEN:?Set OPENCLOUD_MCP_TOKEN}
   ```

4. Add to `.env` the same value you gave `MCP_TOKEN`:

   ```dotenv
   OPENCLOUD_MCP_TOKEN=<the-MCP_TOKEN-of-opencloud-mcp>
   ```

5. Start opencloud-mcp first, then recreate the backend:

   ```bash
   docker compose up -d
   ```

   The backend connects to opencloud-mcp once, after it starts.

## 5. Try it

Copy a bill into the space, wait a minute for OpenCloud to index its text, then ask: *"How much was the last electricity bill?"*. The answer ends with a link to the bill.

The text the agent reads is sent to the provider of its model. If the requests about documents get the standard error answer, look for `agent_mcp_unavailable` in `docker compose logs backend`; see [Troubleshooting](../troubleshoot/#an-agent-with-an-mcp-server-does-not-work).

## If the orchestrator picks the wrong agent

Make the files agent's `description` more specific, for example by naming the kinds of documents in the space, and the general one clearly about other things. Then run `docker compose restart backend`.
