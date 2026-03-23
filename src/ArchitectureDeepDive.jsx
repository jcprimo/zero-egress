import { useState, useEffect } from "react";

const G = {
  bg: "#07090f", surface: "#0c1018", card: "#101520", border: "#182030",
  borderHover: "#243550", text: "#d0dff0", muted: "#4a6280", faint: "#1a2535",
  cyan: "#00d4ff", purple: "#a855f7", green: "#22d3a0", amber: "#f59e0b",
  red: "#f87171", blue: "#60a5fa",
};

const css = `
*{box-sizing:border-box;margin:0;padding:0;}
body{background:${G.bg};color:${G.text};font-family:'DM Sans',sans-serif;}
.root{max-width:1100px;margin:0 auto;padding:40px 32px 60px;}
.hero{padding:32px 0 28px;border-bottom:1px solid ${G.border};margin-bottom:28px;}
.hero-tag{font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:4px;color:${G.cyan};text-transform:uppercase;margin-bottom:12px;}
.hero h1{font-family:'Syne',sans-serif;font-size:36px;font-weight:800;color:#e8f2ff;line-height:1.2;margin-bottom:10px;}
.hero p{font-size:15px;color:${G.muted};max-width:620px;line-height:1.6;}
.arch-tabs{display:flex;gap:3px;margin-bottom:28px;background:${G.surface};padding:4px;border-radius:10px;border:1px solid ${G.border};}
.arch-tab{flex:1;padding:11px 14px;border-radius:7px;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;color:${G.muted};}
.t-cyan{background:linear-gradient(135deg,#002535,#004060)!important;color:${G.cyan}!important;box-shadow:0 0 24px rgba(0,212,255,.12)!important;}
.t-purple{background:linear-gradient(135deg,#1e0a35,#350a60)!important;color:${G.purple}!important;box-shadow:0 0 24px rgba(168,85,247,.12)!important;}
.arch-intro{border-radius:12px;padding:18px 22px;margin-bottom:24px;font-size:15px;line-height:1.7;}
.ai-cyan{background:rgba(0,212,255,.04);border:1px solid rgba(0,212,255,.18);}
.ai-purple{background:rgba(168,85,247,.04);border:1px solid rgba(168,85,247,.18);}
.ai-strong-cyan{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;display:block;margin-bottom:6px;color:${G.cyan};}
.ai-strong-purple{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;display:block;margin-bottom:6px;color:${G.purple};}
.sec-label{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${G.muted};margin:28px 0 14px;display:flex;align-items:center;gap:10px;}
.sec-label::after{content:'';flex:1;height:1px;background:${G.border};}
.layer-card{border:1px solid ${G.border};border-radius:12px;margin-bottom:10px;overflow:hidden;transition:border-color .2s;}
.layer-header{display:flex;align-items:center;gap:12px;padding:16px 22px;cursor:pointer;background:${G.card};user-select:none;}
.layer-num{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:600;padding:4px 9px;border-radius:6px;flex-shrink:0;}
.layer-title-wrap{flex:1;}
.layer-name{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#d8eaf8;margin-bottom:2px;}
.layer-subtitle{font-size:13px;color:${G.muted};}
.layer-arrow{font-size:14px;color:${G.muted};transition:transform .2s;flex-shrink:0;}
.layer-arrow.open{transform:rotate(180deg);}
.layer-body{background:${G.surface};border-top:1px solid ${G.border};padding:24px 24px;}
.sub-section{margin-bottom:22px;}
.sub-label{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px;color:inherit;}
.what-box{background:${G.faint};border-radius:8px;padding:14px 16px;font-size:14px;line-height:1.75;color:#a8c0d8;}
.impl-steps{display:flex;flex-direction:column;}
.impl-step{display:flex;gap:14px;align-items:flex-start;}
.impl-connector{display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:28px;}
.impl-dot{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:600;flex-shrink:0;}
.impl-line{width:2px;flex:1;min-height:16px;}
.impl-content{padding:2px 0 20px;flex:1;}
.impl-title{font-size:14px;font-weight:700;color:#c8dff0;margin-bottom:5px;font-family:'Syne',sans-serif;}
.impl-desc{font-size:13px;color:${G.muted};line-height:1.65;}
.code-block{background:#060a10;border:1px solid ${G.border};border-radius:8px;padding:13px 15px;font-family:'IBM Plex Mono',monospace;font-size:12px;color:#7ab8d4;line-height:1.75;overflow-x:auto;margin-top:9px;white-space:pre;}
.tools-grid{display:flex;flex-direction:column;gap:9px;}
.tool-card{background:${G.faint};border:1px solid ${G.border};border-radius:8px;padding:13px 15px;}
.tool-header{display:flex;align-items:center;gap:8px;margin-bottom:7px;flex-wrap:wrap;}
.tool-name{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#d8eaf8;}
.tool-role{font-family:'IBM Plex Mono',monospace;font-size:10px;padding:2px 7px;border-radius:4px;letter-spacing:1px;}
.tool-what{font-size:13px;color:${G.muted};line-height:1.6;margin-bottom:7px;}
.tool-why{font-size:13px;color:#2a5040;padding:8px 11px;background:rgba(34,211,160,.05);border-radius:6px;border-left:2px solid rgba(34,211,160,.35);line-height:1.6;}
.tool-why b{color:#22d3a0;}
.footer-bar{margin-top:32px;padding:14px 18px;background:${G.surface};border-radius:10px;border:1px solid ${G.border};font-family:'IBM Plex Mono',monospace;font-size:11px;color:${G.muted};text-align:center;letter-spacing:2px;text-transform:uppercase;}
`;

const ARCH1 = [
  {
    name:"Data Ingestion & Connector Layer",subtitle:"Pulls everything your company knows into one unified pipeline",
    accent:G.cyan,abg:"rgba(0,212,255,.15)",
    what:`This is the data-hungry mouth of your system — it continuously pulls raw content from every source your company produces knowledge in. Think of it as a set of always-on pipes that connect Slack, Confluence, GitHub, your CRM, PDF uploads, and your app's own config into a single normalized stream. Without this layer, your chatbot is deaf to everything happening in your organization. The job here is NOT to understand the data — it's to collect it reliably, tag it with metadata (source, author, date, type), and pass it downstream without loss or duplication. Every connector either listens for real-time events via webhooks or polls on a schedule. All output flows into a central event bus before anything downstream touches it. Raw documents are also stored in MinIO for reindexing if the embedding model or chunking strategy changes.`,
    steps:[
      {title:"Deploy Apache Kafka as the central event bus",desc:"Every data source publishes events to a Kafka topic. This decouples your connectors from your processing pipeline — if the embedding engine is down, messages queue up and nothing is lost. Kafka guarantees message ordering and durability across restarts.",
       code:`<span style="color:#2a4a60"># docker-compose.yml — Kafka KRaft mode (no ZooKeeper)</span>
<span style="color:#00d4ff">services</span>:
  <span style="color:#00d4ff">kafka</span>:
    <span style="color:#00d4ff">image</span>: <span style="color:#f59e0b">confluentinc/cp-kafka:7.8.0</span>
    <span style="color:#00d4ff">environment</span>:
      KAFKA_NODE_ID: <span style="color:#22d3a0">1</span>
      KAFKA_PROCESS_ROLES: <span style="color:#f59e0b">broker,controller</span>
      KAFKA_CONTROLLER_QUORUM_VOTERS: <span style="color:#f59e0b">1@kafka:29093</span>
      KAFKA_LISTENERS: <span style="color:#f59e0b">PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:29093</span>
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: <span style="color:#f59e0b">PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT</span>
      KAFKA_INTER_BROKER_LISTENER_NAME: <span style="color:#f59e0b">PLAINTEXT</span>
      KAFKA_CONTROLLER_LISTENER_NAMES: <span style="color:#f59e0b">CONTROLLER</span>
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: <span style="color:#22d3a0">true</span>
      CLUSTER_ID: <span style="color:#f59e0b">MkU3OEVBNTcwNTJENDM2Qk</span>
    <span style="color:#00d4ff">ports</span>: [<span style="color:#f59e0b">"9092:9092"</span>]`},
      {title:"Build a connector for each data source",desc:"Each connector is a small service that authenticates with the source API, listens for changes via webhook or polling, and publishes a normalized JSON payload to a Kafka topic called 'raw-documents'.",
       code:`<span style="color:#2a4a60"># Slack connector — real-time event stream</span>
<span style="color:#00d4ff">from</span> slack_bolt <span style="color:#00d4ff">import</span> App
<span style="color:#00d4ff">from</span> kafka <span style="color:#00d4ff">import</span> KafkaProducer
<span style="color:#00d4ff">import</span> json

producer = KafkaProducer(bootstrap_servers=<span style="color:#f59e0b">'localhost:9092'</span>)
app = App(token=SLACK_TOKEN, signing_secret=SLACK_SECRET)

<span style="color:#00d4ff">@app.event</span>(<span style="color:#f59e0b">"message"</span>)
<span style="color:#00d4ff">def</span> on_message(event):
    producer.send(<span style="color:#f59e0b">'raw-documents'</span>, json.dumps({
        <span style="color:#f59e0b">"source"</span>: <span style="color:#f59e0b">"slack"</span>, <span style="color:#f59e0b">"text"</span>: event[<span style="color:#f59e0b">"text"</span>],
        <span style="color:#f59e0b">"author"</span>: event[<span style="color:#f59e0b">"user"</span>], <span style="color:#f59e0b">"ts"</span>: event[<span style="color:#f59e0b">"ts"</span>],
        <span style="color:#f59e0b">"doc_type"</span>: <span style="color:#f59e0b">"message"</span>
    }).encode())`},
      {title:"Standardize every document to a shared schema",desc:"No matter the source, every document entering the pipeline is normalized to the same JSON shape so downstream layers need zero source-specific logic.",
       code:`<span style="color:#2a4a60"># Universal normalized document schema</span>
{
  <span style="color:#f59e0b">"doc_id"</span>:    <span style="color:#f59e0b">"uuid-v4"</span>,
  <span style="color:#f59e0b">"source"</span>:    <span style="color:#f59e0b">"slack|confluence|github|crm|pdf"</span>,
  <span style="color:#f59e0b">"content"</span>:   <span style="color:#f59e0b">"cleaned text content"</span>,
  <span style="color:#f59e0b">"metadata"</span>: {
    <span style="color:#f59e0b">"author"</span>:     <span style="color:#f59e0b">"string"</span>,
    <span style="color:#f59e0b">"created_at"</span>: <span style="color:#f59e0b">"ISO8601"</span>,
    <span style="color:#f59e0b">"url"</span>:        <span style="color:#f59e0b">"original source link"</span>,
    <span style="color:#f59e0b">"doc_type"</span>:   <span style="color:#f59e0b">"wiki|message|ticket|code|manual"</span>,
    <span style="color:#f59e0b">"tags"</span>:       [<span style="color:#f59e0b">"array of labels"</span>]
  }
}`},
    ],
    tools:[
      {name:"Apache Kafka",role:"EVENT BUS",what:"A distributed message streaming platform that acts as the backbone decoupling data producers (connectors) from consumers (processors). Stores messages durably on disk with configurable retention. Multiple consumers can read the same stream independently without affecting each other.",why:"Without Kafka, every connector would need to directly call every downstream service — a fragile web of dependencies. Kafka makes the pipeline resilient and horizontally scalable. If the embedding engine crashes, Kafka holds messages until it recovers."},
      {name:"n8n (self-hosted)",role:"NO-CODE ORCHESTRATION",what:"An open-source workflow automation tool with 300+ pre-built integrations covering Confluence, HubSpot, Notion, Google Drive, Zendesk, and more. Provides a visual drag-and-drop editor. Critical feature: fully self-hostable, so your data never touches n8n's cloud servers.",why:"Saves weeks of custom connector code for common tools. Non-engineering teams (ops, HR, support) can build and maintain their own data flows without touching the codebase."},
      {name:"Unstructured.io",role:"DOCUMENT PARSER",what:"Extracts clean structured text from real-world messy formats: scanned PDFs with OCR, multi-column layouts, PowerPoint slides, Word docs, HTML pages, Excel tables, and more. Uses computer vision and layout analysis to correctly reconstruct document structure.",why:"Most company knowledge lives in PDFs and Office docs. Naive PDF parsers extract garbled text from complex layouts. Unstructured.io is the difference between indexing 90% of your content versus 50%."},
    ]
  },
  {
    name:"Chunking & Preprocessing Pipeline",subtitle:"Splits raw documents into semantic units an LLM can actually reason over",
    accent:G.green,abg:"rgba(34,211,160,.15)",
    what:`Raw documents are too long to feed into an LLM as-is. A 40-page technical manual can't fit in a single context window, and a 500-message Slack thread is mostly noise. This layer solves that by intelligently splitting content into chunks — small enough to fit in context, large enough to be semantically meaningful on their own. It also cleans the raw text (strips HTML tags, removes boilerplate footers, normalizes whitespace), deduplicates content so the same Confluence page doesn't get indexed 50 times, and attaches rich metadata to every chunk so retrieval knows exactly where information came from. Chunk size and overlap are tuning levers that directly impact answer quality — too small and chunks lose context, too large and retrieval becomes imprecise.`,
    steps:[
      {title:"Choose chunking strategy by content type",desc:"Different content needs different splitting logic. Prose splits at paragraph/sentence boundaries with overlap. Code splits at function/class boundaries. Conversations split by thread or time window.",
       code:`<span style="color:#00d4ff">from</span> langchain.text_splitter <span style="color:#00d4ff">import</span> (
    RecursiveCharacterTextSplitter,
    MarkdownHeaderTextSplitter,
    PythonCodeTextSplitter
)
<span style="color:#2a4a60"># Prose: wikis, PDFs, manuals</span>
prose = RecursiveCharacterTextSplitter(
    chunk_size=<span style="color:#22d3a0">512</span>, chunk_overlap=<span style="color:#22d3a0">64</span>,
    separators=[<span style="color:#f59e0b">"\n\n"</span>, <span style="color:#f59e0b">"\n"</span>, <span style="color:#f59e0b">". "</span>, <span style="color:#f59e0b">" "</span>]
)
<span style="color:#2a4a60"># Code: respects function/class boundaries</span>
code = PythonCodeTextSplitter(chunk_size=<span style="color:#22d3a0">800</span>)
<span style="color:#2a4a60"># Markdown: preserves heading hierarchy as metadata</span>
md = MarkdownHeaderTextSplitter(headers_to_split_on=[
    (<span style="color:#f59e0b">"#"</span>,<span style="color:#f59e0b">"h1"</span>),(<span style="color:#f59e0b">"##"</span>,<span style="color:#f59e0b">"h2"</span>),(<span style="color:#f59e0b">"###"</span>,<span style="color:#f59e0b">"h3"</span>)])`},
      {title:"Clean text and attach metadata to every chunk",desc:"Strip HTML, normalize whitespace, deduplicate via SHA256 hash fingerprinting, and tag every chunk with its provenance. Metadata enables filtered retrieval later.",
       code:`<span style="color:#00d4ff">import</span> hashlib
<span style="color:#00d4ff">from</span> bs4 <span style="color:#00d4ff">import</span> BeautifulSoup

<span style="color:#00d4ff">def</span> build_chunks(doc, splitter):
    text = BeautifulSoup(doc[<span style="color:#f59e0b">"content"</span>], <span style="color:#f59e0b">"html.parser"</span>).get_text()
    chunks = splitter.split_text(text)
    <span style="color:#00d4ff">return</span> [{
        <span style="color:#f59e0b">"text"</span>: c,
        <span style="color:#f59e0b">"hash"</span>: hashlib.sha256(c.encode()).hexdigest()[:16],
        <span style="color:#f59e0b">"metadata"</span>: doc[<span style="color:#f59e0b">"metadata"</span>] | {<span style="color:#f59e0b">"chunk_index"</span>: i}
    } <span style="color:#00d4ff">for</span> i, c <span style="color:#00d4ff">in</span> enumerate(chunks) <span style="color:#00d4ff">if</span> len(c) > <span style="color:#22d3a0">50</span>]`},
    ],
    tools:[
      {name:"LangChain Text Splitters",role:"CHUNKING ENGINE",what:"A collection of battle-tested text splitting algorithms. RecursiveCharacterTextSplitter respects natural text boundaries (paragraphs → sentences → words) rather than blindly cutting at a character limit. Includes specialized splitters for Python, JavaScript, Markdown, HTML, LaTeX, and JSON.",why:"Naive character splitting cuts sentences mid-thought, destroying semantic meaning. LangChain's splitters preserve coherent units which directly improves downstream retrieval quality — better chunks = better answers."},
      {name:"spaCy",role:"NLP PREPROCESSING",what:"Industrial-strength NLP library providing sentence boundary detection, named entity recognition, part-of-speech tagging, and text classification. Used to enforce linguistically correct split points and extract key entities as metadata for enriched filtering.",why:"Ensures splits happen at natural linguistic boundaries — not arbitrary positions. Entity extraction enriches chunk metadata so you can filter by 'chunks mentioning product X' or 'chunks by author Y'."},
      {name:"PostgreSQL",role:"METADATA STORE",what:"Stores the metadata record for every indexed chunk: source URL, author, creation date, content type, and its SHA256 deduplication hash alongside the Qdrant vector ID. Enables complex filtered queries that vector databases handle poorly.",why:"Vector databases excel at similarity search but aren't optimized for relational metadata queries. PostgreSQL fills the gap — 'find all chunks from Confluence written after Jan 2025 tagged as engineering specs'."},
    ]
  },
  {
    name:"Embedding Engine (Local)",subtitle:"Converts text into vectors — the math that makes semantic search work, fully offline",
    accent:G.amber,abg:"rgba(245,158,11,.15)",
    what:`Embeddings are the magic that make semantic search work. Instead of matching keywords, embeddings represent the *meaning* of text as a point in high-dimensional vector space — so "how do I request time off" and "PTO approval process" land near each other even though they share zero words. This layer takes every preprocessed chunk and runs it through a local embedding model to produce a dense vector (typically 768–1536 numbers). The entire process runs on your hardware — no API calls, no cost per embedding, and critically: your proprietary company data never leaves the building. The embedding model you choose must be used consistently for BOTH indexing and querying — mixing models is the most common and most catastrophic implementation mistake.`,
    steps:[
      {title:"Pull and run your embedding model via Ollama",desc:"Ollama makes local embedding models trivially easy. nomic-embed-text is the recommended default — fast, 768-dimensional, CPU-capable. BGE-M3 upgrades accuracy and adds multilingual support.",
       code:`<span style="color:#2a4a60"># Pull models locally (one-time)</span>
ollama pull nomic-embed-text   <span style="color:#2a4a60"># 274MB, 768-dim, fast</span>
ollama pull bge-m3             <span style="color:#2a4a60"># 1.2GB, 1024-dim, multilingual</span>

<span style="color:#2a4a60"># Test it returns a vector</span>
curl http://localhost:11434/api/embeddings \
  -d '{"model":"nomic-embed-text","prompt":"test"}'
<span style="color:#2a4a60"># Returns: {"embedding": [0.023, -0.41, ...]}</span>`},
      {title:"Build async batch embedding for throughput",desc:"Never embed one chunk at a time. Batch process for speed — a single RTX 4090 can embed thousands of chunks per minute with async parallelism. Pin the model in config as the single source of truth.",
       code:`<span style="color:#00d4ff">import</span> httpx, asyncio

EMBED_SEM = asyncio.Semaphore(<span style="color:#22d3a0">8</span>)  <span style="color:#2a4a60"># limit concurrent Ollama requests</span>

<span style="color:#00d4ff">async def</span> embed_one(client: httpx.AsyncClient, text: str) -> list[float]:
    <span style="color:#00d4ff">async with</span> EMBED_SEM:
        r = <span style="color:#00d4ff">await</span> client.post(
            <span style="color:#f59e0b">"http://localhost:11434/api/embeddings"</span>,
            json={<span style="color:#f59e0b">"model"</span>: <span style="color:#f59e0b">"nomic-embed-text"</span>, <span style="color:#f59e0b">"prompt"</span>: text}
        )
        <span style="color:#00d4ff">return</span> r.json()[<span style="color:#f59e0b">"embedding"</span>]

<span style="color:#00d4ff">async def</span> embed_batch(texts: list[str]) -> list[list[float]]:
    <span style="color:#00d4ff">async with</span> httpx.AsyncClient(timeout=<span style="color:#22d3a0">30</span>) <span style="color:#00d4ff">as</span> client:
        <span style="color:#00d4ff">return await</span> asyncio.gather(*[embed_one(client, t) <span style="color:#00d4ff">for</span> t <span style="color:#00d4ff">in</span> texts])`},
    ],
    tools:[
      {name:"nomic-embed-text",role:"EMBEDDING MODEL",what:"A 137M parameter open-source embedding model optimized for local deployment. Produces 768-dimensional vectors with an 8192-token context window. Runs on CPU or GPU. Available via Ollama with a single pull command. Apache 2.0 licensed.",why:"Best quality-to-speed ratio for on-prem use. Can process thousands of chunks per minute on a mid-range GPU with zero cloud cost or API rate limits."},
      {name:"BGE-M3",role:"MULTILINGUAL EMBEDDINGS",what:"State-of-the-art embedding model from BAAI supporting 100+ languages, 8192-token context, and 1024-dimensional vectors. Uniquely supports hybrid retrieval — generates both dense semantic vectors AND sparse keyword representations simultaneously from one model.",why:"If your company operates in multiple languages or you need maximum retrieval accuracy, BGE-M3's hybrid encoding (dense + sparse from one pass) eliminates the need for a separate keyword search engine."},
      {name:"Ollama (embedding mode)",role:"LOCAL MODEL SERVER",what:"Ollama serves both chat and embedding models via a REST API on localhost. Handles model loading, GPU memory management, and request queuing automatically. Mirrors the OpenAI embedding endpoint format so existing LangChain/LlamaIndex integrations work without changes.",why:"Zero-config local embedding server. One command to install, one command to pull, clean API to call. Removes all infrastructure friction from running local models."},
    ]
  },
  {
    name:"Vector Database",subtitle:"Stores all embeddings, enables sub-second semantic search across your entire knowledge base",
    accent:G.blue,abg:"rgba(96,165,250,.15)",
    what:`The vector database is your system's long-term semantic memory. It stores every embedding produced by the embedding engine, indexed using HNSW (Hierarchical Navigable Small World) graphs that make finding the top-K most similar vectors extremely fast — milliseconds across millions of documents. Unlike a traditional database that matches exact values, a vector DB answers: "what content is most semantically similar to this query?" It also supports hybrid search — combining semantic similarity scoring with metadata filters. "Give me only docs from Q4 2024, tagged as engineering specs, that are semantically similar to this query." This combination of semantic + metadata filtering is what makes retrieval actually useful in a real enterprise setting.`,
    steps:[
      {title:"Deploy Qdrant as a self-hosted Docker service",desc:"Qdrant is Rust-based, extremely fast, and the best self-hosted option for production use. Mount a volume for persistence. Enable both REST and gRPC ports.",
       code:`<span style="color:#2a4a60"># docker-compose.yml</span>
<span style="color:#00d4ff">services</span>:
  <span style="color:#00d4ff">qdrant</span>:
    <span style="color:#00d4ff">image</span>: <span style="color:#f59e0b">qdrant/qdrant:latest</span>
    <span style="color:#00d4ff">ports</span>: [<span style="color:#f59e0b">"6333:6333"</span>, <span style="color:#f59e0b">"6334:6334"</span>]
    <span style="color:#00d4ff">volumes</span>: [<span style="color:#f59e0b">"./qdrant_storage:/qdrant/storage"</span>]`},
      {title:"Create a collection and index metadata fields",desc:"A Qdrant collection is your vector table. Configure it to match your embedding model's dimensions and index metadata fields for efficient filtering.",
       code:`<span style="color:#00d4ff">from</span> qdrant_client <span style="color:#00d4ff">import</span> QdrantClient
<span style="color:#00d4ff">from</span> qdrant_client.models <span style="color:#00d4ff">import</span> Distance, VectorParams

client = QdrantClient(<span style="color:#f59e0b">"localhost"</span>, port=<span style="color:#22d3a0">6333</span>)
client.create_collection(<span style="color:#f59e0b">"company_knowledge"</span>,
    vectors_config=VectorParams(size=<span style="color:#22d3a0">768</span>, distance=Distance.COSINE))

<span style="color:#2a4a60"># Index metadata for fast filtered retrieval</span>
client.create_payload_index(<span style="color:#f59e0b">"company_knowledge"</span>,
    field_name=<span style="color:#f59e0b">"doc_type"</span>, field_schema=<span style="color:#f59e0b">"keyword"</span>)
client.create_payload_index(<span style="color:#f59e0b">"company_knowledge"</span>,
    field_name=<span style="color:#f59e0b">"created_at"</span>, field_schema=<span style="color:#f59e0b">"datetime"</span>)`},
      {title:"Implement hybrid semantic + metadata search",desc:"Combine vector similarity with metadata filters to enable precise retrieval. Pure semantic search misses exact matches — product names, ticket IDs, version numbers.",
       code:`<span style="color:#00d4ff">from</span> qdrant_client.models <span style="color:#00d4ff">import</span> Filter, FieldCondition, MatchValue

<span style="color:#00d4ff">def</span> search(query_vec, filters={}, top_k=<span style="color:#22d3a0">5</span>):
    qfilter = Filter(must=[
        FieldCondition(key=k, match=MatchValue(value=v))
        <span style="color:#00d4ff">for</span> k, v <span style="color:#00d4ff">in</span> filters.items()
    ]) <span style="color:#00d4ff">if</span> filters <span style="color:#00d4ff">else None</span>
    <span style="color:#00d4ff">return</span> client.search(<span style="color:#f59e0b">"company_knowledge"</span>,
        query_vector=query_vec, query_filter=qfilter,
        limit=top_k, with_payload=<span style="color:#22d3a0">True</span>)`},
    ],
    tools:[
      {name:"Qdrant",role:"PRIMARY VECTOR DB",what:"High-performance vector search engine written in Rust. Supports HNSW indexing (sub-millisecond search across millions of vectors), rich payload filtering, sparse vector support for hybrid search, on-disk storage for large datasets, named collections for namespace isolation, and gRPC for high-throughput workloads.",why:"Best self-hosted option — faster than Chroma on large datasets, more features than pgvector (filtering, sparse vectors, collections), and fully open-source with no cloud dependency or data egress."},
      {name:"ChromaDB",role:"LIGHTWEIGHT ALTERNATIVE",what:"Python-first vector database that runs in-process or as a lightweight server. No separate infrastructure to manage — import and use. Excellent for prototypes and small deployments under 1M vectors.",why:"When you're building an MVP and don't want Qdrant's infrastructure overhead. The abstraction layer between your code and the vector DB means swapping to Qdrant for production is a one-line config change."},
      {name:"pgvector",role:"SQL-NATIVE OPTION",what:"A PostgreSQL extension adding vector similarity search with standard SQL. Stores embeddings in a column alongside relational data. Enables vector search with SQL JOINs against your existing metadata tables in the same query.",why:"If your team already runs PostgreSQL and wants to minimize infrastructure complexity, pgvector eliminates the need for a separate vector database service entirely."},
    ]
  },
  {
    name:"LLM Inference Engine (Local)",subtitle:"The brain — runs your language model 100% on-prem, zero data egress",
    accent:G.cyan,abg:"rgba(0,212,255,.15)",
    what:`This is the core of the architecture — the actual language model that reads retrieved context and generates answers. The key architectural decision is that it runs entirely on your hardware. No API keys, no per-token billing, no data leaving your network. The inference engine exposes a local HTTP server on localhost that speaks either the OpenAI or Anthropic Messages API format — so the orchestration layer doesn't need to know or care that it's talking to a local model. You choose the model based on your GPU VRAM budget: a 7B model (Q4 quantized) fits on 8GB VRAM, a 34B model needs ~24GB, a 70B model needs ~40GB. For an internal company chatbot, a well-tuned 13B–34B parameter model is the sweet spot between answer quality and response speed. Zero Egress Boundary guarantee: every token generated in this layer is produced on hardware inside the customer's premises. No prompt, no retrieved context, and no generated response crosses the network boundary to any external party.`,
    steps:[
      {title:"Install Ollama and pull your model",desc:"Ollama is the fastest path to a working local inference server. One install script, one pull command, one local API endpoint.",
       code:`<span style="color:#2a4a60"># Install Ollama on Linux</span>
curl -fsSL https://ollama.com/install.sh | sh

<span style="color:#2a4a60"># Pull a model (fits on 24GB GPU, Q4 quantized)</span>
ollama pull llama3.3:70b-instruct-q4_K_M

<span style="color:#2a4a60"># Ollama starts automatically — verify it works</span>
curl http://localhost:11434/api/chat \
  -d '{"model":"llama3.3","messages":[{"role":"user","content":"hi"}]}'`},
      {title:"For GPU performance: use llama-server directly",desc:"llama.cpp's llama-server gives you fine-grained control over GPU layer offloading, context size, batching, and natively speaks the Anthropic Messages API — exactly as the XDA article describes.",
       code:`<span style="color:#2a4a60"># Build llama.cpp with CUDA</span>
git clone https://github.com/ggml-org/llama.cpp
cmake llama.cpp -B llama.cpp/build -DGGML_CUDA=ON
cmake --build llama.cpp/build --config Release -j

<span style="color:#2a4a60"># Run server — Anthropic API compatible</span>
./llama.cpp/llama-server \
  --model ./models/qwen3-coder-q4.gguf \
  --port 8080 --ctx-size 32768 \
  --n-gpu-layers 99 \   <span style="color:#2a4a60"># offload all layers to GPU</span>
  --parallel 4 \        <span style="color:#2a4a60"># handle 4 concurrent requests</span>
  --flash-attn          <span style="color:#2a4a60"># faster attention mechanism</span>`},
      {title:"Point your app at the local endpoint via env vars",desc:"Your entire stack switches between local and cloud inference by changing two environment variables — zero code changes.",
       code:`<span style="color:#2a4a60"># .env — local inference mode</span>
ANTHROPIC_BASE_URL=<span style="color:#f59e0b">http://localhost:8080</span>
ANTHROPIC_API_KEY=<span style="color:#f59e0b">not-needed-for-local</span>
LLM_MODEL=<span style="color:#f59e0b">llama3.3</span>

<span style="color:#2a4a60"># Switch to Anthropic cloud — just change .env:</span>
<span style="color:#2a4a60"># ANTHROPIC_BASE_URL=https://api.anthropic.com</span>
<span style="color:#2a4a60"># ANTHROPIC_API_KEY=sk-ant-your-real-key</span>`},
    ],
    tools:[
      {name:"Ollama",role:"INFERENCE SERVER",what:"Manages model downloads, quantization selection, GPU offloading, and API serving automatically. Runs an OpenAI-compatible REST API on port 11434 by default. Supports Mac (Apple Silicon Metal), Linux (CUDA/ROCm), and Windows. Hot-swaps models on demand.",why:"Zero-config local inference. The fastest way to go from 'I want to run a local LLM' to 'I have a working API endpoint' — literally 3 terminal commands. Use for development and medium-load internal deployments."},
      {name:"llama.cpp (llama-server)",role:"HIGH-PERF INFERENCE",what:"C++ inference engine running quantized GGUF model files. Exposes both OpenAI AND Anthropic-compatible HTTP endpoints natively — no proxy required. Fine-grained control: GPU layer count, KV cache quantization, flash attention, batch size, and concurrent request limits.",why:"When you need maximum tokens/second or specific GPU memory control, llama.cpp beats Ollama on raw performance. This is the exact engine described in the XDA article as the best way to run Qwen3-Coder-Next locally."},
      {name:"vLLM",role:"HIGH-THROUGHPUT SERVING",what:"Production-grade inference server for NVIDIA GPUs. PagedAttention dramatically improves GPU memory utilization. Continuous batching serves new requests without waiting for the current batch. Tensor parallelism splits models across multiple GPUs. FP8 quantization for H100s.",why:"When you have 20+ concurrent users and serious GPU hardware (A100/H100), vLLM's throughput makes Ollama look like a toy. The production path for teams where many people are using the chatbot simultaneously."},
    ]
  },
  {
    name:"RAG Orchestration Layer",subtitle:"Wires retrieval + generation into a coherent, memory-aware conversation engine",
    accent:G.green,abg:"rgba(34,211,160,.15)",
    what:`This is the conductor of the whole system. It receives the user's query, decides what to retrieve from the vector DB, assembles retrieved chunks into a coherent context window, calls the LLM with that context, manages conversation history across turns, and handles tool routing for different query types. Without this layer, you have disconnected components — a vector DB that can't talk to an LLM. The orchestration layer provides the intelligence that connects them: it can reformulate ambiguous queries before retrieval, decide whether to retrieve more context if confidence is low, route code questions to the GitHub index vs HR questions to the policy docs index, and maintain a sliding window of conversation history so the bot remembers what was discussed earlier in the session.`,
    steps:[
      {title:"Build the RAG pipeline with LlamaIndex",desc:"LlamaIndex provides battle-tested RAG primitives that wire directly to Qdrant and Ollama with minimal boilerplate. The query engine handles embedding the query, retrieving chunks, injecting context, and calling the LLM.",
       code:`<span style="color:#00d4ff">from</span> llama_index.core <span style="color:#00d4ff">import</span> VectorStoreIndex, Settings
<span style="color:#00d4ff">from</span> llama_index.vector_stores.qdrant <span style="color:#00d4ff">import</span> QdrantVectorStore
<span style="color:#00d4ff">from</span> llama_index.llms.ollama <span style="color:#00d4ff">import</span> Ollama
<span style="color:#00d4ff">from</span> llama_index.embeddings.ollama <span style="color:#00d4ff">import</span> OllamaEmbedding

Settings.llm = Ollama(model=<span style="color:#f59e0b">"llama3.3:70b"</span>, base_url=<span style="color:#f59e0b">"http://localhost:11434"</span>)
Settings.embed_model = OllamaEmbedding(model_name=<span style="color:#f59e0b">"nomic-embed-text"</span>)

vector_store = QdrantVectorStore(client=qclient, collection_name=<span style="color:#f59e0b">"company_knowledge"</span>)
index = VectorStoreIndex.from_vector_store(vector_store)
chat_engine = index.as_chat_engine(
    chat_mode=<span style="color:#f59e0b">"condense_plus_context"</span>,
    system_prompt=<span style="color:#f59e0b">"""You are ARIA. Answer using company knowledge only.
    Always cite the source document. Say 'I don't know' if unsure."""</span>
)`},
      {title:"Add conversation memory across turns",desc:"Without memory, every message is treated as a new query — 'what about the second option you mentioned?' fails completely. Add a token-limited chat buffer.",
       code:`<span style="color:#00d4ff">from</span> llama_index.core.memory <span style="color:#00d4ff">import</span> ChatMemoryBuffer

<span style="color:#2a4a60"># 4096 tokens of conversation history per session</span>
memory = ChatMemoryBuffer.from_defaults(token_limit=<span style="color:#22d3a0">4096</span>)
chat_engine = index.as_chat_engine(memory=memory)`},
      {title:"Wrap in FastAPI with WebSocket streaming",desc:"Expose the RAG engine as a service with streaming — users see tokens appearing progressively instead of waiting for the full response to generate.",
       code:`<span style="color:#00d4ff">from</span> fastapi <span style="color:#00d4ff">import</span> FastAPI, WebSocket
app = FastAPI()

<span style="color:#00d4ff">@app.websocket</span>(<span style="color:#f59e0b">"/chat"</span>)
<span style="color:#00d4ff">async def</span> chat_ws(ws: WebSocket):
    <span style="color:#00d4ff">await</span> ws.accept()
    <span style="color:#00d4ff">while True</span>:
        query = <span style="color:#00d4ff">await</span> ws.receive_text()
        response = <span style="color:#00d4ff">await</span> chat_engine.astream_chat(query)
        <span style="color:#00d4ff">async for</span> token <span style="color:#00d4ff">in</span> response.async_response_gen():
            <span style="color:#00d4ff">await</span> ws.send_text(token)`},
    ],
    tools:[
      {name:"LlamaIndex",role:"RAG FRAMEWORK",what:"A data framework specifically built for connecting LLMs to external data sources. Provides VectorStoreIndex, QueryEngine, ChatEngine, and RetrievalPipeline abstractions. Deep integrations with Qdrant, Ollama, llama.cpp, and every major vector DB. Supports conversation memory, source citation, and query rewriting out of the box.",why:"More opinionated and RAG-focused than LangChain — less boilerplate for document Q&A use cases. Better out-of-the-box retrieval quality through built-in query transformations and response synthesis modes."},
      {name:"LangChain",role:"AGENT ALTERNATIVE",what:"A broader LLM application framework with chains, agents, tools, and retrieval primitives. More flexible than LlamaIndex. Better when your chatbot needs to execute multi-step agentic workflows, call external APIs, or use complex decision logic beyond pure document retrieval.",why:"Choose LangChain when your chatbot needs to DO things (book meetings, update CRM records, run queries) rather than just answer questions from documents."},
      {name:"FastAPI",role:"API FRAMEWORK",what:"Async Python web framework with automatic OpenAPI docs, native WebSocket support, and Pydantic validation. Exposes your RAG engine as an HTTP service. Async-native means it handles streaming LLM responses efficiently without blocking threads.",why:"The only modern Python framework that's async-native from the ground up — critical for streaming LLM tokens progressively to clients. Auto-generates API docs that integrating teams (Slack bot, mobile app) can use immediately."},
    ]
  },
  {
    name:"Continuous Learning Loop",subtitle:"The feedback flywheel that makes your chatbot smarter from real usage over time",
    accent:G.amber,abg:"rgba(245,158,11,.15)",
    what:`This layer is what separates a static chatbot from a living system that compounds in value over time. Most enterprise AI deployments plateau — they answer questions from static documents and never improve. The learning loop breaks that ceiling. Every user interaction is an implicit training signal: when a user rates an answer thumbs up, that's a good Q&A pair. When they rate thumbs down and rephrase, that's a correction. Weekly, these signals flow into a curation pipeline, get reviewed by a human team in Argilla, and the approved high-quality examples are used to run a LoRA fine-tuning cycle. LoRA (Low-Rank Adaptation) means only a tiny set of adapter weights get updated — not the entire 70B model — so fine-tuning runs in hours, not weeks, on a single GPU. Over months, the model starts speaking your company's language, knows your product nuances, and gives answers that reflect institutional knowledge no document ever explicitly stated.`,
    steps:[
      {title:"Add feedback UI and capture interactions",desc:"Every chat response gets a thumbs up/down. Store the full context: query, retrieved chunks, LLM answer, rating, and session metadata. This is your raw training gold.",
       code:`<span style="color:#2a4a60"># Feedback capture endpoint</span>
<span style="color:#00d4ff">@app.post</span>(<span style="color:#f59e0b">"/feedback"</span>)
<span style="color:#00d4ff">async def</span> feedback(payload: FeedbackPayload):
    <span style="color:#00d4ff">await</span> db.insert(<span style="color:#f59e0b">"interactions"</span>, {
        <span style="color:#f59e0b">"query"</span>:    payload.query,
        <span style="color:#f59e0b">"context"</span>:  payload.retrieved_chunks,
        <span style="color:#f59e0b">"response"</span>: payload.llm_response,
        <span style="color:#f59e0b">"rating"</span>:   payload.rating,   <span style="color:#2a4a60"># 1=good, -1=bad</span>
        <span style="color:#f59e0b">"ts"</span>:       datetime.utcnow()
    })`},
      {title:"Deploy Argilla for human review and dataset curation",desc:"Argilla provides a self-hosted UI where your team reviews interactions, corrects bad answers, approves good ones, and exports clean training datasets.",
       code:`<span style="color:#2a4a60"># Self-hosted Argilla</span>
docker run -d --name argilla -p 6900:6900 \
  argilla/argilla-server:latest

<span style="color:#2a4a60"># Push interactions for review</span>
<span style="color:#00d4ff">import</span> argilla <span style="color:#00d4ff">as</span> rg
rg.init(api_url=<span style="color:#f59e0b">"http://localhost:6900"</span>, api_key=<span style="color:#f59e0b">"admin.apikey"</span>)
<span style="color:#2a4a60"># Team reviews in Argilla UI → exports curated JSONL dataset</span>`},
      {title:"Run weekly LoRA fine-tuning with Unsloth",desc:"Unsloth makes fine-tuning 2-5x faster with custom CUDA kernels. LoRA only updates adapter weights — not the full model — so it runs in hours on one A100 GPU.",
       code:`<span style="color:#00d4ff">from</span> unsloth <span style="color:#00d4ff">import</span> FastLanguageModel

model, tokenizer = FastLanguageModel.from_pretrained(
    <span style="color:#f59e0b">"unsloth/llama-3.3-70b-instruct-bnb-4bit"</span>,
    max_seq_length=<span style="color:#22d3a0">4096</span>, load_in_4bit=<span style="color:#22d3a0">True</span>)

model = FastLanguageModel.get_peft_model(
    model, r=<span style="color:#22d3a0">16</span>,
    target_modules=[<span style="color:#f59e0b">"q_proj"</span>,<span style="color:#f59e0b">"k_proj"</span>,<span style="color:#f59e0b">"v_proj"</span>,<span style="color:#f59e0b">"o_proj"</span>])

trainer.train()  <span style="color:#2a4a60"># train on curated feedback dataset</span>
model.save_pretrained_merged(<span style="color:#f59e0b">"./models/aria-v2"</span>, tokenizer)`},
    ],
    tools:[
      {name:"Argilla",role:"FEEDBACK PLATFORM",what:"Open-source data annotation and feedback management platform built for LLM workflows. Provides a web UI for reviewing chatbot interactions, rating answer quality, correcting bad responses, adding annotations, and exporting curated JSONL/Parquet training datasets. Fully self-hostable.",why:"Without a structured feedback tool, interaction logs are raw noise. Argilla is the pipeline from 'user clicked thumbs down' to 'curated training example' — it's the human-in-the-loop that makes the learning loop trustworthy."},
      {name:"Unsloth",role:"FINE-TUNING ENGINE",what:"A library that makes LLM fine-tuning 2-5x faster and 80% more memory-efficient through custom CUDA kernels that optimize the backward pass. Supports LoRA and QLoRA on most open models. Can fine-tune Llama 3.3 70B on a single A100 40GB GPU in a few hours.",why:"Without Unsloth, weekly fine-tuning cycles would require expensive multi-GPU clusters. With Unsloth, a single A100 is enough — making the continuous learning loop economically viable on realistic hardware."},
      {name:"MLflow",role:"MODEL VERSIONING",what:"Open-source platform for tracking ML experiments, versioning model artifacts, comparing runs, and managing deployments. Records every training run's hyperparameters, evaluation metrics, and output model weights so you can compare versions and roll back if quality drops.",why:"Without versioning, a bad fine-tune could degrade your production chatbot with no way to identify what changed or roll back. MLflow is the safety net that makes iterative improvement safe."},
    ]
  },
  {
    name:"Interface & Auth Layer",subtitle:"The UI, API, Slack integration, and security gate that employees actually use daily",
    accent:G.red,abg:"rgba(248,113,113,.15)",
    what:`This is what your team actually sees and touches. It's the chat interface, the access control system, and the integrations layer that brings the chatbot where employees already work — their browser, their Slack, their intranet. Adoption is the silent killer of internal tools. A technically perfect chatbot that nobody uses because the UX is clunky is a failed project. Open WebUI solves the UX problem by looking and functioning like ChatGPT — employees recognize it immediately, no training needed. Authentication via SSO (Keycloak + LDAP) means employees log in with their existing company credentials. Role-based access means HR docs aren't accessible to contractors, and engineering secrets aren't visible to marketing.`,
    steps:[
      {title:"Deploy Open WebUI pointing at your RAG API",desc:"Open WebUI is a full-featured self-hosted chat interface. Configure it to call your RAG FastAPI service (not directly to Ollama) so every response has retrieval context.",
       code:`<span style="color:#2a4a60"># docker-compose.yml</span>
<span style="color:#00d4ff">services</span>:
  <span style="color:#00d4ff">open-webui</span>:
    <span style="color:#00d4ff">image</span>: <span style="color:#f59e0b">ghcr.io/open-webui/open-webui:main</span>
    <span style="color:#00d4ff">ports</span>: [<span style="color:#f59e0b">"3000:8080"</span>]
    <span style="color:#00d4ff">environment</span>:
      OPENAI_API_BASE_URL: <span style="color:#f59e0b">http://rag-api:8000/v1</span>
      WEBUI_AUTH: <span style="color:#f59e0b">"true"</span>
      OAUTH_CLIENT_ID: <span style="color:#f59e0b">"aria-webui"</span>
      OAUTH_CLIENT_SECRET: <span style="color:#f59e0b">"your-keycloak-secret"</span>`},
      {title:"Set up Keycloak for SSO with company LDAP",desc:"Keycloak connects to your Active Directory or LDAP so employees log in with their existing company credentials. Define roles that map to document access permissions.",
       code:`<span style="color:#2a4a60"># Keycloak LDAP federation config (admin console)</span>
<span style="color:#2a4a60"># User Federation → Add provider → LDAP</span>
<span style="color:#00d4ff">connection_url</span>: <span style="color:#f59e0b">ldap://your-ad-server:389</span>
<span style="color:#00d4ff">bind_dn</span>: <span style="color:#f59e0b">CN=keycloak,OU=ServiceAccounts,DC=company,DC=com</span>
<span style="color:#00d4ff">users_dn</span>: <span style="color:#f59e0b">OU=Users,DC=company,DC=com</span>

<span style="color:#2a4a60"># Nginx auth guard — validates JWT from Keycloak</span>
<span style="color:#00d4ff">location</span> /chat {
    <span style="color:#00d4ff">auth_request</span> /auth-validate;
    <span style="color:#00d4ff">proxy_pass</span> http://open-webui:8080;
}`},
      {title:"Build a Slack bot for in-workflow answers",desc:"A Slack bot calling your RAG API lets employees ask questions without leaving Slack. Uses Slack's Bolt SDK — deploy as a separate service.",
       code:`<span style="color:#00d4ff">from</span> slack_bolt.async_app <span style="color:#00d4ff">import</span> AsyncApp
<span style="color:#00d4ff">import</span> httpx
app = AsyncApp(token=SLACK_TOKEN, signing_secret=SLACK_SECRET)

<span style="color:#00d4ff">@app.event</span>(<span style="color:#f59e0b">"app_mention"</span>)
<span style="color:#00d4ff">async def</span> on_mention(event, say):
    query = event[<span style="color:#f59e0b">"text"</span>].replace(<span style="color:#f59e0b">"&lt;@BOT_ID&gt;"</span>,<span style="color:#f59e0b">""</span>).strip()
    <span style="color:#00d4ff">async with</span> httpx.AsyncClient() <span style="color:#00d4ff">as</span> c:
        r = <span style="color:#00d4ff">await</span> c.post(<span style="color:#f59e0b">"http://rag-api:8000/chat"</span>,
            json={<span style="color:#f59e0b">"query"</span>: query, <span style="color:#f59e0b">"user_id"</span>: event[<span style="color:#f59e0b">"user"</span>]})
    <span style="color:#00d4ff">await</span> say(r.json()[<span style="color:#f59e0b">"answer"</span>])`},
    ],
    tools:[
      {name:"Open WebUI",role:"CHAT INTERFACE",what:"Feature-complete self-hosted web UI providing chat history, user management, model selection, document upload, admin controls, and multi-user support. Built with SvelteKit. Docker deployment. Supports OpenAI and Anthropic API formats, custom API endpoints, and OAuth SSO.",why:"Adoption is everything for internal tools. Open WebUI looks like ChatGPT — employees instantly know how to use it with zero training. Building a custom chat UI from scratch would take months and still be worse."},
      {name:"Keycloak",role:"IDENTITY PROVIDER",what:"Enterprise-grade open-source identity and access management (IAM). Integrates with Active Directory/LDAP, provides SAML/OIDC SSO, supports MFA, manages roles and groups, and generates full audit logs. Runs as a self-hosted Docker service.",why:"A chatbot with access to all company knowledge must be properly secured with enterprise-grade auth. Keycloak is the production-ready self-hosted answer — handles edge cases (token refresh, MFA, group sync) that would take months to build correctly in-house."},
      {name:"Nginx",role:"REVERSE PROXY",what:"High-performance web server used as the single front door to all internal services. Handles TLS termination (HTTPS), request routing to Open WebUI vs RAG API vs Argilla, Keycloak auth guard middleware, rate limiting per IP, and access logging.",why:"Centralizes security, logging, and routing in one place. Without Nginx, you'd need TLS configured on every individual service. Nginx makes the entire stack accessible at one URL with one certificate."},
    ]
  },
];

const ARCH2 = [
  {
    name:"Tenant Control Plane",subtitle:"The admin backbone — manages every customer's lifecycle, billing, and provisioning",
    accent:G.purple,abg:"rgba(168,85,247,.15)",
    what:`The control plane is the operating system of your SaaS business. It's the system that knows everything about every customer — who they are, what plan they're on, which models they can access, how much compute they've consumed this billing period, and whether their subscription is active. When a new customer signs up, the control plane provisions their isolated environment automatically: creates their vector namespace in Qdrant, issues API keys with the right permissions, configures their model assignment based on plan tier, and if they're enterprise, triggers Terraform to spin up their dedicated inference container. For on-prem deployments, the control plane coordinates installation, engineer onboarding, and the same lifecycle automation runs inside the customer's own network. Every downstream service consults the control plane on every request to make authorization decisions. It must be the most reliable component in your stack — if the control plane is down, no tenant can make requests.`,
    steps:[
      {title:"Design the multi-tenant data model in PostgreSQL",desc:"Every tenant, their plan, limits, model config, and API keys live in a central registry. This drives all downstream authorization and provisioning.",
       code:`<span style="color:#2a4a60">-- Core tenant registry</span>
<span style="color:#a855f7">CREATE TABLE</span> tenants (
  id           UUID <span style="color:#a855f7">PRIMARY KEY DEFAULT</span> gen_random_uuid(),
  slug         TEXT <span style="color:#a855f7">UNIQUE NOT NULL</span>,
  plan         TEXT <span style="color:#a855f7">DEFAULT</span> <span style="color:#f59e0b">'starter'</span>,
  status       TEXT <span style="color:#a855f7">DEFAULT</span> <span style="color:#f59e0b">'active'</span>,
  model_config JSONB,     <span style="color:#2a4a60">-- assigned LLM + LoRA config</span>
  limits       JSONB,     <span style="color:#2a4a60">-- token budget, rate limits</span>
  created_at   TIMESTAMPTZ <span style="color:#a855f7">DEFAULT</span> now()
);
<span style="color:#a855f7">CREATE TABLE</span> api_keys (
  id        UUID <span style="color:#a855f7">PRIMARY KEY</span>,
  tenant_id UUID <span style="color:#a855f7">REFERENCES</span> tenants(id),
  key_hash  TEXT <span style="color:#a855f7">UNIQUE</span>,   <span style="color:#2a4a60">-- SHA256, never store plaintext</span>
  expires_at TIMESTAMPTZ
);`},
      {title:"Automate tenant provisioning with Terraform",desc:"New enterprise tenants trigger a Terraform apply that creates their dedicated container, network namespace, and Qdrant collection automatically.",
       code:`<span style="color:#2a4a60"># Terraform module: enterprise tenant provisioning via Helm</span>
<span style="color:#a855f7">resource</span> <span style="color:#f59e0b">"helm_release"</span> <span style="color:#f59e0b">"tenant_llm"</span> {
  <span style="color:#a855f7">name</span>       = <span style="color:#f59e0b">"llm-\${var.tenant_slug}"</span>
  <span style="color:#a855f7">namespace</span>  = <span style="color:#f59e0b">"tenant-\${var.tenant_slug}"</span>
  <span style="color:#a855f7">chart</span>      = <span style="color:#f59e0b">"./charts/llm-inference"</span>
  <span style="color:#a855f7">create_namespace</span> = <span style="color:#22d3a0">true</span>

  <span style="color:#a855f7">set</span> { <span style="color:#a855f7">name</span> = <span style="color:#f59e0b">"model"</span>;  <span style="color:#a855f7">value</span> = <span style="color:#f59e0b">var.model</span> }
  <span style="color:#a855f7">set</span> { <span style="color:#a855f7">name</span> = <span style="color:#f59e0b">"tenant"</span>; <span style="color:#a855f7">value</span> = <span style="color:#f59e0b">var.tenant_slug</span> }
  <span style="color:#a855f7">set</span> { <span style="color:#a855f7">name</span> = <span style="color:#f59e0b">"gpu.limit"</span>; <span style="color:#a855f7">value</span> = <span style="color:#f59e0b">"1"</span> }
}`},
      {title:"Wire Stripe webhooks for lifecycle automation",desc:"Stripe events automatically activate, suspend, or upgrade tenants. No manual intervention needed for subscription lifecycle events.",
       code:`<span style="color:#a855f7">@app.post</span>(<span style="color:#f59e0b">"/webhooks/stripe"</span>)
<span style="color:#a855f7">async def</span> stripe_hook(request: Request):
    event = stripe.Webhook.construct_event(
        <span style="color:#a855f7">await</span> request.body(),
        request.headers[<span style="color:#f59e0b">"stripe-signature"</span>], SECRET)
    <span style="color:#2a4a60"># Idempotency: skip if already processed</span>
    <span style="color:#a855f7">if await</span> db.fetchval(
        <span style="color:#f59e0b">"SELECT 1 FROM events_processed WHERE event_id=$1"</span>, event.id):
        <span style="color:#a855f7">return</span> {<span style="color:#f59e0b">"status"</span>: <span style="color:#f59e0b">"duplicate"</span>}
    handlers = {
        <span style="color:#f59e0b">"customer.subscription.deleted"</span>: suspend_tenant,
        <span style="color:#f59e0b">"invoice.payment_succeeded"</span>:      activate_tenant,
        <span style="color:#f59e0b">"customer.subscription.updated"</span>:   upgrade_tenant,
    }
    <span style="color:#a855f7">await</span> handlers[event.type](event.data.object)
    <span style="color:#a855f7">await</span> db.execute(
        <span style="color:#f59e0b">"INSERT INTO events_processed(event_id) VALUES($1)"</span>, event.id)`},
    ],
    tools:[
      {name:"PostgreSQL",role:"TENANT REGISTRY",what:"Stores the authoritative record of every tenant — plan, limits, model config, API keys, and billing status. Uses ACID transactions to guarantee consistency when provisioning new tenants or processing billing events. Tenant config is cached in Redis for performance, but PostgreSQL is always the source of truth.",why:"Billing and access control decisions require strong consistency — you never want eventual consistency when deciding whether to authorize a request or charge a customer. PostgreSQL's ACID guarantees are the right foundation for this."},
      {name:"Stripe",role:"BILLING ENGINE",what:"Handles subscription management, payment processing, invoicing, proration on plan upgrades, failed payment dunning, and tax compliance. Webhooks notify your control plane of every lifecycle event. Supports usage-based billing via Stripe Meters for token overage charges.",why:"Billing is not a competitive advantage — it's plumbing. The failure modes of rolling your own billing (failed payment handling, proration bugs, tax compliance) are business-critical and not worth building. Stripe has solved these problems for millions of businesses."},
      {name:"Terraform",role:"INFRA PROVISIONING",what:"Infrastructure-as-code tool that declares tenant infrastructure as config files. When a new enterprise tenant onboards, running terraform apply creates their dedicated container, isolated Docker network, Qdrant collection, and DNS entry — repeatably and auditibly. Terraform state tracks exactly what's provisioned for each tenant.",why:"Manual enterprise tenant provisioning is error-prone, slow, and doesn't scale past a handful of tenants. Terraform makes onboarding a deterministic, automated, 2-minute operation."},
    ]
  },
  {
    name:"API Gateway & Metering",subtitle:"Every request flows through here — auth, rate limits, routing, and billing",
    accent:G.amber,abg:"rgba(245,158,11,.15)",
    what:`The API gateway is the bouncer, traffic cop, and accountant all in one. Every single API call from every tenant hits the gateway first — before any LLM inference happens. It validates the API key against your tenant registry, loads that tenant's config (model assignment, rate limits, token budget), checks whether they're within their plan limits, adds tenant context headers to the forwarded request, and logs the transaction for billing. It also handles load balancing across inference nodes and can queue requests when GPUs are saturated rather than returning 503 errors. Without this layer, there is no security boundary between tenants, no way to enforce plan limits, and no billing data to reconcile against Stripe at month end.`,
    steps:[
      {title:"Deploy Kong Gateway with key-auth and rate-limiting plugins",desc:"Kong's plugin system handles auth and rate limiting declaratively without custom code. Configure Redis for distributed rate limit state across multiple gateway instances.",
       code:`<span style="color:#2a4a60"># Kong declarative config</span>
<span style="color:#a855f7">services</span>:
  - <span style="color:#a855f7">name</span>: llm-api
    <span style="color:#a855f7">url</span>: http://inference-router:8080
    <span style="color:#a855f7">routes</span>: [{<span style="color:#a855f7">paths</span>: [<span style="color:#f59e0b">"/v1/messages"</span>]}]
    <span style="color:#a855f7">plugins</span>:
      - <span style="color:#a855f7">name</span>: key-auth         <span style="color:#2a4a60"># validates API keys</span>
      - <span style="color:#a855f7">name</span>: rate-limiting
        <span style="color:#a855f7">config</span>: {<span style="color:#a855f7">minute</span>: 60, <span style="color:#a855f7">policy</span>: <span style="color:#f59e0b">redis</span>}
      - <span style="color:#a855f7">name</span>: request-transformer
        <span style="color:#a855f7">config</span>:
          <span style="color:#a855f7">add.headers</span>: [<span style="color:#f59e0b">"X-Tenant-ID:$(consumer.id)"</span>]`},
      {title:"Log all usage events to ClickHouse for billing",desc:"Every request triggers an async write to ClickHouse — the columnar database that powers billing reconciliation and usage dashboards without impacting request latency.",
       code:`<span style="color:#2a4a60">-- ClickHouse usage events table</span>
<span style="color:#a855f7">CREATE TABLE</span> usage_events (
  tenant_id     UUID,
  input_tokens  UInt32,
  output_tokens UInt32,
  model         String,
  latency_ms    UInt32,
  timestamp     DateTime64(3)
) <span style="color:#a855f7">ENGINE</span> = MergeTree()
<span style="color:#a855f7">ORDER BY</span> (tenant_id, timestamp);

<span style="color:#2a4a60">-- Monthly billing query (sub-second on millions of rows)</span>
<span style="color:#a855f7">SELECT</span> tenant_id, sum(input_tokens + output_tokens)
<span style="color:#a855f7">FROM</span> usage_events
<span style="color:#a855f7">WHERE</span> timestamp >= toStartOfMonth(now())
<span style="color:#a855f7">GROUP BY</span> tenant_id;`},
    ],
    tools:[
      {name:"Kong Gateway",role:"API GATEWAY",what:"Open-source Lua-based API gateway handling authentication, rate limiting, request transformation, logging, and traffic routing. Configured declaratively via YAML or via a REST admin API. Plugin ecosystem with 50+ pre-built integrations for auth, observability, and traffic management. Runs as a stateless service backed by PostgreSQL.",why:"Centralizes all cross-cutting concerns (auth, rate limits, logging, routing) in one place rather than duplicating logic in every service. The industry standard for self-hosted API gateway — used by thousands of production SaaS platforms."},
      {name:"Redis",role:"RATE LIMIT STATE",what:"In-memory data store used for distributed rate limit counters. When you run multiple Kong instances, Redis keeps per-tenant request counts synchronized across all instances using atomic increment operations with TTL-based expiry for sliding window rate limits.",why:"Rate limiting requires shared state across requests and across gateway replicas. Redis's sub-millisecond atomic operations make it the perfect fit — checking and incrementing a counter adds <1ms to request latency."},
      {name:"ClickHouse",role:"USAGE ANALYTICS DB",what:"Columnar OLAP database built for high-throughput write workloads and fast analytical queries. Can ingest millions of usage events per second while enabling sub-second aggregation queries across months of time-series data. Much faster than PostgreSQL for aggregate queries over large datasets.",why:"You'll log a usage event for every LLM request — potentially millions of rows per day across all tenants. ClickHouse is purpose-built for exactly this pattern. Running billing queries on PostgreSQL at this scale would take minutes; ClickHouse does it in milliseconds."},
    ]
  },
  {
    name:"Multi-Tenant Inference Engine",subtitle:"Serves LLM requests to multiple customers simultaneously with strict isolation",
    accent:G.green,abg:"rgba(34,211,160,.15)",
    what:`This is the most technically challenging layer of the SaaS platform. You need to run LLM inference for multiple tenants simultaneously while guaranteeing that their requests, context, outputs, and GPU memory are completely isolated. The architecture is tiered: starter-tier tenants share a vLLM instance with per-request LoRA adapter swapping, pro-tier gets isolated containers in a shared GPU pool, and enterprise gets dedicated bare-metal with their own llama-server process. vLLM's PagedAttention dramatically increases GPU utilization for the shared tier — it manages GPU memory like a virtual memory system, eliminating memory fragmentation. Multi-LoRA support lets vLLM serve multiple tenant-specific model personalities from one base model simultaneously. Zero Egress Boundary guarantee: for on-prem deployments, this entire inference layer runs inside the customer's network. No prompt, no LoRA-augmented output, and no retrieved context leaves the premises. For hosted SaaS, all inference runs within LocalMind's own infrastructure — no third-party AI API is ever called.`,
    steps:[
      {title:"Deploy vLLM for the shared inference tier",desc:"vLLM's continuous batching and PagedAttention serve multiple tenants on one GPU pool efficiently. Enable multi-LoRA for per-tenant model personalization.",
       code:`<span style="color:#2a4a60"># vLLM shared tier — Anthropic API compatible</span>
<span style="color:#2a4a60"># Multi-GPU (tensor-parallel) needed for --max-model-len >32k or --max-loras >4</span>
vllm serve Qwen/Qwen3-Coder-Next-FP8 \
  --served-model-name qwen3-coder-next \
  --port 8000 \
  --max-model-len 32768 \
  --gpu-memory-utilization 0.90 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --enable-lora --max-loras 4 \
  --enable-prefix-caching`},
      {title:"Build an inference router that picks the backend per tenant",desc:"A lightweight service reads tenant plan from Redis cache and routes to shared pool, isolated container, or dedicated node accordingly.",
       code:`<span style="color:#2a4a60"># Only approved adapters may be loaded onto shared vLLM</span>
LORA_ALLOWLIST = {<span style="color:#f59e0b">"base"</span>, <span style="color:#f59e0b">"code-v1"</span>, <span style="color:#f59e0b">"support-v2"</span>, <span style="color:#f59e0b">"legal-v1"</span>}

<span style="color:#a855f7">async def</span> route(request, tenant):
    <span style="color:#a855f7">if</span> tenant.plan == <span style="color:#f59e0b">"enterprise"</span>:
        backend = f<span style="color:#f59e0b">"http://llm-{tenant.slug}:8080"</span>
    <span style="color:#a855f7">elif</span> tenant.plan == <span style="color:#f59e0b">"pro"</span>:
        backend = f<span style="color:#f59e0b">"http://vllm-pro-{tenant.gpu_slot}:8000"</span>
    <span style="color:#a855f7">else</span>:
        <span style="color:#a855f7">if</span> tenant.lora_adapter <span style="color:#a855f7">not in</span> LORA_ALLOWLIST:
            <span style="color:#a855f7">raise</span> HTTPException(status_code=<span style="color:#22d3a0">403</span>,
                detail=<span style="color:#f59e0b">"LoRA adapter not permitted"</span>)
        backend = <span style="color:#f59e0b">"http://vllm-shared:8000"</span>
        request.model += f<span style="color:#f59e0b">"+{tenant.lora_adapter}"</span>
    <span style="color:#a855f7">return await</span> proxy_stream(backend, request)`},
      {title:"Deploy enterprise tenant containers via Kubernetes",desc:"Each enterprise tenant gets a Kubernetes pod with a dedicated GPU resource limit. Isolation at the kernel level — one tenant's OOM crash cannot affect another's inference.",
       code:`<span style="color:#2a4a60"># K8s pod for dedicated enterprise tenant</span>
<span style="color:#a855f7">spec</span>:
  <span style="color:#a855f7">containers</span>:
  - <span style="color:#a855f7">name</span>: llm-inference
    <span style="color:#a855f7">image</span>: llama-server:latest
    <span style="color:#a855f7">resources</span>:
      <span style="color:#a855f7">limits</span>:
        nvidia.com/gpu: <span style="color:#f59e0b">"1"</span>   <span style="color:#2a4a60"># exclusive GPU</span>
        memory: <span style="color:#f59e0b">"128Gi"</span>`},
    ],
    tools:[
      {name:"vLLM",role:"SHARED TIER INFERENCE",what:"High-throughput LLM serving with PagedAttention (treats GPU memory like virtual memory, eliminating fragmentation), continuous batching (serves new requests mid-batch without waiting), multi-LoRA support (swap tenant adapters per request), and FP8 quantization support. Native Anthropic Messages API endpoint.",why:"For the shared starter/pro tiers, vLLM's continuous batching delivers 3-5x more throughput versus naive serving — you serve more tenants on the same hardware, which is the direct lever on your gross margins."},
      {name:"llama.cpp (llama-server)",role:"DEDICATED TIER INFERENCE",what:"For enterprise tenants who need their own isolated inference process with predictable performance. llama-server speaks the Anthropic Messages API natively, gives fine-grained GPU memory control, and runs as a standalone process with no shared memory with other tenants.",why:"Dedicated processes give enterprise tenants the data isolation guarantee they're paying a premium for. Their tokens never share a KV cache with another tenant's data — a non-negotiable requirement for defense, healthcare, and financial clients."},
      {name:"Kubernetes + NVIDIA GPU Operator",role:"CONTAINER ORCHESTRATION",what:"Kubernetes schedules inference containers across your GPU node fleet, enforces resource limits, handles container restarts, manages rolling deployments, and scales pods based on queue depth. The NVIDIA GPU Operator automates driver installation, GPU resource quota configuration, and GPU passthrough to containers.",why:"Without Kubernetes, managing inference containers across multiple GPU machines is a fragile manual operation. K8s handles scheduling, health checks, resource limits, and failure recovery automatically — your ops overhead stays flat as you scale from 10 to 1000 tenants."},
    ]
  },
  {
    name:"Agentic Harness (Claude Code-style)",subtitle:"The core product — transforms raw LLM into a multi-step agent that actually does work",
    accent:G.purple,abg:"rgba(168,85,247,.15)",
    what:`A raw LLM API is a commodity anyone can resell. An agentic harness that wraps that LLM with tool-use capabilities is a product. This is the key insight of the XDA article — and the core of what you're selling. The harness receives a high-level task ("add input validation to the login form"), breaks it into concrete steps, executes tools against real infrastructure (reads files, runs code, calls shell commands), observes the results, and iterates until the task is complete — exactly like a human developer would. The critical implementation requirement is security: every tool call that executes code or touches a file system must run inside an isolated Docker container per tenant session. One misconfigured prompt should never be able to access another tenant's workspace or execute privileged system commands.`,
    steps:[
      {title:"Understand the Claude Code harness model",desc:"Claude Code is a structured execution environment — not the AI itself. It defines tool schemas, manages conversation state, executes tool calls in sandboxed environments, and feeds results back to the LLM. Your backend provides the LLM brain.",
       code:`<span style="color:#2a4a60"># The agentic loop in pseudocode</span>
<span style="color:#2a4a60"># 1. User: "Add input validation to login form"</span>
<span style="color:#2a4a60"># 2. LLM plans: need to read the current login file first</span>
<span style="color:#2a4a60"># 3. Harness: executes read_file("src/auth/login.jsx")</span>
<span style="color:#2a4a60"># 4. File contents returned to LLM as tool result</span>
<span style="color:#2a4a60"># 5. LLM analyzes code → plans edit → calls write_file()</span>
<span style="color:#2a4a60"># 6. Harness writes file → runs tests → feeds results back</span>
<span style="color:#2a4a60"># 7. Loop continues until all tests pass or task complete</span>

tools_available = [
    <span style="color:#f59e0b">"read_file"</span>, <span style="color:#f59e0b">"write_file"</span>, <span style="color:#f59e0b">"run_command"</span>,
    <span style="color:#f59e0b">"search_files"</span>, <span style="color:#f59e0b">"web_search"</span>, <span style="color:#f59e0b">"list_dir"</span>
]`},
      {title:"Sandbox all code execution in isolated Docker containers",desc:"Every shell command the agent runs must execute in a freshly created, resource-limited Docker container. Non-negotiable for multi-tenant security.",
       code:`<span style="color:#00d4ff">import</span> docker
client = docker.from_env()

<span style="color:#2a4a60"># runtime="runsc" uses gVisor for kernel-level isolation</span>
<span style="color:#2a4a60"># In Kubernetes: configure a RuntimeClass with handler: runsc</span>
<span style="color:#00d4ff">def</span> create_sandbox(tenant_id: str, workspace: str):
    <span style="color:#00d4ff">return</span> client.containers.run(
        <span style="color:#f59e0b">"agent-sandbox:latest"</span>, detach=<span style="color:#22d3a0">True</span>,
        runtime=<span style="color:#f59e0b">"runsc"</span>,              <span style="color:#2a4a60"># gVisor sandbox</span>
        network=f<span style="color:#f59e0b">"net-{tenant_id}"</span>,     <span style="color:#2a4a60"># isolated network</span>
        volumes={workspace: {<span style="color:#f59e0b">"bind"</span>:<span style="color:#f59e0b">"/workspace"</span>,<span style="color:#f59e0b">"mode"</span>:<span style="color:#f59e0b">"rw"</span>}},
        mem_limit=<span style="color:#f59e0b">"2g"</span>,
        cpu_quota=<span style="color:#22d3a0">50000</span>,            <span style="color:#2a4a60"># 0.5 CPU cap</span>
        security_opt=[<span style="color:#f59e0b">"no-new-privileges"</span>],
    )`},
      {title:"Let enterprise tenants register custom tools",desc:"Enterprise tenants can extend the agent's capabilities with their own internal tools — Jira integration, internal APIs, custom deployment scripts — via a tool registry and webhook execution model.",
       code:`<span style="color:#a855f7">@app.post</span>(<span style="color:#f59e0b">"/v1/tools"</span>)
<span style="color:#a855f7">async def</span> register_tool(tool: ToolDef, tenant=Depends(auth)):
    <span style="color:#a855f7">await</span> db.insert(<span style="color:#f59e0b">"tenant_tools"</span>, {
        <span style="color:#f59e0b">"tenant_id"</span>:   tenant.id,
        <span style="color:#f59e0b">"name"</span>:        tool.name,
        <span style="color:#f59e0b">"schema"</span>:      tool.input_schema,  <span style="color:#2a4a60"># JSON Schema</span>
        <span style="color:#f59e0b">"webhook_url"</span>: tool.webhook_url,   <span style="color:#2a4a60"># tenant endpoint</span>
    })`},
    ],
    tools:[
      {name:"Claude Code (open harness)",role:"AGENT FRAMEWORK",what:"Claude Code's execution loop provides tool definitions (read_file, write_file, run_command, search), conversation state management, file system integration, and a permission system for tool execution — all out of the box. As the article explains: it doesn't verify it's talking to a Claude model. Any Anthropic-API-compatible server works as the brain.",why:"Building a production-grade agentic harness from scratch — with proper tool execution, error recovery, multi-step planning, and permission management — is 6+ months of engineering. Claude Code's harness is battle-tested and familiar to developers. You monetize the infrastructure and isolation layer."},
      {name:"MCP (Model Context Protocol)",role:"TOOL STANDARD",what:"Anthropic's open standard for connecting LLMs to tools and data sources via JSON-RPC. An MCP server exposes a tool catalog that clients (Claude Code, custom harnesses) can discover and invoke. Tools can be local (file operations, shell) or remote (GitHub, Slack, databases).",why:"Building your tool layer on MCP means it's compatible with any MCP-supporting client — future-proofing your platform as the harness ecosystem evolves. MCP is being adopted rapidly as the standard for agentic tool integration."},
      {name:"Sandboxed Docker exec",role:"SECURE EXECUTION",what:"Every shell command or code execution runs in a freshly created Docker container with strict resource limits (CPU, memory, network), an isolated filesystem mounted from the tenant's workspace only, no outbound internet access (unless explicitly configured), and containers destroyed after the session ends.",why:"Without sandboxing, a prompt injection attack could run rm -rf, exfiltrate API keys, or pivot to other tenant environments. Sandbox isolation is the security foundation of the entire multi-tenant agentic platform — it's not optional."},
    ]
  },
  {
    name:"Per-Tenant Knowledge Layer",subtitle:"Ironclad data isolation — each customer's knowledge never touches another's",
    accent:G.blue,abg:"rgba(96,165,250,.15)",
    what:`In multi-tenant SaaS, data isolation is not a feature — it's the product. Every tenant's documents, code, and embeddings must be stored in namespaces that are physically or logically impossible to query across. A bug that lets tenant A's proprietary code appear in tenant B's answers is not a bug report — it's a data breach, a contract termination, and potentially a lawsuit. The knowledge layer enforces this isolation at every level: Qdrant collections are named with tenant-scoped prefixes that only your server generates (never from user input), MinIO buckets are per-tenant with bucket-level IAM policies, and PostgreSQL uses per-tenant schemas with separate connection roles. Tenants upload their documents through your ingestion API — your service handles all chunking, embedding, and storage. Tenants never get direct access to the underlying databases.`,
    steps:[
      {title:"Enforce server-generated collection namespacing",desc:"NEVER allow tenant-provided strings to form part of a collection or database name directly. Generate all namespaces server-side from validated tenant IDs.",
       code:`<span style="color:#2a4a60"># Server-side namespace generation — never trust client input</span>
<span style="color:#00d4ff">def</span> collection_name(tenant_id: str, dtype: str) -> str:
    <span style="color:#2a4a60"># e.g. "t_abc123_docs", "t_abc123_code"</span>
    <span style="color:#00d4ff">return</span> f<span style="color:#f59e0b">"t_{tenant_id}_{dtype}"</span>

<span style="color:#a855f7">async def</span> search(tenant_id: str, vec, dtype: str):
    col = collection_name(tenant_id, dtype)  <span style="color:#2a4a60"># server-side only</span>
    <span style="color:#00d4ff">return</span> qdrant.search(collection_name=col, query_vector=vec)`},
      {title:"Build the tenant document ingestion API",desc:"Tenants POST their documents to your API. Your service handles all parsing, chunking, embedding, and storage — tenants never get direct database access.",
       code:`<span style="color:#a855f7">@app.post</span>(<span style="color:#f59e0b">"/v1/knowledge"</span>)
<span style="color:#a855f7">async def</span> ingest(file: UploadFile, tenant=Depends(auth)):
    text = extract_text(<span style="color:#a855f7">await</span> file.read(), file.content_type)
    chunks = chunk_text(text)
    vectors = <span style="color:#a855f7">await</span> embed_batch(chunks)
    col = collection_name(tenant.id, <span style="color:#f59e0b">"docs"</span>)
    <span style="color:#a855f7">await</span> qdrant.upsert(col, build_points(chunks, vectors))
    <span style="color:#00d4ff">return</span> {<span style="color:#f59e0b">"indexed"</span>: len(chunks)}`},
    ],
    tools:[
      {name:"Qdrant (namespaced collections)",role:"VECTOR ISOLATION",what:"Qdrant's collection model maps perfectly to tenant isolation — each tenant gets their own named collections with completely independent indices, storage files, and API surface. Collections can be created and deleted programmatically as tenants onboard and churn. All operations on a collection are scoped to that collection only.",why:"Simplest and most reliable way to enforce vector-level data isolation. The naming is server-generated and validated — there is no code path where tenant A's collection name could be substituted for tenant B's."},
      {name:"MinIO",role:"OBJECT STORAGE",what:"Self-hosted S3-compatible object storage. Stores raw document files, model artifacts, fine-tuning datasets, and agent session workspaces. Per-tenant buckets with IAM policies that restrict each tenant's service account to their own bucket only. Supports bucket versioning and lifecycle policies for automatic cleanup.",why:"S3-compatible means your code works against MinIO in on-prem deployments and AWS S3 in cloud deployments with zero code changes. Per-bucket IAM policies enforce isolation at the storage layer, complementing the application-layer isolation in Qdrant."},
      {name:"PostgreSQL (per-schema isolation)",role:"METADATA ISOLATION",what:"PostgreSQL schemas give each tenant their own namespace within a single database instance. Tenant metadata, feedback records, document manifests, and usage logs live in their own schema — 'tenant_abc123.documents' cannot be accidentally joined against 'tenant_xyz789.documents'. Separate database roles per tenant enforce this at the connection level.",why:"Efficient for large numbers of tenants (no separate database per tenant) while providing strong logical isolation. Schema-level isolation is enforced by PostgreSQL's permission system, not just application-layer conventions."},
    ]
  },
  {
    name:"Observability & Security",subtitle:"Full audit trails, LLM tracing, PII protection, and real-time operational monitoring",
    accent:G.amber,abg:"rgba(245,158,11,.15)",
    what:`You can't manage what you can't see — and in a multi-tenant AI platform where customers are paying for reliability, you absolutely cannot run blind. Observability here covers three distinct concerns. Operational health: are GPUs running? Is latency within SLA? Is the queue growing? Business metrics: which tenants are at 90% of their token budget? Who's about to churn based on declining usage? AI-specific tracing: what exact prompt caused that hallucinated answer? Why is one tenant's retrieval quality degrading? Standard APM tools don't understand LLM concepts — you need Langfuse for LLM-native tracing on top of Prometheus/Grafana for infrastructure. Security means PII can't leak through LLM outputs, prompt injections can't compromise the sandbox, and every action is logged for the compliance audits enterprise customers will demand.`,
    steps:[
      {title:"Instrument with Langfuse for LLM-native tracing",desc:"Langfuse captures the full chain from user query to retrieved chunks to LLM prompt to response — with latency at each step and feedback scores attached.",
       code:`<span style="color:#00d4ff">from</span> langfuse.decorators <span style="color:#00d4ff">import</span> observe
<span style="color:#00d4ff">from</span> langfuse <span style="color:#00d4ff">import</span> Langfuse

langfuse = Langfuse(public_key=<span style="color:#f59e0b">"pk-lf-..."</span>, secret_key=<span style="color:#f59e0b">"sk-lf-..."</span>)

<span style="color:#a855f7">@observe</span>()  <span style="color:#2a4a60"># auto-traces this entire function</span>
<span style="color:#a855f7">async def</span> run_agent(tenant_id: str, task: str) -> str:
    chunks = <span style="color:#a855f7">await</span> retrieve(tenant_id, task)
    result = <span style="color:#a855f7">await</span> llm.complete(build_prompt(task, chunks))
    <span style="color:#2a4a60"># Langfuse captures: prompt, retrieved context,</span>
    <span style="color:#2a4a60"># token counts, latency, model, tenant_id</span>
    <span style="color:#00d4ff">return</span> result`},
      {title:"Add Presidio PII redaction as middleware",desc:"Scan both ingested documents and LLM outputs for PII before they enter the index or are returned to the client. This is table stakes for healthcare and financial customers.",
       code:`<span style="color:#00d4ff">from</span> presidio_analyzer <span style="color:#00d4ff">import</span> AnalyzerEngine
<span style="color:#00d4ff">from</span> presidio_anonymizer <span style="color:#00d4ff">import</span> AnonymizerEngine

analyzer, anonymizer = AnalyzerEngine(), AnonymizerEngine()

<span style="color:#00d4ff">def</span> redact(text: str) -> str:
    results = analyzer.analyze(text, language=<span style="color:#f59e0b">"en"</span>)
    <span style="color:#00d4ff">return</span> anonymizer.anonymize(text, analyzer_results=results).text

<span style="color:#2a4a60"># Apply pre-index AND pre-response for tenants with PII policy enabled</span>
clean = redact(raw_text)`},
    ],
    tools:[
      {name:"Langfuse",role:"LLM OBSERVABILITY",what:"Open-source observability platform built specifically for LLM applications. Captures complete traces: user input → prompt construction → retrieval results → model call parameters → response. Supports evaluation scoring, prompt version comparison, user feedback correlation, and cost tracking per tenant. Self-hostable.",why:"When a tenant reports 'your agent gave a wrong answer,' you need to see the exact prompt, the exact chunks retrieved, and the exact model response — not just error logs. Langfuse makes LLM debugging possible in a way that Datadog or Grafana cannot."},
      {name:"Grafana + Prometheus",role:"INFRA MONITORING",what:"Prometheus scrapes metrics from all services: vLLM (tokens/second, GPU memory, queue depth), Kong (requests/second, error rates, latency percentiles), Qdrant (query latency, index size), and ClickHouse. Grafana visualizes these with configurable dashboards and alerting rules for SLA breach detection.",why:"The industry-standard open-source monitoring stack. Every service you're running (vLLM, Kong, Qdrant) natively exposes Prometheus metrics — you get comprehensive infrastructure monitoring essentially for free."},
      {name:"Presidio",role:"PII PROTECTION",what:"Microsoft's open-source PII detection and anonymization engine. Detects 50+ entity types (names, emails, SSNs, credit cards, phone numbers, IP addresses) across 15+ languages using a combination of ML models and rule-based recognizers. Anonymizes by replacement with entity-type placeholders or synthetic data.",why:"Enterprise customers in healthcare, finance, and legal will ask 'how do you ensure our data doesn't contain PII?' before signing. Presidio gives you a demonstrable, auditable answer — automated PII redaction at ingest and output — rather than a policy statement."},
      {name:"OpenTelemetry",role:"DISTRIBUTED TRACING",what:"An open standard for instrumenting distributed systems with traces, metrics, and logs. Single SDK instruments FastAPI, Kong, Qdrant, and vLLM with a consistent tracing model. Trace IDs propagate across service boundaries so a single slow request can be traced from gateway to inference and back with per-service latency breakdown.",why:"When a request is slow, you need to know exactly which service caused the latency — was it retrieval? Embedding? LLM inference? Network? OpenTelemetry's distributed traces give you precise attribution across your entire service mesh."},
    ]
  },
  {
    name:"SDK / CLI Delivery Layer",subtitle:"The polished developer experience that tenants actually want to use every day",
    accent:G.red,abg:"rgba(248,113,113,.15)",
    what:`This is the last mile of the product — how your platform actually gets into developers' daily workflows. The article's author wrote a custom shell script called 'lcc' to make Claude Code connect seamlessly to their local inference server. You're productizing that experience. Your CLI abstracts away all infrastructure complexity: tenants don't need to know about vLLM, Qdrant, or Kubernetes — they run 'localmind run fix this bug' and get a full agentic assistant connected to their codebase, running on your infrastructure, with their own isolated knowledge base. The CLI experience quality is a direct retention lever — a tool developers reach for habitually because it's fast and frictionless has fundamentally different churn dynamics than one they use reluctantly. This layer is also where you build the VS Code extension that puts your product inside the world's most popular development environment.`,
    steps:[
      {title:"Build the CLI as a pip-installable Python package",desc:"A single install command, a single auth command, and tenants have a fully working agentic assistant. The CLI wraps Claude Code, pointing it at your tenant-specific backend URL with their API key injected.",
       code:`<span style="color:#2a4a60"># localmind/cli.py — custom agent harness (no claude binary dependency)</span>
<span style="color:#2a4a60"># Note: redistributing Claude Code requires Anthropic licensing approval</span>
<span style="color:#00d4ff">import</span> typer, asyncio, os, httpx, json
app = typer.Typer()

<span style="color:#a855f7">@app.command</span>()
<span style="color:#a855f7">def</span> run(task: str = typer.Argument(<span style="color:#22d3a0">None</span>)):
    asyncio.run(_run(task))

<span style="color:#a855f7">async def</span> _run(task: str):
    key = os.environ[<span style="color:#f59e0b">"LOCALMIND_API_KEY"</span>]
    <span style="color:#a855f7">async with</span> httpx.AsyncClient(base_url=<span style="color:#f59e0b">"https://api.localmind.ai"</span>,
            headers={<span style="color:#f59e0b">"X-API-Key"</span>: key}, timeout=<span style="color:#22d3a0">120</span>) <span style="color:#a855f7">as</span> client:
        resp = <span style="color:#a855f7">await</span> client.post(<span style="color:#f59e0b">"/v1/agent/run"</span>,
            json={<span style="color:#f59e0b">"task"</span>: task, <span style="color:#f59e0b">"stream"</span>: <span style="color:#22d3a0">True</span>})
        <span style="color:#a855f7">async for</span> line <span style="color:#a855f7">in</span> resp.aiter_lines():
            <span style="color:#a855f7">if</span> line.startswith(<span style="color:#f59e0b">"data: "</span>):
                print(json.loads(line[<span style="color:#22d3a0">6</span>:])[<span style="color:#f59e0b">"text"</span>], end=<span style="color:#f59e0b">""</span>, flush=<span style="color:#22d3a0">True</span>)`},
      {title:"Auto-generate typed SDKs from your OpenAPI spec",desc:"Generate idiomatic API clients for Python, TypeScript, and Go from your OpenAPI spec. Tenants can embed your agentic AI in their own applications programmatically.",
       code:`<span style="color:#2a4a60"># Generate Python SDK</span>
openapi-generator-cli generate \
  -i https://api.localmind.ai/openapi.json \
  -g python -o ./sdk/python \
  --additional-properties packageName=localmind

<span style="color:#2a4a60"># Generated SDK usage</span>
<span style="color:#00d4ff">from</span> localmind <span style="color:#00d4ff">import</span> LocalMindClient
client = LocalMindClient(api_key=<span style="color:#f59e0b">"lm-sk-..."</span>)
result = client.agents.run(
    task=<span style="color:#f59e0b">"Refactor auth module to use JWT"</span>,
    workspace=<span style="color:#f59e0b">"/path/to/repo"</span>
)`},
      {title:"Build a VS Code extension for in-editor experience",desc:"A VS Code extension puts your product inside the editor with zero context switch — inline agent commands, chat panel, and code suggestions all routed through your platform.",
       code:`<span style="color:#2a4a60">// extension.ts</span>
<span style="color:#00d4ff">import</span> * <span style="color:#00d4ff">as</span> vscode <span style="color:#00d4ff">from</span> <span style="color:#f59e0b">'vscode'</span>;
<span style="color:#a855f7">export function</span> activate(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand(<span style="color:#f59e0b">'localmind.run'</span>, async () => {
      <span style="color:#a855f7">const</span> task = <span style="color:#a855f7">await</span> vscode.window.showInputBox(
        {prompt: <span style="color:#f59e0b">'What should the agent do?'</span>});
      <span style="color:#a855f7">if</span> (task) <span style="color:#a855f7">await</span> client.agents.run({
        task, workspace: vscode.workspace.rootPath });
    })
  );
}`},
    ],
    tools:[
      {name:"Typer / Click",role:"CLI FRAMEWORK",what:"Typer is built on top of Click and uses Python type hints to auto-generate CLI argument parsers, help text, and shell completion scripts. Click provides the underlying command routing, option parsing, error formatting, and colored terminal output.",why:"The CLI is the primary touch point for developer tenants every single day. A well-built CLI with good help text, autocomplete, and clear error messages is the difference between a tool developers love and one they resent. Typer/Click give you that quality in a fraction of the time."},
      {name:"OpenAPI Generator",role:"SDK GENERATION",what:"Generates fully typed, idiomatic API client libraries in 50+ languages from an OpenAPI 3.0 specification. Produces request/response types, retry logic, authentication handling, and pagination support. Runs as a Docker container or CLI tool.",why:"Writing and maintaining SDKs in multiple languages manually is prohibitively expensive. Auto-generation means your Python, TypeScript, and Go SDKs are always synchronized with your API spec and you ship language support essentially for free."},
      {name:"VS Code Extension API",role:"EDITOR INTEGRATION",what:"VS Code's extension API lets you add commands, sidebar panels, inline code suggestions, hover providers, and context menu items to the world's most popular code editor. Extensions are distributed via the VS Code Marketplace with automatic updates.",why:"Developer tools that integrate into the editor get dramatically higher daily usage than standalone tools that require context switching. An in-editor experience is one of the strongest retention and daily-active-user drivers available to a developer tools company."},
    ]
  },
];

function Code({ html }) {
  return <div className="code-block" dangerouslySetInnerHTML={{ __html: html }} />;
}

function ToolCard({ t, accent }) {
  return (
    <div className="tool-card">
      <div className="tool-header">
        <span className="tool-name">{t.name}</span>
        <span className="tool-role" style={{ background: accent + "18", color: accent, border: `1px solid ${accent}40` }}>{t.role}</span>
      </div>
      <div className="tool-what">{t.what}</div>
      <div className="tool-why"><b>Why this over alternatives: </b>{t.why}</div>
    </div>
  );
}

function Step({ s, accent, last }) {
  return (
    <div className="impl-step">
      <div className="impl-connector">
        <div className="impl-dot" style={{ background: accent + "20", color: accent, border: `1px solid ${accent}50` }}>▸</div>
        {!last && <div className="impl-line" style={{ background: accent + "22" }} />}
      </div>
      <div className="impl-content">
        <div className="impl-title">{s.title}</div>
        <div className="impl-desc">{s.desc}</div>
        {s.code && <Code html={s.code} />}
      </div>
    </div>
  );
}

function Layer({ layer, index }) {
  const [open, setOpen] = useState(false);
  const a = layer.accent;
  return (
    <div className="layer-card" style={{ borderColor: open ? a + "40" : undefined }}>
      <div className="layer-header" onClick={() => setOpen(!open)}>
        <div className="layer-num" style={{ background: layer.abg, color: a }}>{String(index + 1).padStart(2, "0")}</div>
        <div className="layer-title-wrap">
          <div className="layer-name">{layer.name}</div>
          <div className="layer-subtitle">{layer.subtitle}</div>
        </div>
        <div className={`layer-arrow ${open ? "open" : ""}`}>▾</div>
      </div>
      {open && (
        <div className="layer-body">
          <div className="sub-section">
            <div className="sub-label" style={{ color: a }}>
              <span style={{ background: a, display: "inline-block", width: 3, height: 12, borderRadius: 2, flexShrink: 0 }} />
              What This Layer Does
            </div>
            <div className="what-box">{layer.what}</div>
          </div>
          <div className="sub-section">
            <div className="sub-label" style={{ color: a }}>
              <span style={{ background: a, display: "inline-block", width: 3, height: 12, borderRadius: 2, flexShrink: 0 }} />
              How To Implement It
            </div>
            <div className="impl-steps">
              {layer.steps.map((s, i) => <Step key={i} s={s} accent={a} last={i === layer.steps.length - 1} />)}
            </div>
          </div>
          <div className="sub-section" style={{ marginBottom: 0 }}>
            <div className="sub-label" style={{ color: a }}>
              <span style={{ background: a, display: "inline-block", width: 3, height: 12, borderRadius: 2, flexShrink: 0 }} />
              Tool Breakdown — What Each One Actually Achieves
            </div>
            <div className="tools-grid">
              {layer.tools.map((t, i) => <ToolCard key={i} t={t} accent={a} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [arch, setArch] = useState("aria");
  const layers = arch === "aria" ? ARCH1 : ARCH2;

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  const a = arch === "aria" ? G.cyan : G.purple;

  return (
    <>
      <style>{css}</style>
      <div className="root">
        <div className="hero">
          <div className="hero-tag">Full Stack Deep Dive</div>
          <h1>Every Layer. Every Tool.<br />Every Implementation Step.</h1>
          <p>Click any layer card to expand the full breakdown — what it does, how to build it step by step with code, and exactly why each tool was chosen over its alternatives.</p>
        </div>
        <div className="arch-tabs">
          <button className={`arch-tab ${arch === "aria" ? "t-cyan" : ""}`} onClick={() => setArch("aria")}>
            🏢 Arch 1 — ARIA Internal Chatbot
          </button>
          <button className={`arch-tab ${arch === "localmind" ? "t-purple" : ""}`} onClick={() => setArch("localmind")}>
            🚀 Arch 2 — LocalMind SaaS Platform
          </button>
        </div>
        <div className={`arch-intro ${arch === "aria" ? "ai-cyan" : "ai-purple"}`}>
          {arch === "aria" ? (
            <><span className="ai-strong-cyan">ARIA — Adaptive Retrieval Intelligence Architecture</span>On-prem AI chatbot deployed inside the customer's network. Zero-Egress installs the system, trains internal engineers to maintain it, and provides ongoing support. All inference runs locally. True zero data egress.</>
          ) : (
            <><span className="ai-strong-purple">LocalMind — Privacy-First Agentic AI SaaS Platform</span>Multi-tenant agentic AI platform. Dual delivery: hosted SaaS or on-prem installation. Hosted: no third-party AI dependency, all data stays within LocalMind infrastructure. On-prem: true zero data egress. Install, train, support model.</>
          )}
        </div>
        <div className="sec-label" style={{ color: a }}>{layers.length} Layers — Click Each to Expand</div>
        {layers.map((l, i) => <Layer key={i} layer={l} index={i} />)}
        <div className="footer-bar">
          {arch === "aria" ? "ARIA · 8 Layers · Self-Learning · Hybrid Deploy · Zero Cloud Dependency" : "LocalMind · 8 Layers · Multi-Tenant · Agentic · Privacy-First SaaS"}
        </div>
      </div>
    </>
  );
}
