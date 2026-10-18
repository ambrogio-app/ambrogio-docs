---
title: Agents and the orchestrator
description: How Ambrogio decides who answers a request, and why the orchestrator is not allowed to answer itself.
sidebar:
  label: Agents and the orchestrator
---

Ambrogio does not send every request to one big assistant. It has a team: an *orchestrator* that decides who should answer, and *specialised agents* that write the answers. You define the team with one JSON file per member.

## Two steps for every turn

For each turn the backend:

1. gives the orchestrator the conversation so far, plus the list of agents with their descriptions, and asks it to name the agent that should answer the last message;
2. gives that agent the same conversation and lets it write the whole answer.

The choice is made again at every turn. A conversation can move from the cooking agent to the Home Assistant agent and back, as the family's questions change.

The orchestrator sees which agent gave each earlier answer, marked `[agent: cooking]` and so on, which helps it keep a follow-up question with the agent that handled the topic. The agents themselves see the plain conversation.

## Why the orchestrator never answers

An earlier design let the orchestrator answer simple questions itself and hand over the rest. In tests on a real installation it went wrong in a telling way: asked to "turn it off" after a question about a light, the orchestrator replied "I turned off the bedroom light" without calling Home Assistant. It announced an action that never happened, three times out of three.

Now the orchestrator can only pick a name from a closed list. It cannot write text, so it cannot claim to have done anything. If its output is not exactly one of the agent names, the turn fails rather than guessing. The cost is that you always need at least one agent besides the orchestrator, even for small talk.

## What makes a good description

The orchestrator never sees an agent's instructions, only its `description`. The description is a promise to the orchestrator about what the agent can do. Good descriptions:

- say what the agent is *for*: "Reads and changes the state of lights, switches and sensors";
- do not overlap with each other: if both the general and the home agent claim "questions about the house", the choice becomes a coin toss;
- are short. The orchestrator reads all of them at every turn.

## Agents with and without tools

An agent without an `mcp` section answers from its model's own knowledge. It is the right choice for conversation, explanations and anything that needs no live data.

An agent with an `mcp` section is connected to one MCP server and can call that server's tools: read a sensor, switch a light, look up a calendar. The backend counts the tool calls in each turn and stops at `maxToolCalls`, so a confused model cannot loop forever. The agent can still write a final answer after its last allowed call.

The model sees each tool under the name the server gives it, such as `GetLiveContext`, which helps it pick the right one. Some servers also offer prompts: instructions on how to use their tools and context about what they manage. Home Assistant's prompt lists the areas and devices exposed to Assist. The backend reads these prompts at every turn and adds them after the agent's own `instructions`, so your instructions can stay about tone and behaviour while the server describes its own devices.

Each agent has its own model, so you can spend money where it matters: a capable model for the orchestrator and for agents that act on your home, a cheaper one for chit-chat.

## Answers and replies

Agents produce two things together: the text of the answer and a yes/no flag saying whether the answer expects a reply. The flag comes from the same model call as the answer, not from guessing at question marks afterwards. The satellite uses it to listen again without the wake word.

## What this means for your configuration

- Keep the orchestrator's instructions about *choosing*. Tell it which agent should handle borderline cases, not how to answer.
- Put the tone and language of the answers in each agent's `instructions`.
- When you add a capability, add an agent, rather than stretching an existing one.
- Remember the 30-second limit per turn: a slow model plus several tool calls can run out of time.

[Agent configuration](../../reference/agent-configuration/) has the exact fields; [Add an agent](../../how-to/add-agent/) walks through an example.
