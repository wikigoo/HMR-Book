---
title: Understanding Flow State
description: A key architectural feature enabling the flexibility and data management capabilities of AgentFlow V2 is the Flow State. This mechanism provides a way to manage and share data dynamically throughout the execution of a single workflow instance.
---
### 

**What is Flow State?**

- Flow State (`$flow.state`) is a **runtime, key-value store** that is shared among the nodes in a single execution.
    
- It functions as temporary memory or a shared context that exists only for the duration of that particular run/execution.
    

**Purpose of Flow State**

The primary purpose of `$flow.state` is to enable **explicit data sharing and communication between nodes, especially those that may not be directly connected** in the workflow graph, or when data needs to be intentionally persisted and modified across multiple steps. It addresses several common orchestration challenges:

1. **Passing Data Across Branches:** If a workflow splits into conditional paths, data generated or updated in one branch can be stored in `$flow.state` to be accessed later if the paths merge or if other branches need that information.
    
2. **Accessing Data Across Non-Adjacent Steps:** Information initialized or updated by an early node can be retrieved by a much later node without needing to pass it explicitly through every intermediate node's inputs and outputs.
    

**How Flow State Works**

1. **Initialization / Declaration of Keys**
    
    - All state keys that will be used throughout the workflow **must be initialized** with their default (even if empty) values using the `Flow State` parameter within the **Start node**. This step effectively declares the schema or structure of your `$flow.state` for that workflow. You define the initial key-value pairs here.
        
    

![](https://docs.flowiseai.com/~gitbook/image?url=https%3A%2F%2F823733684-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F00tYLwhz5RyR7fJEhrWy%252Fuploads%252F7NuK4AH5SSzAC5UqxQsW%252FScreenshot%25202025-05-16%2520160038.png%3Falt%3Dmedia%26token%3De128abde-c020-41bb-8dfe-bcd7fbfab112&width=768&dpr=3&quality=100&sign=f9009f92&sv=2)

1. **Updating State / Modifying Existing Keys**
    

- Many operational nodes — e.g., `LLM`, `Agent`, `Tool`, `HTTP`, `Retriever`, `Custom Function` — include an `Update Flow State` parameter in their configuration.
    
- This parameter allows the node to **modify the values of pre-existing keys** within `$flow.state`.
    
- The value can be static text, the direct output of the current node, output from previous node, and many other variables. Type `{{` will show all the available variables.
    
- When the node executes successfully, it **updates** the specified key(s) in `$flow.state` with the new value(s). **New keys cannot be created by operational nodes; only pre-defined keys can be updated.**
    

![](https://docs.flowiseai.com/~gitbook/image?url=https%3A%2F%2F823733684-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F00tYLwhz5RyR7fJEhrWy%252Fuploads%252FU6qTlDQHQiW1PH6rs5PV%252FScreenshot%25202025-05-16%2520160347.png%3Falt%3Dmedia%26token%3D5b59be17-84f3-43ac-8894-b5f800716b69&width=768&dpr=3&quality=100&sign=3089865a&sv=2)

1. **Reading from State**
    

- Any node input parameter that accepts variables can read values from the Flow State.
    
- Use the specific syntax: `{{ $flow.state.yourKey }}` — replace `yourKey` with the actual key name that was initialized in the Start Node.
    
- For example, an LLM node's prompt might include `"...based on the user status: {{ $flow.state.customerStatus }}"`.
    

![](https://docs.flowiseai.com/~gitbook/image?url=https%3A%2F%2F823733684-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F00tYLwhz5RyR7fJEhrWy%252Fuploads%252FDRWO8sWWoTbVJdEKaREU%252FScreenshot%25202025-05-16%2520161711.png%3Falt%3Dmedia%26token%3D4e39e83f-8a69-4926-93e6-7aa0521e8cef&width=768&dpr=3&quality=100&sign=92cdc418&sv=2)

**Scope and Persistence:**

- It is created and initialized when a workflow execution begins and is destroyed when that specific execution ends.
    
- It does **not** persist across different user sessions or separate runs of the same workflow.
    
- Each concurrent execution of the workflow maintains its own independent `$flow.state`.

/hmr-agent-system