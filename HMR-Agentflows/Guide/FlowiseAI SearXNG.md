---
title: FlowiseAI SearXNG
description: SearXNG is a free internet metasearch engine which aggregates results from various search services and databases. Users are neither tracked nor profiled.
---

---

## 1. Introduction

In FlowiseAI, **Tools** are functions that agents can use to interact with the world — including generic utilities like web search. [1](#0-0) 

The `SearXNG` node is a **LangChain Tool** that wraps SearXNG — a free, self-hosted internet metasearch engine — allowing FlowiseAI agents to perform web searches without relying on third-party APIs or exposing user queries to external trackers. [2](#0-1) 

---

## 2. Integration Steps

### Step 1: Deploy SearXNG via Docker Compose

The official FlowiseDocs directs you to the [searxng-docker](https://github.com/searxng/searxng-docker) repository for setup. Docker Compose is the recommended method. [3](#0-2) 

### Step 2: Configure `searxng/settings.yml`

Two settings are **required** for FlowiseAI to communicate with SearXNG:

- `server.limiter` must be `false` (otherwise the API will rate-limit or block Flowise requests)
- `json` must be included in `search.formats` (Flowise queries SearXNG's JSON API endpoint)

```yaml
server:
  limiter: false
general:
  debug: true
search:
  formats:
    - html
    - json
``` [4](#0-3) 

### Step 3: Start the Container

```bash
docker-compose up -d
```

Verify the instance is running by opening `http://localhost:8080/search` in a browser. [5](#0-4) 

---

## 3. Workflow Setup in FlowiseAI

### Adding the SearXNG Node (Classic Chatflow / LangChain)

1. Open the FlowiseAI canvas.
2. Drag and drop the **SearXNG** node from the Tools panel.
3. In the node's configuration, set the **Base URL** to `http://localhost:8080`.
4. Optionally configure additional search parameters as needed.
5. Connect the SearXNG node to an **Agent** node (e.g., Tool Agent, Conversational Agent, OpenAI Tool Agent).

The LLM driving the agent will automatically determine what search query to use based on the user's question — no manual query mapping is required. [6](#0-5) 

The Tool Agent, for example, accepts a `Tools` input anchor (list) and a `Tool Calling Chat Model`, and uses function calling to decide when and how to invoke SearXNG. [6](#0-5) [7](#0-6) 

### Using SearXNG in AgentFlow V2

In the newer **AgentFlow V2** architecture, SearXNG can be used in two ways:

**a) Via the Agent Node (dynamic, LLM-driven)**

In the Agent Node's **Tools** section, select SearXNG as one of the tools the agent is authorized to use. The LLM will autonomously decide when to invoke it during its reasoning cycle. [8](#0-7) 

**b) Via the Tool Node (deterministic)**

Use a **Tool Node** when you want SearXNG to execute at a specific, fixed point in the workflow — without LLM reasoning for tool selection. You map the input argument (the search query) explicitly using a variable like `{{ previousNode.output }}` or `{{ $flow.state.someKey }}`. [9](#0-8) 

---

## 4. Best Practices and Constraints

| Topic | Detail |
|---|---|
| **`limiter: false`** | Required. Without it, SearXNG will block or throttle Flowise's automated requests. |
| **JSON format** | Required. Flowise communicates with SearXNG via its JSON API; omitting `json` from `search.formats` will cause failures. |
| **Base URL** | Must point to your running SearXNG instance. If Flowise and SearXNG are on the same host, `http://localhost:8080` works. If they are in separate Docker containers or on different hosts, use the appropriate network address. |
| **Privacy** | Since SearXNG is self-hosted, no search queries leave your infrastructure. This is the primary privacy advantage over tools like Serp API or Google Custom Search. |
| **LLM compatibility** | When using SearXNG with a Tool Agent or Agent Node in V2, the LLM must support **function calling** (e.g., ChatOpenAI, ChatMistral, ChatAnthropic, ChatGoogleGenerativeAI, GroqChat). |
| **`debug: true`** | Included in the example config; useful during setup to diagnose issues, but consider disabling in production. | [4](#0-3) [10](#0-9) 

---

## 5. Troubleshooting

**SearXNG returns no results or connection errors**
- Confirm the container is running: `docker ps` should show the SearXNG container.
- Confirm `http://localhost:8080/search` is reachable from the host running Flowise.
- If Flowise runs in its own Docker container, `localhost` inside that container does not resolve to the host. Use the Docker network service name or the host's LAN IP instead.

**Flowise gets HTTP 429 or blocked responses**
- `server.limiter` is likely still `true`. Set it to `false` in `searxng/settings.yml` and restart the container. [11](#0-10) 

**JSON parse errors from SearXNG**
- `json` is missing from `search.formats`. Add it to `searxng/settings.yml` and restart. [12](#0-11) 

**Agent never calls SearXNG**
- The LLM must support function/tool calling. Verify you are using a compatible model.
- In AgentFlow V2, if using the deterministic Tool Node instead of the Agent Node, the tool will always be called — bypassing LLM tool-selection logic entirely. [13](#0-12) 

---

**Summary of the minimal working setup:**

```
searxng/settings.yml  →  limiter: false, formats: [html, json]
docker-compose up -d
Flowise SearXNG node  →  Base URL: http://<searxng-host>:8080
Connect to Agent node →  LLM with function calling support
```

The full SearXNG node documentation lives at `en/integrations/langchain/tools/searxng.md` in the FlowiseDocs repository. [14](#0-13)

### Citations

**File:** en/integrations/langchain/tools/README.md (L9-9)
```markdown
Tools are functions that agents can use to interact with the world. These tools can be generic utilities (e.g. search), other chains, or even other agents.
```

**File:** en/integrations/langchain/tools/searxng.md (L1-34)
```markdown
---
description: Wrapper around SearXNG - a free internet metasearch engine.
---

# SearXNG

<figure><img src="../../../.gitbook/assets/up-011.png" alt="" width="283"><figcaption><p>SearXNG Node</p></figcaption></figure>

### Setup SearXNG

Follow [official documentation](https://docs.searxng.org/admin/installation.html) for setting up SearXNG locally. In this case, we will be using Docker Compose to set it up.

Navigate to [searxng-docker](https://github.com/searxng/searxng-docker) repository and follow the setup instructions.

Make sure that you have `server.limiter` set to `false` and `json` is included in `search.formats`. These parameters can be defined in `searxng/settings.yml` :

```yaml
server:
  limiter: false
general:
  debug: true
search:
  formats:
    - html
    - json
```

`docker-compose up -d` to start the container. Open web browser and go to **http://localhost:8080/search**, you will be able to see SearXNG page.

### Using in Flowise

Drag and drop SearXNG node onto canvas. Fill in the Base URL as **http://localhost:8080.** You can also specify other search parameters if needed. LLM will automatically figure out what to use for the search query question.

<figure><img src="../../../.gitbook/assets/image (171).png" alt=""><figcaption></figcaption></figure>
```

**File:** en/.gitbook/assets/ToolAgent Chatflow.json (L1030-1050)
```json
        "inputAnchors": [
          {
            "label": "Tools",
            "name": "tools",
            "type": "Tool",
            "list": true,
            "id": "toolAgent_0-input-tools-Tool"
          },
          {
            "label": "Memory",
            "name": "memory",
            "type": "BaseChatMemory",
            "id": "toolAgent_0-input-memory-BaseChatMemory"
          },
          {
            "label": "Tool Calling Chat Model",
            "name": "model",
            "type": "BaseChatModel",
            "description": "Only compatible with models that are capable of function calling: ChatOpenAI, ChatMistral, ChatAnthropic, ChatGoogleGenerativeAI, ChatVertexAI, GroqChat",
            "id": "toolAgent_0-input-model-BaseChatModel"
          },
```

**File:** en/using-flowise/agentflowv2.md (L121-122)
```markdown
  * **Tools**: Specify which pre-defined Flowise Tools the agent is authorized to use to achieve its goals.
    * For each selected tool, an optional **Require Human Input flag** indicates if the tool's operation might itself pause to ask for human intervention.
```

**File:** en/using-flowise/agentflowv2.md (L144-163)
```markdown
### **4. Tool Node**

Provides a mechanism for directly and deterministically executing a specific, pre-defined Flowise Tool within the workflow sequence. Unlike the Agent node, where the LLM dynamically chooses a tool based on reasoning, the Tool node executes exactly the tool selected by the workflow designer during configuration.

* **Functionality:** This node is used when the workflow requires the execution of a known, specific capability at a defined point, with readily available inputs. It ensures deterministic action without involving LLM reasoning for tool selection.
* **How it Works**
  1. **Triggering:** When the workflow execution reaches a Tool node, it activates.
  2. **Tool Identification:** It identifies the specific Flowise Tool selected in its configuration.
  3. **Input Argument Resolution:** It looks at the Tool Input Arguments configuration. For each required input parameter of the selected tool.
  4. **Execution:** It invokes the underlying code or API call associated with the selected Flowise Tool, passing the resolved input arguments.
  5. **Output Generation:** It receives the result returned by the tool's execution.
  6. **Output Propagation:** It makes this result available via its output anchor for subsequent nodes to use.
* **Configuration Parameters**
  * **Tool Selection**: Choose the specific, registered Flowise Tool that this node will execute from a dropdown list.
  * **Input Arguments**: Define how data from your workflow is supplied to the selected tool. This section dynamically adapts based on the chosen tool, presenting its specific required input parameters:
    * **Map Argument Name**: For each input the selected tool requires (e.g., `input` for a Calculator), this field will show the expected parameter name as defined by the tool itself.
    * **Provide Argument Value**: Set the value for that corresponding parameter, using a dynamic variable like `{{ previousNode.output }}`, `{{ $flow.state.someKey }}`, or by entering static text.
  * **Update Flow State**: Allows the node to modify the workflow's runtime state `$flow.state` during execution by updating pre-defined keys. This makes it possible, for example, to store this Tool node's output under such a key, making it accessible to subsequent nodes.
* **Inputs:** Receives necessary data for the tool's arguments via the `Input Arguments` mapping, sourcing values from previous node outputs, `$flow.state`, or static configurations.
* **Outputs:** Produces the raw output generated by the executed tool — e.g., a JSON string from an API, a text result, or a numerical value.
```
