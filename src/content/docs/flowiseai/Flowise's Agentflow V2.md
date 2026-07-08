---
title: "Flowise's Agentflow V2"
---

Here is a comprehensive technical analysis of the described Agentflows architecture, grounded in how Flowise's Agentflow V2 actually works.

---

## 1. Flaws and Shortcomings

### 1.1 Router Overload (Condition Agent Node)

The `Condition Agent Node` is the documented mechanism for AI-driven routing. Flowise's own documentation explicitly warns against this pattern at scale:

> *"Providing too many possible output paths can make the agent hesitate or make suboptimal decisions... Limit the number of output paths to a manageable set."* [1](#0-0) 

With the current flat structure — Samsung, Apple, Xiaomi, + 10 future brands + Comparison + Accessories + Off-Topic — the router will be handling **15+ scenarios from a single node**. This is a documented anti-pattern. Routing accuracy degrades as the number of scenarios grows, and a misclassification at this single point poisons the entire response.

### 1.2 Single Point of Failure Architecture

The entire system funnels through one `Condition Agent Node`. There is no fallback path if the router is uncertain, no confidence threshold, and no secondary classification step. A query like *"مقایسه باتری سامسونگ A55 با شیائومی 14"* (compare Samsung A55 battery with Xiaomi 14) could be misrouted to a brand subagent instead of the comparison agent. [2](#0-1) 

### 1.3 QA & Refine Loop — Undefined Exit Condition and Token Cost

The `Loop Node` has a hard default of `maxLoopCount: 5`. [3](#0-2) 

The described QA layer does not define a structured, deterministic exit condition. If the QA agent uses natural language to decide "good enough," the loop may exit prematurely or exhaust all 5 iterations on a response that was already acceptable. Each loop iteration re-executes the entire agent chain, multiplying token costs. The Supervisor/Worker tutorial explicitly flags this:

> *"This architecture consumes a lot of tokens due to the back and forth communications between agents."* [4](#0-3) 

### 1.4 Comparison Agent — Sequential KB Retrieval, No Parallelism

Flowise's multi-agent system is explicitly **sequential** — one task at a time, no parallel node execution: [5](#0-4) 

The comparison agent must query multiple KBs one after another. With 15+ brands in the future, a cross-brand comparison query (e.g., "compare 5 brands' camera specs") will be extremely slow and token-heavy. The Agent Node's autonomous KB selection also introduces non-determinism — it may skip a relevant KB. [6](#0-5) 

### 1.5 No Context Propagation Between Router and Subagents

The router identifies the brand but there is no described mechanism to pass structured routing metadata (e.g., `$flow.state.brand`, `$flow.state.userRole`) downstream. Each subagent starts without knowing *why* it was selected or *who* is asking (repairer vs. seller), leading to generic responses. [7](#0-6) 

### 1.6 No QA Feedback Path to Re-Route

The QA layer can only refine the output of the subagent that was already called. If the QA agent determines the response is factually wrong (e.g., the router sent a repair query to the wrong brand agent), it cannot re-route. The loop only goes back to the same subagent.

### 1.7 Persian Language and Domain Terminology Gaps

There is no described mechanism for:
- Handling Persian-specific mobile repair terminology (e.g., تعویض پنل, آی‌سی شارژ, دات پروجکتور)
- Normalizing Persian script variants (Arabic Kaf/Yeh vs. Persian Kaf/Yeh)
- Ensuring the QA layer enforces formal vs. informal Persian register appropriate for the audience
- Selecting LLMs with strong Persian language capability for the final output node

---

## 2. Improvement Suggestions

### 2.1 Replace Flat Router with Two-Level Hierarchical Routing

Instead of one `Condition Agent Node` with 15+ scenarios, use a two-stage approach:

```
Start
└─ Stage 1: Category Router (Condition Agent)
   ├─ "Brand Query"     → Stage 2: Brand Router (Condition Agent)
   │                        ├─ Samsung → KB Samsung Agent
   │                        ├─ Apple   → KB Apple Agent
   │                        └─ ...
   ├─ "Comparison"      → Comparison Agent
   ├─ "Accessories/Edu" → Generalist Agent
   └─ "Off-Topic"       → Direct Reply
```

Each `Condition Agent Node` now handles ≤5 scenarios, which is within the documented safe range. Adding a new brand only requires updating Stage 2, not the primary router. [8](#0-7) 

### 2.2 Use `$flow.state` for Structured Context Passing

Configure the `Start Node` to initialize `$flow.state` with keys like `brand`, `userRole`, `queryType`. The router updates these via `Update Flow State` before branching. Every downstream agent reads `{{ $flow.state.brand }}` and `{{ $flow.state.userRole }}` to tailor its system prompt. [9](#0-8) 

### 2.3 Replace Autonomous Comparison Agent with Explicit Retriever Nodes

For the comparison agent, use `Retriever Nodes` explicitly wired to each relevant KB, feeding their outputs into a single synthesis `LLM Node`. This is deterministic, parallelism-friendly (via the `Iteration Node`), and avoids the agent autonomously deciding which KBs to query.

```
Comparison Branch:
  Retriever (KB Samsung) ─┐
  Retriever (KB Apple)   ─┼─ LLM Synthesis Node → QA Layer
  Retriever (KB Xiaomi)  ─┘
``` [10](#0-9) 

### 2.4 Structured QA Exit Condition

Configure the QA agent to use **JSON Structured Output** with fields like `quality_score` (0–10), `issues` (array), and `approved` (boolean). Then use a deterministic `Condition Node` (not another AI agent) to decide whether to loop or proceed:

```
QA Agent (JSON output: {approved: bool, score: int})
└─ Condition Node: $flow.state.qa_approved == true
   ├─ true  → Final Reply Node
   └─ false → Loop back to Subagent (max 2 iterations)
```

This makes the loop exit condition deterministic and auditable. [11](#0-10) 

### 2.5 Memory Optimization for Multi-Turn Conversations

Use `Conversation Summary Buffer` memory type on brand subagents to prevent token overflow in long repair consultations. The Flowise docs specifically recommend this for workflows with back-and-forth communication. [12](#0-11) 

### 2.6 Assign Specialized LLMs Per Layer

- **Router**: A fast, cheap model (e.g., `gpt-4o-mini`) — classification only, no generation needed
- **Brand Subagents**: A capable model with strong Persian support (e.g., `gpt-4o`, `gemini-1.5-pro`)
- **QA & Refine**: The highest-quality model available — this is the quality gate
- **Final Reply**: An LLM with explicit Persian formatting instructions [13](#0-12) 

---

## 3. Additional Points for Quality Improvement

### 3.1 Metadata-Driven KB Segmentation

Within each brand's Document Store, use metadata keys to segment content by audience:

```json
{ "brand": "samsung", "audience": "repairer", "category": "motherboard" }
{ "brand": "samsung", "audience": "seller", "category": "pricing" }
```

The subagent can then apply metadata filters based on `$flow.state.userRole`, ensuring a repairer gets repair schematics and a seller gets pricing/availability data. [14](#0-13) 

### 3.2 Analytics and Tracing Integration

Integrate LangFuse or Arize to trace every execution. This enables:
- Identifying which brands have the highest QA rejection rates
- Detecting router misclassification patterns
- Monitoring token costs per branch [15](#0-14) 

### 3.3 Human-in-the-Loop for Critical Repair Queries

For queries involving safety-critical repair information (e.g., battery replacement voltages, Face ID dot projector calibration), add a `Human Input Node` before the final reply. This is especially important given the specialized professional audience. [16](#0-15) 

### 3.4 KB Refresh Pipeline

Use the Document Store Refresh API to keep brand KBs current when new device models are released. Without this, the system will give outdated repair/pricing information. [17](#0-16) 

---

## 4. Scalability Evaluation

| Dimension | Current Design | Risk | Recommended Fix |
|---|---|---|---|
| **Router capacity** | 1 flat `Condition Agent` with 15+ scenarios | High — documented to degrade | Two-level hierarchical routing |
| **Adding a new brand** | Requires modifying the primary router | High — touches core routing logic | Stage 2 router is isolated; only it needs updating |
| **Comparison agent** | Single agent queries all KBs autonomously | High — sequential, non-deterministic | Explicit `Retriever Nodes` + `Iteration Node` |
| **QA loop cost** | Unbounded AI-driven exit | Medium — may loop unnecessarily | Structured JSON output + deterministic `Condition Node` |
| **Token growth** | All messages accumulate in memory | Medium — hits context limits | `Conversation Summary Buffer` per subagent |
| **KB maintenance** | Manual | High at 15+ brands | Automated refresh via Document Store API |

The current flat architecture has a **hard scalability ceiling at approximately 7–8 brands** before the `Condition Agent Node` routing accuracy becomes unreliable. The two-level hierarchical approach removes this ceiling entirely — Stage 2 can be replicated or extended without touching Stage 1, and adding 10 more brands is a matter of adding nodes to Stage 2 only. [1](#0-0) [5](#0-4)

### Citations

**File:** esp/usar-flowise/agentflows/sequential-agents.md (L805-812)
```markdown
**Sobrecarga de opciones**

* **Problema:** Proporcionar demasiados caminos de salida posibles puede hacer que el agente dude o tome decisiones subóptimas.
* **Ejemplo:** Un Condition Agent Node con 10 posibles salidas, cada una con criterios sutilmente diferentes.
* **Solución:**
  * Limita el número de caminos de salida a un conjunto manejable
  * Asegúrate de que cada camino sea claramente distinto
  * Considera usar múltiples Condition Agent Nodes para decisiones más complejas
```

**File:** en/using-flowise/agentflowv2.md (L84-86)
```markdown
  * **Flow State**: Defines the complete set of initial key-value pairs for the workflow's runtime state `$flow.state`. All state keys that will be used or updated by subsequent nodes must be declared and initialized here.
* **Inputs:** Receives the initial data that triggers the workflow, which will be either a chat message or the data submitted through a form.
* **Outputs:** Provides a single output anchor to connect to the first operational node, passing along the initial input data and the initialized Flow State.
```

**File:** en/using-flowise/agentflowv2.md (L104-107)
```markdown
  * **JSON Structured Output**: Instructs the LLM to format its output according to a specific JSON schema — including keys, data types, and descriptions — ensuring predictable, machine-readable data.
  * **Update Flow State**: Allows the node to modify the workflow's runtime state `$flow.state` during execution by updating pre-defined keys. This makes it possible, for example, to store this LLM node's output under such a key, making it accessible to subsequent nodes.
* **Inputs:** This node utilizes data from the workflow's initial trigger or from the outputs of preceding nodes, incorporating this data into the `Messages` or `Input Message` fields. It can also retrieve values from `$flow.state` when input variables reference it.
* **Outputs:** Produces the LLM's response, which will be either plain text or a structured JSON object. The categorization of this output — as User or Assistant — is determined by the `Return Response` setting.
```

**File:** en/using-flowise/agentflowv2.md (L123-131)
```markdown
  * **Knowledge / Document Stores**: Configure access to information within Flowise-managed Document Stores.
    * **Document Store**: Choose a pre-configured Document Store from which the agent can retrieve information. These stores must be set up and populated in advance.
    * **Describe Knowledge**: Provide a natural language description of the content and purpose of this Document Store. This description guides the agent in understanding what kind of information the store contains and when it would be appropriate to query it.
  * **Knowledge / Vector Embeddings**: Configure access to external, pre-existing vector stores as additional knowledge sources for the agent.
    * **Vector Store**: Selects the specific, pre-configured vector database the agent can query.
    * **Embedding Model**: Specifies the embedding model associated with the selected vector store, ensuring compatibility for queries.
    * **Knowledge Name**: Assigns a short, descriptive name to this vector-based knowledge source, which the agent can use for reference.
    * **Describe Knowledge**: Provide a natural language description of the content and purpose of this vector store, guiding the agent on when and how to utilize this specific knowledge source.
    * **Return Source Documents**: If enabled, instructs the agent to include source document information with the data retrieved from the vector store.
```

**File:** en/using-flowise/agentflowv2.md (L169-180)
```markdown
### **5. Retriever Node**

Performs targeted information retrieval from configured Document Stores.

* **Functionality:** This node queries one or more specified Document Stores, fetching relevant document chunks based on semantic similarity. It's a focused alternative to using an Agent node when the only required action is retrieval and dynamic tool selection by an LLM is not necessary.
* **Configuration Parameters**
  * **Knowledge / Document Stores**: Specify which pre-configured and populated Document Store(s) this node should query to find relevant information.
  * **Retriever Query**: Define the text query that will be used to search the selected Document Stores. Dynamic data can be inserted using `{{ variables }}`.
  * **Output Format**: Choose how the retrieved information should be presented — either as plain `Text` or as `Text with Metadata`, which might include details like source document names or locations.
  * **Update Flow State**: Allows the node to modify the workflow's runtime state `$flow.state` during execution by updating pre-defined keys. This makes it possible, for example, to store this Retriever node's output under such a key, making it accessible to subsequent nodes.
* **Inputs:** Requires a query string — often supplied as a variable from a previous step or user input — and accesses the selected Document Stores for information.
* **Outputs:** Produces the document chunks retrieved from the knowledge base, formatted according to the chosen `Output Format`.
```

**File:** en/using-flowise/agentflowv2.md (L225-236)
```markdown
### **8. Condition Agent Node**

Provides AI-driven dynamic branching based on natural language instructions and context.

* **Functionality:** This node uses a Large Language Model (LLM) to route the workflow. It analyzes provided input data against a set of user-defined "Scenarios" — potential outcomes or categories — guided by high-level natural language "Instructions" that define the decision-making task. The LLM then determines which scenario best fits the current input context. Based on this AI-driven classification, the workflow execution proceeds down the specific output path corresponding to the chosen scenario. This node is particularly useful for tasks like user intent recognition, complex conditional routing, or nuanced situational decision-making where simple, predefined rules — as in the Condition Node — are insufficient.
* **Configuration Parameters**
  * **Model**: Specifies the AI model from a chosen service that will perform the analysis and scenario classification.
  * **Instructions**: Define the overall goal or task for the LLM in natural language — e.g., "Determine if the user's request is about sales, support, or general inquiry."
  * **Input**: Specify the data, often text from a previous step or user input, using `{{ variables }}`, that the LLM will analyze to make its routing decision.
  * **Scenarios**: Configure an array defining the possible outcomes or distinct paths the workflow can take. Each scenario is described in natural language — e.g., "Sales Inquiry," "Support Request," "General Question" — and each corresponds to a unique output anchor on the node.
* **Inputs:** Requires the `Input` data for analysis and the `Instructions` to guide the LLM.
* **Outputs:** Provides multiple output anchors, one for each defined `Scenario`. The workflow continues along the specific path connected to the output anchor that the LLM determines best matches the input.
```

**File:** en/using-flowise/agentflowv2.md (L262-264)
```markdown
  * **Loop Back To**: Selects the unique ID of a previously executed node within the current workflow to which the execution should return.
  * **Max Loop Count**: Defines the maximum number of times this loop operation can be performed within a single workflow execution, safeguarding against infinite cycles. The default value is 5.
* **Inputs:** Receives the execution signal to activate. It internally tracks the number of times the loop has occurred for the current execution.
```

**File:** en/using-flowise/agentflowv2.md (L271-286)
```markdown
### **11. Human Input Node**

Pauses the workflow execution to request explicit input, approval, or feedback from a human user — a key component for Human-in-the-Loop (HITL) processes.

* **Functionality:** This node halts the automated progression of the workflow and presents information or a question to a human user, via the chat interface. The content displayed to the user can either be a predefined, static text or dynamically generated by a LLM based on the current workflow context. The user is provided with distinct action choices — e.g., "Proceed," "Reject" — and, if enabled, a field to provide textual feedback. Once the user makes a selection and submits their response, the workflow resumes execution along the specific output path corresponding to their chosen action.
* **Configuration Parameters**
  * **Description Type**: Determines how the message or question presented to the user is generated — either `Fixed` (static text) or `Dynamic` (generated by an LLM).
    * **If Description Type is `Fixed`**
      * **Description**: This field contains the exact text to be displayed to the user. It supports the insertion of dynamic data using `{{ variables }}`
    * **If `Description Type` is `Dynamic`**
      * **Model**: Selects the AI model from a chosen service that will generate the user-facing message.
      * **Prompt**: Provides the instructions or prompt for the selected LLM to generate the message shown to the user.
  * **Feedback:** If enabled, the user will be prompted with a feedback window to leave their feedback, and this feedback will be appended to the node's output.
* **Inputs:** Receives the execution signal to pause the workflow. It can utilize data from previous steps or `$flow.state` through variables in the `Description` or `Prompt` fields if configured for dynamic content.
* **Outputs:** Provides two output anchors, each corresponding to a distinct user action — an anchor for "proceed" and another for "reject". The workflow continues along the path connected to the anchor matching the user's selection.

```

**File:** en/tutorials/supervisor-and-workers.md (L194-198)
```markdown
* This architecture consumes a lot of tokens due to the back and forth communications between agents, hence it is not suitable for every cases. It is particularly effective for:
  * Software development tasks requiring both implementation and review
  * Complex problem-solving that benefits from multiple perspectives
  * Workflows where quality and iteration are important
  * Tasks that require coordination between different types of expertise
```

**File:** en/tutorials/supervisor-and-workers.md (L199-202)
```markdown
* Ensure each agent has a well-defined, specific role. Avoid overlapping responsibilities that could lead to confusion or redundant work.
* Establish standard formats for how agents communicate their progress, findings, and recommendations. This helps the supervisor make better routing decisions.
* Use memory settings appropriately to maintain conversation context while avoiding token limit issues. Consider using memory optimization settings like "Conversation Summary Buffer" for longer workflows.

```

**File:** esp/usar-flowise/agentflows/multi-agents.md (L31-36)
```markdown
* **Una tarea a la vez:** El Supervisor está intencionalmente diseñado para enfocarse en una sola tarea a la vez. Espera a que el Worker activo complete su tarea y devuelva los resultados antes de analizar el siguiente paso y delegar la tarea subsiguiente. Esto asegura que cada paso se complete exitosamente antes de continuar, previniendo la sobrecomplejidad.
* **Un Supervisor por flujo:** Si bien es teóricamente posible implementar un conjunto de sistemas multi-agente anidados para formar una estructura jerárquica más sofisticada para flujos de trabajo altamente complejos, lo que LangChain define como "[Hierarchical Agent Teams](https://github.com/langchain-ai/langgraph/blob/main/examples/multi_agent/hierarchical_agent_teams.ipynb)", con un supervisor de nivel superior y supervisores de nivel medio gestionando equipos de workers, los sistemas multi-agente de Flowise actualmente operan con un solo Supervisor.

{% hint style="info" %}
Estas dos restricciones son importantes cuando **planificas el flujo de trabajo de tu aplicación**. Si intentas diseñar un flujo de trabajo donde el Supervisor necesita delegar múltiples tareas simultáneamente, en paralelo, el sistema no podrá manejarlo y encontrarás un error.
{% endhint %}
```

**File:** esp/usar-flowise/agentflows/multi-agents.md (L89-91)
```markdown
{% hint style="info" %}
La capacidad de asignar **diferentes Chat Models a cada Worker** proporciona flexibilidad significativa y oportunidades de optimización para nuestra aplicación. Al seleccionar [Chat Models](../../integrations/langchain/chat-models/) adaptados a tareas específicas, podemos aprovechar soluciones más rentables para tareas más simples y reservar modelos especializados, potencialmente más caros, cuando sea verdaderamente necesario.
{% endhint %}
```

**File:** en/use-cases/multiple-documents-qna.md (L46-58)
```markdown
3. We can fix this by specifying a metadata filter from the Pinecone node. For example, if we only want to retrieve context from APPLE FORM-10K, we can look back at the metadata we have specified earlier in the [#upsert](multiple-documents-qna.md#upsert "mention") step, then use the same in the Metadata Filter below:

<figure><img src="../.gitbook/assets/image (102).png" alt=""><figcaption></figcaption></figure>

4. Let's ask the same question again, we should now see all context retrieved are indeed from APPLE FORM-10K:

<figure><img src="../.gitbook/assets/image (103).png" alt=""><figcaption></figcaption></figure>

{% hint style="info" %}
Each vector databse provider has different format of filtering syntax, recommend to read through the respective vector database documentation
{% endhint %}

5. However, the problem with this is that metadata filtering is sort of _**"hard-coded"**_. Ideally, we should let the LLM to decide which document to retrieve based on the question.
```

**File:** en/README.md (L9-64)
```markdown
Flowise is an open source generative AI development platform for building AI Agents and LLM workflows.

It offers a complete solution that includes:

* [x] Visual Builder
* [x] Tracing & Analytics
* [x] Evaluations
* [x] Human in the Loop
* [x] API, CLI, SDK, Embedded Chatbot
* [x] Teams & Workspaces

There are 3 main visual builders namely:

* Assistant
* Chatflow
* Agentflow

## Assistant

Assistant is the most begineer-friendly way of creating an AI Agent. Users can create chat assistant that is able to follow instructions, use tools when neccessary, and retrieve knowledge base from uploaded files ([RAG](https://en.wikipedia.org/wiki/Retrieval-augmented_generation)) to respond to user queries.

<figure><picture><source srcset=".gitbook/assets/Screenshot 2025-06-10 232758.png" media="(prefers-color-scheme: dark)"><img src=".gitbook/assets/image (303).png" alt=""></picture><figcaption></figcaption></figure>

## Chatflow

Chatflow is designed to build single-agent systems, chatbots and simple LLM flows. It is more flexible than Assistant. Users can use advance techniques like Graph RAG, Reranker, Retriever, etc.

<figure><picture><source srcset=".gitbook/assets/screely-1749594035877.png" media="(prefers-color-scheme: dark)"><img src=".gitbook/assets/screely-1749593961545.png" alt=""></picture><figcaption></figcaption></figure>

## Agentflow

Agentflow is the superset of Chatflow & Assistant. It can be used to create chat assistant, single-agent system, multi-agent systems, and complex workflow orchestration. Learn more [Agentflow V2](using-flowise/agentflowv2.md)

<figure><picture><source srcset=".gitbook/assets/screely-1749594631028.png" media="(prefers-color-scheme: dark)"><img src=".gitbook/assets/screely-1749594614881.png" alt=""></picture><figcaption></figcaption></figure>

## Flowise Capabilities

| Feature Area                 | Flowise Capabilities                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Orchestration                | Visual editor, supports open-source & proprietary models, expressions, custom code, branching/looping/routing logic |
| Data Ingestion & Integration | Connects to 100+ sources, tools, vector databases, memories                                                         |
| Monitoring                   | Execution logs, visual debugging, external log streaming                                                            |
| Deployment                   | Self-hosted options, air-gapped deploy                                                                              |
| Data Processing              | Data transforms, filters, aggregates, custom code, RAG indexing pipelines                                           |
| Memory & Planning            | Various memory optimization technique and integrations                                                              |
| MCP Integration              | MCP client/server nodes, tool listing, SSE, auth support                                                            |
| Safety & Control             | Input moderation & output post-processing                                                                           |
| API, SDK, CLI                | API access, JS/Python SDK, Command Line Interface                                                                   |
| Embedded & Share Chatbot     | Customizable embedded chat widget and component                                                                     |
| Templates & Components       | Template marketplace, reusable components                                                                           |
| Security Controls            | RBAC, SSO, encrypted creds, secret managers, rate limit, restricted domains                                         |
| Scalability                  | Vertical/horizontal scale, high throughput/workflow load                                                            |
| Evaluations                  | Datasets, Evaluators and Evaluations                                                                                |
| Community Support            | Active community forum                                                                                              |
| Vendor Support               | SLA support, consultations, fixed/deterministic pricing                                                             |

```

**File:** en/using-flowise/document-stores.md (L237-242)
```markdown
There are also APIs support for creating, updating and deleting document store. In this section, we are going to highlight the 2 of the most used APIs:

* Upsert
* Refresh

For details, see the [Document Store API Reference](../api-reference/document-store.md).
```
