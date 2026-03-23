# Zero-Egress Architecture: A Fundamentals Guide for Senior Engineers

**Written for:** JC, senior SRE (12+ years), knows Docker, K8s, Python basics, new to AI/ML infrastructure.

**What this is:** A complete breakdown of the ARIA (internal company chatbot) and LocalMind (multi-tenant SaaS) architectures -- grounded in the actual code in `src/ArchitectureDeepDive.jsx` and `src/ArchDiagram.jsx`.

---

## Table of Contents

1. [Why On-Prem AI Costs So Much](#1-why-on-prem-ai-costs-so-much)
2. [The Component Stack, Explained](#2-the-component-stack-explained)
3. [The Hiring Guide](#3-the-hiring-guide)
4. [The Learning Path](#4-the-learning-path)
5. [The 5 Aha Moments](#5-the-5-aha-moments)

---

## 1. Why On-Prem AI Costs So Much

### GPUs: What they are and what they are actually doing

Think of a CPU as a Formula 1 car: one driver, insanely fast, great at complex sequential tasks. A GPU is a school bus full of toddlers: thousands of tiny cores, each one slow and dumb, but they all compute in parallel at the same time.

LLMs run on matrix multiplication. Generating one token from a 70B parameter model requires multiplying enormous matrices together -- literally billions of floating-point multiply-add operations per token. CPUs can do this but take seconds per token, which makes the model unusable. GPUs are purpose-built for this exact operation and handle it in milliseconds.

A CPU cannot replace a GPU for inference because the memory bandwidth is too low. A modern CPU reads maybe 50-100 GB/s of memory. An A100 GPU reads 2 TB/s. The model's weights need to stream through hardware as fast as possible for every token -- memory bandwidth is the bottleneck, not compute clock speed.

**The SRE analogy:** CPU is your database server -- great at complex queries, one at a time. GPU is your CDN -- same operation, massively parallel, cache-reads at wire speed.

### VRAM: Why a 70B model needs 40-80GB of it

VRAM is the GPU's private memory. It is not RAM. Data in VRAM is what the GPU can actually operate on. Anything not in VRAM must be loaded over the PCIe bus, which kills performance by 10-100x.

A 70B parameter model has 70 billion numbers in it. Each number is stored in float16 (2 bytes), so the model itself is roughly:

```
70,000,000,000 x 2 bytes = 140 GB at full precision
```

With Q4 quantization (more on that below), it compresses to roughly 4 bits per parameter:

```
70,000,000,000 x 0.5 bytes = ~35-40 GB
```

Then add the KV cache (the model's working memory for long conversations) and you land at 40-80GB VRAM for a 70B model. This is why you need an A100 (80GB) or two consumer GPUs (2x RTX 4090 = 48GB) just to load it.

A 7B model quantized to Q4 fits on 8GB VRAM (a single RTX 3080). A 13B model needs ~10-12GB. A 34B model needs ~22-24GB. These are your practical budget tiers.

### Quantization: The trade-off that makes this affordable

Full-precision (float32) means 4 bytes per parameter. Half-precision (float16, bfloat16) means 2 bytes. Q8 quantization (8-bit integers) means 1 byte. Q4 means 4 bits, half a byte.

Quantization works because neural networks are surprisingly tolerant of numeric noise. The model was trained with precise numbers, but at inference time you can round those numbers aggressively with only minor quality degradation. Think of it like JPEG compression for AI weights -- you lose a little sharpness, but it is still obviously the same image.

In this architecture, the architecture file shows:
- Ollama defaults to Q4_K_M quantization automatically when you `ollama pull`
- `llama-server` lets you specify exactly: `llama3.3:70b-instruct-q4_K_M`
- vLLM uses FP8 quantization on H100s for optimal hardware utilization

Q4_K_M is the sweet spot. "K_M" means medium k-quant, which does mixed precision (some important layers stay at higher precision). It preserves ~98% of the full model quality while using ~28% of the memory.

### Training vs Inference: You are doing the cheap thing

**Training** is when you take a blank model and teach it everything it knows. This requires:
- Thousands of GPUs running for weeks or months
- Hundreds of terabytes of training data
- Hundreds of millions to billions of dollars
- Teams of 50-200 ML researchers

You are not doing this. OpenAI, Meta, Mistral, and Alibaba already did it for you.

**Inference** is when you take a trained model and ask it a question. This requires:
- One or two GPUs
- The model weights (downloaded once, ~40GB file)
- A laptop in a pinch (very slowly)

You are doing inference. The cost difference is roughly 1,000,000:1.

**LoRA fine-tuning** (the "learning loop" in the architecture) is a middle path. Instead of retraining the full model, you freeze all 70B weights and train only a tiny set of adapter weights (typically a few hundred MB). It is like adding a specialized plugin to the model rather than rebuilding it from scratch. This runs on a single A100 in hours. The architecture uses Unsloth for this.

### Why open-source models are free but running them is not

The model weights are free. Meta published Llama. Alibaba published Qwen. Mistral published Mistral. You download them like you download a Docker image.

What is not free is the hardware to run them. An NVIDIA A100 (80GB) costs $25,000 to buy or $1.29/hr to rent. An H100 costs $35,000 to buy or $2.49/hr to rent. The architecture's cost data shows a production ARIA deployment costs $1,858/month just for two A100s.

Software: $0. Electricity and GPUs: where the money goes.

---

## 2. The Component Stack Explained

The diagrams in `src/ArchDiagram.jsx` organize ARIA across 7 zones: Data Sources, Ingestion, Processing, Storage+Inference, Orchestration, Interface, and Learning Loop. LocalMind adds Clients, Gateway, Control Plane, Inference, Agentic, Knowledge, and Observability.

Here is every major component, in plain language.

---

### Kafka (Event Bus)

**What it does:** Kafka is a durable message queue on steroids. Every data source (Slack, Confluence, GitHub, CRM, PDF uploads) publishes JSON messages to Kafka. Everything downstream reads from Kafka. Nobody talks directly to anyone else.

**The SRE analogy:** It is your load balancer and message queue combined, but for data pipelines. Think of it as the async event bus in your monitoring stack -- like how your apps write metrics to a buffer before they get ingested. Kafka is that buffer, but durable, ordered, and replayable.

**Why you need it:** Without Kafka, every connector directly calls every downstream service. If the embedding engine crashes, documents are lost. If you add a new consumer (say, a second indexing pipeline), you have to modify every producer. Kafka decouples everything. If the embedder is down for 2 hours, the messages queue up and are processed when it comes back. No data loss.

**What breaks without it:** Your ingestion pipeline becomes brittle. A single downstream failure causes data loss. You cannot scale producers and consumers independently.

**Difficulty:** 4/10 to get running, 7/10 to operate at scale. The architecture uses KRaft mode (no ZooKeeper), which simplifies operations significantly. The docker-compose snippet in the code is the full config for a single-node dev setup.

**Can JC do this himself:** Yes. For ARIA MVP, a single Kafka node in KRaft mode is 15 lines of docker-compose. For production HA Kafka, hire someone or use Redpanda (a Kafka-compatible alternative that is simpler to operate).

**The command that makes it click:**
```bash
# After deploying, watch messages flow in real-time
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic raw-documents --from-beginning
```

---

### Qdrant (Vector Database)

**What it does:** Stores your text chunks as vectors (arrays of ~768 numbers) and answers "what chunks are semantically most similar to this query?" in milliseconds, across millions of documents.

**The SRE analogy:** It is like Elasticsearch, but instead of indexing keywords for full-text search, it indexes semantic meaning. Where Elasticsearch asks "does this document contain the word 'vacation'?", Qdrant asks "is this document semantically similar to 'time off request'?" -- and finds both "PTO form", "leave of absence policy", and "annual leave" even though none of them contain the word "vacation".

**Why you cannot just use PostgreSQL for everything:** PostgreSQL with pgvector can do this, and for small datasets (<500K vectors) it is a reasonable choice. But Qdrant's HNSW (Hierarchical Navigable Small World) index provides sub-millisecond search at millions of vectors where pgvector takes seconds. Qdrant also natively supports hybrid search (semantic + keyword + metadata filters combined), named collections for multi-tenant isolation, and sparse vectors. The architecture uses Qdrant for exactly these reasons.

**The setup:**
```bash
# That's it. One command, persistent volume, REST + gRPC ports.
docker run -p 6333:6333 -p 6334:6334 \
  -v ./qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

**Difficulty:** 3/10 to run, 6/10 to design collection schemas and query patterns correctly.

**Can JC do this himself:** Yes. Start with ChromaDB for prototyping (it runs in-process, zero infrastructure), graduate to Qdrant for production.

**The concept that makes it click:** A collection in Qdrant is the same as a table in PostgreSQL. Each row is a "point" -- a vector plus a JSON payload. You create a collection specifying the vector size (768 for nomic-embed-text) and distance metric (cosine), then upsert points and search. The HNSW index builds automatically.

---

### Embedding Models (Turning Text Into Numbers)

**What it does:** An embedding model is a neural network that reads text and outputs a fixed-length array of numbers (the "embedding" or "vector"). Similar texts produce similar vectors. The distance between vectors in this space corresponds to semantic similarity.

**The mental model:** Imagine a coordinate system where every possible meaning has a location. "Dog" is near "puppy" and "canine" and "pet" but far from "automobile". "How do I reset my password?" and "Forgotten credentials recovery process" land very close to each other because they mean the same thing. The embedding model is the translator that maps text into this coordinate space.

**Why this works:** The model was trained on billions of text pairs labeled as similar/dissimilar. It learned that a document about password resets and a document about credential recovery share the same "semantic neighborhood" even when they share no exact words. This is why semantic search beats keyword search for finding information in messy company knowledge bases where everyone describes the same thing differently.

**The critical rule in this architecture:** The embedding model you use to index your documents MUST be the same model you use to embed queries at search time. The code pins this in configuration:
```python
Settings.embed_model = OllamaEmbedding(model_name="nomic-embed-text")
```
Mixing models is the most common production mistake. If you re-embed with a different model, you must re-index everything.

**nomic-embed-text** (used in this architecture): 274MB, produces 768-dimensional vectors, runs on CPU, free. The best default for this use case.

**Difficulty:** 2/10 to use, 8/10 to evaluate and select the right model for your content type.

**Can JC do this himself:** Yes. `ollama pull nomic-embed-text`, call the API. Done.

---

### LLM Inference Servers: Ollama vs vLLM vs llama.cpp

These three serve the same purpose -- expose a model as an HTTP API -- but they target completely different scenarios.

**Ollama**
- Best for: Development, single-user deployment, Mac/Linux workstation
- What it handles: Automatic model management, GPU/CPU detection, model hot-swapping
- API: OpenAI-compatible on port 11434
- Concurrent users: 1-4 (sequential processing)
- Effort: 3 terminal commands and it works
- When to use: ARIA MVP, personal dev environment, evaluating models

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.3:70b-instruct-q4_K_M
# Done. You have a local LLM API.
```

**llama.cpp (llama-server)**
- Best for: Maximum performance on specific hardware, enterprise dedicated-tier in LocalMind
- What it handles: Fine-grained GPU layer control, Anthropic API compatibility natively
- Concurrent users: 4-16 (controlled batching)
- Effort: Build from source with CUDA, configure flags per model
- When to use: Enterprise LocalMind tenants who need isolated processes, when you need to run on non-standard hardware

The architecture code shows this for LocalMind's dedicated enterprise tier -- each enterprise tenant gets their own llama-server process with an exclusive GPU, so their tokens never share KV cache with another tenant.

**vLLM**
- Best for: High concurrency, multi-tenant shared inference (the LocalMind shared tier)
- What it handles: PagedAttention (GPU memory virtual memory), continuous batching, multi-LoRA (serve multiple tenant adapters simultaneously from one model)
- Concurrent users: 20-200+ (batched processing)
- Effort: pip install, one command to start, but needs NVIDIA GPU (no Mac support)
- When to use: Any time you have more than 5-10 concurrent users on the same GPU

**PagedAttention** (the vLLM innovation): Normal inference pre-allocates a fixed block of GPU memory per request for the KV cache. If a user sends a short message, most of that allocation is wasted. vLLM manages GPU memory like an OS manages virtual memory -- allocating KV cache in pages, only using what is needed. This is why vLLM gets 3-5x more concurrent users from the same GPU compared to naive serving.

**Decision tree:**
```
Building ARIA MVP alone?          -> Ollama
>10 concurrent users, NVIDIA GPU? -> vLLM
Enterprise tenant isolation?      -> llama-server per tenant
Apple Silicon / ROCm?             -> Ollama or llama-server
```

---

### RAG (Retrieval Augmented Generation)

**What it is:** RAG is the pattern that turns a generic LLM into a company-specific knowledge assistant. Instead of asking the LLM "what is our PTO policy?", you:
1. Embed the question into a vector
2. Search Qdrant for the 5 most relevant document chunks
3. Inject those chunks into the LLM's context window
4. Ask the LLM "given these documents, what is our PTO policy?"

**The SRE analogy:** RAG is the LLM equivalent of your on-call runbook system. The LLM is your team member. Without RAG, you give them no documentation and hope they know everything. With RAG, you give them the right page of the runbook before they answer. The retrieval step is your search engine finding the right runbook page.

**Why it beats fine-tuning for knowledge bases:** Fine-tuning bakes information into the model weights. This has two problems: (1) weights are expensive to update when your docs change, and (2) the model cannot cite its sources. RAG is dynamic -- your knowledge base can update in real-time and every answer comes with citations showing exactly which documents were used.

**The flow in this architecture:**
```
User query
  -> embed with nomic-embed-text
  -> search Qdrant (semantic + metadata filter)
  -> retrieve top-5 chunks
  -> inject into LlamaIndex prompt template
  -> call local Ollama/vLLM
  -> stream response via FastAPI WebSocket
  -> return answer with source citations
```

**The two quality levers:**
1. Chunking strategy (ARIA uses LangChain's RecursiveCharacterTextSplitter with 512 token chunks, 64 token overlap)
2. Retrieval strategy (pure vector search, or hybrid vector + keyword, or with reranking)

**Difficulty:** 6/10. Getting RAG working is easy. Getting it to return consistently high-quality answers for your specific content takes iteration.

**Can JC do this himself:** Yes. The LlamaIndex code in the architecture (roughly 15 lines) wires Qdrant + Ollama into a working RAG chat engine.

---

### LoRA Fine-Tuning

**What it is:** LoRA (Low-Rank Adaptation) is a technique to teach a model new behaviors without retraining it from scratch. You freeze all 70 billion existing weights and train only a small set of "adapter" matrices -- typically a few hundred MB total -- that modify the model's outputs.

**The analogy:** The base model is a USB stick with 70 billion songs. LoRA is a small adapter you plug in that modifies the playback characteristics. The songs are still there -- the adapter just changes the EQ, volume, and shuffle behavior. When you want to remove the adapter, the original model is untouched.

**When you need it (for ARIA):**
- The model starts getting company-specific terms and acronyms wrong
- You want the model to match your company's specific writing style
- After 3-6 months of collecting feedback data through Argilla

**When you do NOT need it:**
- In the first 6-12 months -- RAG with good chunking will cover 90% of quality issues
- If your company knowledge is mostly standard English with no domain jargon

**The practical setup in this architecture:**
- Argilla collects feedback (thumbs up/down on answers)
- Humans review and curate the good examples
- Unsloth runs LoRA training on a single A100 GPU overnight
- MLflow versions the adapter
- New adapter gets loaded into Ollama or vLLM

**Difficulty:** 8/10. Training itself is one script. The hard parts are: collecting enough quality training data (hundreds to thousands of examples), evaluating whether the fine-tuned model is actually better, and not introducing regressions. This is where you likely want specialist help.

**Can JC do this himself:** The training script in the code is ~15 lines with Unsloth. The judgment calls around when to fine-tune, how to evaluate quality, and how to avoid catastrophic forgetting -- those require ML experience.

---

### Kubernetes (K8s)

**What it does:** You already know what K8s does. The relevant question here is: when do you need it for this architecture?

**ARIA (internal chatbot): You likely do NOT need K8s.**
The architecture's cost data shows an ARIA MVP runs on two servers -- one GPU machine, one CPU machine. Docker Compose handles everything. K8s adds significant operational overhead that is not justified for a 50-100 person company deployment. Use K8s for ARIA only when you have multiple GPU nodes and need automated failover.

**LocalMind (multi-tenant SaaS): You absolutely need K8s.**
The architecture requires it for three specific reasons:
1. Per-enterprise-tenant dedicated pods with GPU resource limits (`nvidia.com/gpu: "1"` per pod)
2. Automatic container scheduling across your GPU node fleet
3. The NVIDIA GPU Operator, which automates GPU driver installation and resource quota management across the cluster

The Terraform code in the architecture provisions K8s namespaces per enterprise tenant -- each gets their own namespace with network policies that prevent cross-tenant communication at the kernel level.

**The NVIDIA GPU Operator** is a K8s-specific thing worth knowing: it is a custom controller that automatically installs NVIDIA drivers on new GPU nodes, configures the container runtime to pass GPU resources to pods, and enforces GPU resource quotas. Without it, managing GPU resources in K8s requires manual driver installation on every node. With it, adding a new GPU node to the cluster is automated.

**Difficulty for LocalMind:** 7/10 to operate, 9/10 to set up the GPU operator correctly the first time.

**Can JC do this himself:** JC knows K8s. The GPU-specific parts (NVIDIA GPU Operator, RuntimeClass for gVisor sandboxing) are new territory and worth 2-3 days of reading before touching production.

---

### Multi-Tenancy (The Hard Problem in LocalMind)

**What it is:** Multiple customers sharing the same infrastructure, but with complete data isolation between them.

**Why it is genuinely hard:** Every layer needs independent isolation:
- Qdrant: separate collections per tenant (named `t_<tenant_id>_docs`)
- PostgreSQL: separate schemas per tenant with separate connection roles
- MinIO: separate buckets per tenant with IAM policies
- vLLM: shared tier uses LoRA adapters to give different model personalities, but all tenants share the same KV cache space -- meaning you must never let prompt content bleed between requests
- Kubernetes: separate namespaces, separate network policies, separate GPU resource quotas for enterprise tier
- Agentic sandbox: separate gVisor containers per tenant session for code execution

**The most critical rule in the architecture code:**
```python
# Server-side namespace generation -- never trust client input
def collection_name(tenant_id: str, dtype: str) -> str:
    return f"t_{tenant_id}_{dtype}"  # e.g. "t_abc123_docs"
```

The namespace is ALWAYS generated server-side from a validated UUID. Never let user input form any part of a database or collection name. This is your first line of defense against tenant data leakage.

**The data breach scenario:** If you store tenant A's docs in collection `t_a_docs` and tenant B's docs in `t_b_docs`, but there is a code path where tenant B's API key somehow calls search against `t_a_docs`, tenant B reads tenant A's proprietary code. This is not a bug -- it is a data breach and a contract termination. The architecture enforces this at every layer precisely because the consequences of getting it wrong are business-ending.

**Difficulty:** 8/10. Getting the isolation patterns right requires careful design. Every abstraction layer needs to think about tenant context injection. The code in the architecture (Kong injecting `X-Tenant-ID` headers, router reading plan from Redis, collection namespacing) shows the full pattern.

---

## 3. The Hiring Guide

### If you hire ONE engineer to build ARIA

**Job title:** ML Infrastructure Engineer (also called: AI Platform Engineer, LLM DevOps Engineer)

**Must-have skills:**
- Python: async Python specifically (asyncio, FastAPI, httpx) -- the entire inference layer and RAG orchestration is async
- Docker + Docker Compose: the entire ARIA stack is containerized
- LLM frameworks: real hands-on experience with LlamaIndex OR LangChain, not just "I've read the docs"
- Vector databases: has actually deployed and queried Qdrant, Chroma, or pgvector in a real project, not just a tutorial
- Embedding pipeline: has built a document ingestion pipeline that goes raw text -> chunks -> embeddings -> vector store
- Linux system administration: will be managing GPU servers, not cloud-click-ops

**Nice-to-have skills:**
- Experience with Kafka or any message queue in production
- K8s experience (needed if ARIA grows to multiple GPU nodes)
- Experience with Ollama or vLLM specifically
- Fine-tuning experience with LoRA/QLoRA (needed for the learning loop)
- Keycloak or any OIDC/LDAP integration experience

**Interview questions that test real knowledge:**
1. "Walk me through what happens between when a user types a question and when your RAG system returns an answer -- step by step, at the code level."
   (Good answer describes: embed query, vector search, chunk retrieval, prompt construction, LLM call, response parsing. Bad answer is vague about any step.)

2. "You have a 70B model on a 40GB VRAM GPU and you are getting CUDA out of memory errors at 4-bit quantization. What do you do?"
   (Good answer: reduce context window size, reduce max batch size, try Q3 quantization, split across two GPUs with tensor parallelism. Bad answer: "upgrade the GPU.")

3. "Your RAG system returns irrelevant chunks for a specific category of questions. Walk me through how you diagnose and fix it."
   (Good answer covers: examine chunk content, check chunk size, inspect metadata filters, evaluate embedding model fit for domain, consider hybrid search or reranking. Bad answer jumps straight to "fine-tune the model.")

4. "What is the difference between vLLM's continuous batching and Ollama's request handling, and when does it matter?"
   (Good answer: continuous batching processes new requests mid-batch without waiting for the current batch to complete; Ollama processes sequentially. Matters when you have >5 concurrent users and latency SLAs.)

5. "If I asked you to add Kafka to an existing Docker Compose stack of 5 services, what would you change and what would you watch out for?"
   (Good answer: add Kafka service, update producers to use kafka-python client, add consumer services, think about message schema versioning, retention policy, and consumer group offsets. Bad answer does not mention schema or consumer groups.)

**Red flags in candidates:**
- Claims to "know" RAG but cannot explain what happens to the user's query before it hits the LLM
- Has only used OpenAI/Anthropic APIs, never run a local model
- Talks about training when you specifically said inference
- Cannot explain what VRAM is or why it matters
- "I used LangChain in a Jupyter notebook once" as production experience
- Immediately reaches for Kubernetes for a single-server deployment

**Expected salary range (US market, 2025-2026):**
- $150,000 - $200,000 base for a strong senior engineer with 4+ years relevant experience
- $120,000 - $150,000 for someone with strong Python/DevOps background transitioning into AI infra (3-6 month ramp time)
- Contract rate: $120-$175/hr (this aligns with the $150/hr used in the architecture's cost estimates)

---

### If you hire a MINIMUM VIABLE TEAM for LocalMind

**Engineer 1: ML Infrastructure Engineer (as above)**
Owns: inference servers (vLLM, llama-server), embedding pipeline, Qdrant, model management, LoRA fine-tuning pipeline.

**Engineer 2: Backend/Platform Engineer**
Must-have: Python FastAPI, PostgreSQL, Redis, multi-tenant SaaS patterns, billing API integration (Stripe), Kafka or message queues.
Owns: Kong gateway, control plane (tenant registry, Stripe webhooks), ClickHouse usage metering, per-tenant data isolation, API design.

**Engineer 3 (Phase 2 -- can hire after MVP): DevOps/Platform Engineer**
Must-have: Kubernetes, Helm, Terraform, NVIDIA GPU Operator, security hardening (gVisor, network policies).
Owns: K8s cluster, automated tenant provisioning, CI/CD, observability stack (Grafana, Prometheus, Langfuse), sandboxed execution environment.

The architecture's cost data estimates LocalMind MVP at $75,000-$120,000 in build costs (500-800 engineer-hours at $150/hr) over 3-5 months with this kind of team. That tracks.

You can start with Engineers 1 and 2 and contract Engineer 3's work for the K8s/GPU setup, then hire them full-time once you have revenue.

---

## 4. The Learning Path

### Path A: Build the ARIA MVP yourself

JC's current state: senior SRE, knows Docker + K8s + Python basics. Gap: LLM concepts, RAG, embedding pipelines, local inference servers.

**Phase 1: Local LLM Fundamentals (1-2 weeks)**

Goal: Run a model locally, understand what you are looking at.

Step 1: Install Ollama and run your first model.
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2:3b     # small model, fast, good for learning
ollama run llama3.2:3b      # interactive chat
```

Step 2: Hit the API directly. Understand the request/response structure.
```bash
curl http://localhost:11434/api/chat \
  -d '{"model":"llama3.2:3b","messages":[{"role":"user","content":"hi"}]}'
```

Step 3: Read the vLLM docs on PagedAttention (15 min read, gives you the mental model for GPU memory). https://docs.vllm.ai/en/latest/design/architecture.html

**Time: 4-6 hours of actual hands-on time, spread over a week.**

Resources:
- Ollama docs: https://github.com/ollama/ollama
- "Practical Guide to LLM Serving" (vLLM blog): https://blog.vllm.ai/2023/06/20/vllm.html

What to build at this step: A Python script that calls Ollama and streams a response to your terminal.

---

**Phase 2: Embedding + Vector Search (1-2 weeks)**

Goal: Understand what embeddings are by building a tiny semantic search engine from scratch.

Step 1: Pull nomic-embed-text via Ollama. Embed 10 sentences. Print the vectors.
```bash
ollama pull nomic-embed-text
```
```python
import httpx, json
r = httpx.post("http://localhost:11434/api/embeddings",
    json={"model":"nomic-embed-text","prompt":"what is our vacation policy?"})
print(r.json()["embedding"][:5])  # prints first 5 of 768 numbers
```

Step 2: Deploy Qdrant locally. Index those 10 sentences. Search.
```bash
docker run -p 6333:6333 qdrant/qdrant
```

Step 3: Compute cosine similarity between two vectors manually. Understand why similar texts give similar vectors.

**Time: 1 week**

Resources:
- "Embeddings: What they are and why they matter" (Simon Willison): https://simonwillison.net/2023/Oct/23/embeddings/
- Qdrant Quickstart: https://qdrant.tech/documentation/quickstart/

What to build at this step: A Python script that takes a folder of text files, embeds all of them into Qdrant, and lets you search them with a query string.

---

**Phase 3: RAG Pipeline (2-3 weeks)**

Goal: Wire Qdrant + Ollama into a working chatbot that answers questions from your own documents.

This is the payoff phase. Everything you built in Phases 1 and 2 comes together.

Step 1: Work through the LlamaIndex RAG tutorial with your local Ollama + Qdrant setup.

Step 2: Build a pipeline that:
- Reads a folder of PDFs (use PyMuPDF: `pip install pymupdf`)
- Chunks them with LangChain's RecursiveCharacterTextSplitter
- Embeds each chunk via Ollama
- Stores vectors in Qdrant
- Answers questions using LlamaIndex chat engine

Step 3: Add FastAPI with a simple streaming endpoint. Test with curl.

**Time: 2-3 weeks**

Resources:
- LlamaIndex Starter Tutorial (local models section): https://docs.llamaindex.ai/en/stable/getting_started/starter_example_local/
- "RAG from scratch" (LangChain YouTube series): search "langchain rag from scratch" -- 15-minute videos, each covers one concept

What to build at this step: A CLI chatbot that answers questions about a folder of your own documents. This IS ARIA without the data connectors and UI.

---

**Phase 4: Connectors + Kafka (2-3 weeks)**

Goal: Pull real data from Slack and Confluence, normalize it, flow it through Kafka.

Step 1: Deploy Kafka in KRaft mode using the docker-compose config from the architecture code. Send 10 test messages. Consume them.

Step 2: Build the Slack connector. The Bolt SDK code in the architecture is the complete working connector. Add your Slack tokens and run it.

Step 3: Build a Kafka consumer that reads from the `raw-documents` topic and feeds the chunking + embedding pipeline from Phase 3.

**Time: 2-3 weeks (Kafka setup is 2 days; connector code is the bulk of the time)**

Resources:
- Kafka KRaft quickstart: https://kafka.apache.org/quickstart
- Slack Bolt SDK Python: https://slack.dev/bolt-python/

What to build at this step: A pipeline where you send a Slack message and it appears in your searchable knowledge base within seconds.

---

**Phase 5: Interface + Auth (1-2 weeks)**

Goal: Deploy Open WebUI pointing at your RAG API, with Keycloak SSO.

This is the layer you know best as an SRE -- it is nginx, Docker, and OAuth. The only unfamiliar part is Keycloak.

Step 1: Deploy Open WebUI via docker-compose pointing at your RAG FastAPI backend.
Step 2: Configure Keycloak with a local user. Wire Open WebUI to use it for login.
Step 3: Add Nginx as the front door with TLS.

**Time: 1-2 weeks**

Resources:
- Open WebUI documentation: https://docs.openwebui.com/
- Keycloak Getting Started: https://www.keycloak.org/getting-started/getting-started-docker

What to build at this step: A working internal chatbot accessible at `https://aria.yourcompany.internal`, login with company credentials, answers from your Slack + Confluence data.

**Total learning time for ARIA MVP: 8-12 weeks of part-time study + building.**
You are now dangerous enough to build ARIA. Not a day earlier -- each phase builds on the previous one and there are no shortcuts.

---

### Path B: Evaluate and manage an engineer building LocalMind

LocalMind is significantly more complex than ARIA. Your goal here is not to build it yourself but to be a credible technical manager and reviewer.

**What you need to understand to manage the engineer:**

**The multi-tenancy isolation patterns.** Read the Per-Tenant Knowledge Layer section of this document until you can explain server-side namespace generation in your sleep. When reviewing code, look for: any string from user input touching a collection or schema name, any query that does not scope to tenant_id, any vector search without tenant isolation.

**The vLLM shared tier and what PagedAttention means for cost.** Understand that the shared tier's economics depend on concurrent request batching. If the engineer configures low concurrency limits, you are leaving money on the table (fewer tenants per GPU, higher cost per tenant).

**The gateway layer (Kong).** You know API gateways. Kong is your load balancer and auth middleware combined. The critical thing: every request must carry X-Tenant-ID downstream. If the engineer is doing tenant lookup per-request in every service instead of centralizing it in Kong, that is a design smell.

**The LoRA allowlist pattern.** In the inference router code, shared-tier tenants can only load adapters from a pre-approved list. This prevents a tenant from loading an arbitrary adapter that could exfiltrate other tenants' cached context. Review any PR that modifies the allowlist.

**Observability.** You know Prometheus + Grafana. Langfuse is new. Ask the engineer to show you a full trace in Langfuse for a real request -- from user query to retrieved chunks to LLM response. If they cannot do this, the observability is incomplete.

**Resources for Path B (2-3 weeks reading, not building):**
- "Patterns for building LLM-based systems" (Eugene Yan): https://eugeneyan.com/writing/llm-patterns/
- vLLM production deployment guide: https://docs.vllm.ai/en/latest/serving/deploying_with_kubernetes.html
- "Multi-tenant AI: the isolation problem" -- search for blog posts on Weaviate, Qdrant, or Pinecone's own engineering blogs on this topic

---

## 5. The 5 Aha Moments

These are the concepts that, when they click, make every other piece of the architecture make sense.

### Aha Moment 1: The LLM is stateless -- RAG is its memory

A raw LLM knows nothing about your company and forgets everything between requests. It is a pure function: prompt in, completion out. Zero persistence.

RAG is the architecture pattern that gives it memory. Every time a question comes in, you retrieve the relevant pages from your knowledge base and inject them into the context window as if the model just read them. The model then answers with that context in front of it.

This means: the quality of your answers is mostly determined by the quality of your retrieval, not the size of your model. A 7B model with perfect retrieval often beats a 70B model with poor retrieval. The vector database and chunking strategy matter more than which model you pick.

Once you get this, you understand why the architecture invests so heavily in Kafka, chunking, embedding, and Qdrant -- all of that complexity is in service of getting the right document in front of the model at the right time.

### Aha Moment 2: The "zero egress boundary" is a property, not a technology

There is no single component that enforces zero egress. It is an emergent property of the entire architecture: every component that processes sensitive data runs on-premises, and there are no API calls to external services anywhere in the inference path.

Slack events come in, but nothing goes out. Confluence pages are indexed locally, but the indexes never leave. User queries hit the local LLM, and responses come back -- no OpenAI, no Anthropic, no external model API.

The boundary in the diagram is a design intention enforced by configuration: `ANTHROPIC_BASE_URL=http://localhost:8080`. That one environment variable is the difference between zero-egress and regular AI. Two lines of config, and you swap between local and cloud inference. The architecture is designed so this switch requires zero code changes anywhere -- just env vars.

### Aha Moment 3: vLLM's PagedAttention is why multi-tenant shared inference is economically viable

Without PagedAttention, serving 10 concurrent users from a single A100 GPU is wasteful because each request pre-allocates a fixed block of GPU memory for its KV cache. If a request uses only 30% of its allocation, the other 70% sits idle, unavailable to other requests.

PagedAttention manages GPU memory the same way your OS manages RAM -- with virtual memory paging. KV cache is allocated in pages, only as needed, and freed immediately when a request completes. This alone gives vLLM 2-4x the throughput of naive serving on the same hardware.

For LocalMind's economics: the shared tier (starter/pro tenants) sits on a vLLM instance. More throughput from the same GPU = lower cost per tenant = better margins. The entire multi-tenant pricing model is only viable if the shared tier can serve many tenants efficiently.

### Aha Moment 4: LoRA adapters are the mechanism that lets one model serve many personalities

In LocalMind, every tenant can have their own fine-tuned model behavior without running a separate model per tenant. The base model (say, Qwen3) is loaded once into GPU memory. Multiple LoRA adapters (small files, ~200-500MB each) are loaded alongside it. At inference time, vLLM's multi-LoRA support swaps the active adapter per request.

Tenant A (a legal firm) gets the `legal-v1` adapter: precise, citation-heavy, formal tone.
Tenant B (a startup) gets the `code-v1` adapter: concise, code-focused, modern idioms.
Tenant C uses the base model with no adapter.

All three share the same GPU memory for the base weights. The adapters are tiny deltas on top. This is why LocalMind can offer tenant-specific model personalities at the starter/pro tier without the economics of dedicated GPU per tenant.

### Aha Moment 5: The real product in LocalMind is the isolation layer, not the LLM

The LLM is a commodity. Meta gives Llama away free. Alibaba gives Qwen away free. Any developer can download a model in 10 minutes.

What is not a commodity: the entire infrastructure that makes running that model safe for multiple organizations simultaneously, at production reliability, with billing, audit trails, PII protection, sandboxed code execution, and regulatory compliance.

The architecture's agentic layer (gVisor sandboxed containers, per-tenant network isolation, MCP tool protocol) -- that is not available anywhere for free. The multi-tenant Qdrant namespacing with server-side enforcement -- that pattern takes weeks to design correctly. The ClickHouse usage metering feeding Stripe -- that is custom infrastructure.

When JC reads the XDA article about running Claude Code locally and thinks "I want to productize this" -- the insight is not "I will run Qwen3 for customers." The insight is "I will build the infrastructure that makes it safe, compliant, observable, and reliable for enterprises to run agentic AI on their own data." That infrastructure is LocalMind, and it is a real moat.

---

## Quick Reference: Architecture Cost Data

From the cost data embedded in `ArchitectureDeepDive.jsx`:

**ARIA MVP (50-100 person company)**
- Cloud: ~$1,875/mo + $15,000 setup
- Bare metal: ~$1,807/mo + $15,000 setup + $3,500 GPU (RTX 4090)
- Hardware: 1x RTX 4090 GPU server + 1x CPU server (8 vCPU, 32GB RAM)
- Software: $0 (all open-source: Apache 2.0, MIT, BSD)
- Human: $12,000-$18,000 setup, $1,200-$1,800/mo maintenance

**ARIA Production (500-5,000 person enterprise)**
- Cloud: ~$7,500-$9,000/mo + $40,000 setup
- Bare metal: ~$6,200-$8,700/mo + $40,000 setup + $55,000-$70,000 hardware
- Hardware: 2x A100 80GB (HA pair) + 1x L40S (embedding/fine-tune) + 3x CPU cluster nodes

**LocalMind MVP (5-10 tenants)**
- Cloud: ~$8,900/mo + $100,000 initial build (500-800 engineer-hours over 3-5 months)
- Hardware: 1x A100 80GB (vLLM shared tier) + API/control plane server + observability server

**LocalMind Production (100+ tenants)**
- Cloud: ~$36,000/mo + $375,000 initial build (2,000-3,000 hours, 6-9 months, 2-3 engineers)
- Hardware: 4x A100 (shared tier) + 4x L40S (pro tier isolated) + 4x H100 (enterprise dedicated) + K8s CPU cluster + sandbox pool

---

*Generated from source: `/Users/primo/Experiments/Repos/zero-egress/src/ArchitectureDeepDive.jsx` and `src/ArchDiagram.jsx`*
