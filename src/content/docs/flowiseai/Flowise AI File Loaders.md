---
title: "Flowise AI File Loaders"
---

# Flowise AI Tutorial #3: File Loaders, Text Splitters, Embeddings & Vector Stores

Flowise makes it easy to create AI applications using a clean and intuitive user interface. One of the true powers of Flowise is the ability to create AI apps that utilize a custom knowledge base using your own data. By adding the ability to upload files—such as PDF documents and text files—you can chat with your own documentation.

Before building a document chatbot, there are several fundamental concepts you need to understand.

---

## 1. The Problem: Token Limits

Imagine you have a file containing a nursery rhyme like "Mary Had a Little Lamb." If you want an AI assistant to answer questions about the contents of that file, you must provide the text as context.

In a simple scenario, this is like copying text from a file and pasting it into ChatGPT. However, there is a significant limitation: the token limit. A token represents a word or part of a word. If your file is very large, you will quickly exceed the model's token limit, making it impossible to simply copy-paste the entire document into the chat.

To solve this, we only want to retrieve the specific sections of the document that are relevant to the user's question and feed only those sections into the chat as context. Flowise (which is based on LangChain) provides an elegant solution to this problem.

---

## 2. Core Concepts

### Text Splitters

Text Splitters allow us to take the content of a large file and break it up into smaller, manageable pieces called chunks.

### Documents

In LangChain, a "Document" should not be confused with a physical file. Instead, a Document is a specific definition of a text chunk created by the Text Splitter. It includes the text itself as well as metadata (such as the filename or page number), which helps the AI keep track of where the information came from.

### Vector Databases

Once files are broken into chunks and converted into LangChain documents, they need to be stored in a Vector Database.

Unlike traditional databases, vector databases store data as vector arrays (numerical representations of text). This allows the AI to perform a "similarity search" to find pieces of information that are mathematically similar to the user's query.

### Embeddings

To convert raw text into a vector array, we use a function called Embeddings. An embedding algorithm is unique to each language model. For example, if you are using OpenAI, you would use the OpenAI Embeddings function to translate your text into a format the model understands.

---

## 3. How the Retrieval Process Works

When you ask the application a question (e.g., _"Who is Mary?"_), the following happens:

1. The app queries the Vector Store.
2. The Vector Store performs a similarity search to find documents related to "Mary."
3. It returns a list of the most relevant chunks (by default, Flowise returns the top four).
4. These specific results are included in the conversation as context.
5. This greatly reduces the number of tokens used and lowers costs while maintaining accuracy.

---

## 4. Step-by-Step Guide: Building the Document Chatbot

### Project Setup

1. Go to your Flowise dashboard and create a new chat flow titled "Document Chatbot."
2. Prepare a test file. (Tip: Use a story containing information that GPT wasn't trained on—e.g., a unique story about an architect named Emily and a man named Lucas).

### Configuring the Nodes

Since we are not using external tools, we will use Chains instead of Agents.

#### Step 1: The Chain

- Go to Nodes $\rightarrow$ Chains.
- Select the Conversational Retrieval QA Chain and drop it onto the canvas. This chain requires two main inputs: an LLM and a Vector Store.

#### Step 2: The Language Model (LLM)

- Go to Nodes $\rightarrow$ Chat Models.
- Drag the ChatOpenAI model onto the canvas.
- Connect it to the Chain.
- Provide your OpenAI API Key and select a model (e.g., `gpt-3.5-turbo`).

#### Step 3: The Vector Store

- Go to Nodes $\rightarrow$ Vector Stores.
- For this demo, use the In Memory Vector Store. (For production environments, consider Pinecone or Supabase).
- Connect the Vector Store to the Chain.

#### Step 4: Loading Documents

- Go to Nodes $\rightarrow$ Document Loaders.
- Select the Text File loader and add it to the canvas. Connect it to the Vector Store.
- _Note:_ To avoid uploading the entire file as one single document, we need a Text Splitter.

#### Step 5: Splitting Text

- Go to Nodes $\rightarrow$ Text Splitters.
- Select the Recursive Character Text Splitter and connect it to the "Text Splitter" parameter on the Text File node.
- Configuration:
    - Chunk Size: Set this to `200` characters (smaller chunks reduce token usage and cost).
    - Chunk Overlap: Set this to `20` characters (this ensures a small amount of context is shared between adjacent chunks).

#### Step 6: Adding Embeddings

- Go to Nodes $\rightarrow$ Embeddings.
- Select OpenAI Embeddings and connect it to the Vector Store.
- Provide your OpenAI API Key.

---

## 5. Testing the Chatbot

1. Save the chat flow.
2. Upload your custom text file via the Text File node.
3. Open the chat window and ask questions specific to your file:
    - Question: _"Who is Emily?"_ $\rightarrow$ Response: (Should correctly identify her as an architect from Everdale).
    - Question: _"Are Emily and Lucas friends?"_ $\rightarrow$ Response: (Should answer based on the custom story provided).

By following this workflow, you have created a fully functional document chatbot capable of handling large PDF files or entire folders of content!