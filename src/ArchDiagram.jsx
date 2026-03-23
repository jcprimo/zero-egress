import { useState } from "react";

const G = {
  bg: "#07090f", surface: "#0c1018", card: "#101520", border: "#182030",
  borderHover: "#243550", text: "#d0dff0", muted: "#4a6280", faint: "#1a2535",
  cyan: "#00d4ff", purple: "#a855f7", green: "#22d3a0", amber: "#f59e0b",
  red: "#f87171", blue: "#60a5fa",
};

// ─── ARIA Data ────────────────────────────────────────────────────────────────

const ARIA_NODES = [
  // Data Sources (y=40)
  { id:"slack",       x:80,  y:40,  label:"Slack",         sub:"Bolt SDK",           desc:"Real-time Slack event connector. Captures messages and threads via Bolt SDK and publishes normalized payloads to the Kafka event bus." },
  { id:"confluence",  x:230, y:40,  label:"Confluence",    sub:"REST API",            desc:"Polls Confluence pages and spaces via REST API on a schedule. Extracts page content, metadata, and author information." },
  { id:"github",      x:380, y:40,  label:"GitHub",        sub:"Webhooks",            desc:"Receives push and PR events via GitHub webhooks. Indexes code changes, commit messages, and pull request discussions." },
  { id:"crm",         x:530, y:40,  label:"CRM",           sub:"API Polling",         desc:"Polls CRM records on a configurable schedule. Extracts customer notes, deal history, and support ticket content." },
  { id:"pdf",         x:700, y:40,  label:"PDF Upload",    sub:"Unstructured.io",     desc:"Accepts PDF and document uploads. Routes to Unstructured.io for layout-aware text extraction before ingestion." },
  // Ingestion (y=140)
  { id:"n8n",         x:180, y:140, label:"n8n",           sub:"Orchestrator",        desc:"Workflow orchestrator that coordinates connector scheduling, retry logic, and routing rules between data sources and the event bus." },
  { id:"kafka",       x:450, y:140, label:"Kafka",         sub:"Event Bus (KRaft)",   desc:"Central event bus in KRaft mode (no ZooKeeper). Decouples connectors from processing — messages queue safely if downstream is busy." },
  { id:"unstructured",x:700, y:140, label:"Parser",        sub:"Unstructured.io",     desc:"Extracts and normalizes text from PDFs, Word docs, HTML, and images. Preserves layout context (tables, headers, captions)." },
  // Processing (y=250)
  { id:"chunker",     x:150, y:250, label:"Chunking",      sub:"LangChain + spaCy",   desc:"Splits documents into semantically meaningful chunks using sentence-boundary detection (spaCy) and recursive text splitting (LangChain)." },
  { id:"embedder",    x:420, y:250, label:"Embedding",     sub:"Ollama + nomic",      desc:"Converts text chunks to dense vector embeddings using the nomic-embed-text model via Ollama. Runs entirely on local hardware." },
  { id:"pgmeta",      x:680, y:250, label:"Metadata",      sub:"PostgreSQL",          desc:"Stores document metadata: source, author, timestamp, chunk index, and document hash. Used for filtering and deduplication." },
  // Storage + Inference (y=370)
  { id:"qdrant",      x:150, y:370, label:"Qdrant",        sub:"Vector DB",           desc:"Stores and indexes vector embeddings. Serves approximate nearest-neighbor search queries with sub-millisecond latency at scale." },
  { id:"minio",       x:320, y:370, label:"MinIO",         sub:"Raw Documents",       desc:"S3-compatible object storage for raw documents. Enables reindexing if the embedding model or chunking strategy changes." },
  { id:"ollama",      x:520, y:370, label:"Ollama",        sub:"Local LLM",           desc:"Serves open-weight LLMs locally via a REST API. Primary inference engine for CPU/consumer GPU deployments." },
  { id:"vllm",        x:700, y:370, label:"vLLM",          sub:"GPU Inference",       desc:"High-throughput LLM serving with PagedAttention and continuous batching. Used when NVIDIA GPUs are available for higher concurrency." },
  // Orchestration (y=480)
  { id:"llamaindex",  x:350, y:480, label:"LlamaIndex",    sub:"RAG Engine",          desc:"Orchestrates the full RAG pipeline: query rewriting, hybrid retrieval (vector + keyword), reranking, and prompt construction." },
  { id:"fastapi",     x:600, y:480, label:"FastAPI",       sub:"WebSocket API",       desc:"Async API server. Exposes WebSocket endpoint for streaming chat responses. Handles session management and request routing." },
  // Interface (y=580)
  { id:"webui",       x:200, y:580, label:"Open WebUI",    sub:"Chat Interface",      desc:"Self-hosted chat interface with conversation history, model switching, and document upload UI. Deployed behind Nginx." },
  { id:"keycloak",    x:420, y:580, label:"Keycloak",      sub:"SSO/LDAP",            desc:"Identity provider. Handles employee SSO via LDAP/AD integration. Issues JWT tokens validated by FastAPI middleware." },
  { id:"nginx",       x:620, y:580, label:"Nginx",         sub:"TLS Proxy",           desc:"Terminates TLS, routes traffic to Open WebUI and FastAPI, and enforces access controls at the network edge." },
  // Learning Loop (right side)
  { id:"argilla",     x:880, y:250, label:"Argilla",       sub:"Feedback",            desc:"Captures human feedback on model responses. Analysts review and label outputs, creating a fine-tuning dataset." },
  { id:"unsloth",     x:880, y:370, label:"Unsloth",       sub:"LoRA Training",       desc:"Efficient LoRA/QLoRA fine-tuning framework. Runs on a single GPU overnight using the labeled feedback dataset from Argilla." },
  { id:"mlflow",      x:880, y:480, label:"MLflow",        sub:"Model Registry",      desc:"Tracks training runs, stores model artifacts, and manages version promotion. Newly trained adapters are registered before deployment." },
];

const ARIA_EDGES = [
  // Data sources -> kafka
  { from:"slack",      to:"kafka",      dashed:false },
  { from:"confluence", to:"kafka",      dashed:false },
  { from:"github",     to:"kafka",      dashed:false },
  { from:"crm",        to:"kafka",      dashed:false },
  { from:"pdf",        to:"unstructured",dashed:false },
  // n8n -> kafka
  { from:"n8n",        to:"kafka",      dashed:false },
  // kafka -> unstructured, minio
  { from:"kafka",      to:"unstructured",dashed:false },
  { from:"kafka",      to:"minio",      dashed:false },
  // unstructured -> chunker
  { from:"unstructured",to:"chunker",   dashed:false },
  // chunker -> embedder, pgmeta
  { from:"chunker",    to:"embedder",   dashed:false },
  { from:"chunker",    to:"pgmeta",     dashed:false },
  // embedder -> qdrant, pgmeta
  { from:"embedder",   to:"qdrant",     dashed:false },
  { from:"embedder",   to:"pgmeta",     dashed:false },
  // qdrant, ollama, vllm -> llamaindex
  { from:"qdrant",     to:"llamaindex", dashed:false },
  { from:"ollama",     to:"llamaindex", dashed:false },
  { from:"vllm",       to:"llamaindex", dashed:false },
  // llamaindex -> fastapi
  { from:"llamaindex", to:"fastapi",    dashed:false },
  // fastapi -> nginx
  { from:"fastapi",    to:"nginx",      dashed:false },
  // nginx -> webui
  { from:"nginx",      to:"webui",      dashed:false },
  // keycloak -> nginx
  { from:"keycloak",   to:"nginx",      dashed:false },
  // learning loop (dashed)
  { from:"fastapi",    to:"argilla",    dashed:true  },
  { from:"argilla",    to:"unsloth",    dashed:true  },
  { from:"unsloth",    to:"mlflow",     dashed:true  },
  { from:"mlflow",     to:"ollama",     dashed:true  },
];

const ARIA_ZONES = [
  { id:"sources",     label:"DATA SOURCES",        x:40,  y:15,  w:790, h:80,  color:G.cyan   },
  { id:"ingestion",   label:"INGESTION",            x:40,  y:110, w:790, h:80,  color:G.cyan   },
  { id:"processing",  label:"PROCESSING",           x:40,  y:220, w:790, h:90,  color:G.green  },
  { id:"storage",     label:"STORAGE + INFERENCE",  x:40,  y:335, w:790, h:95,  color:G.blue   },
  { id:"orch",        label:"ORCHESTRATION",         x:40,  y:450, w:790, h:80,  color:G.green  },
  { id:"interface",   label:"INTERFACE",             x:40,  y:550, w:790, h:75,  color:G.red    },
  { id:"learning",    label:"LEARNING LOOP",         x:845, y:220, w:120, h:315, color:G.amber, dashed:true },
];

// ─── LocalMind Data ───────────────────────────────────────────────────────────

const LM_NODES = [
  // Clients (x=40)
  { id:"cli",         x:40,  y:150, label:"CLI",            sub:"Typer + httpx",       desc:"Command-line interface installable via pip. Wraps the inference API and provides streaming agentic task execution from the terminal." },
  { id:"sdk",         x:40,  y:300, label:"SDK",            sub:"Python/TS/Go",        desc:"Auto-generated typed API clients for Python, TypeScript, and Go. Allows tenants to embed agentic AI in their own applications." },
  { id:"vscode",      x:40,  y:450, label:"VS Code",        sub:"Extension",           desc:"VS Code extension that adds inline agent commands, a chat panel, and code suggestions routed through the LocalMind platform." },
  // Gateway (x=220)
  { id:"kong",        x:220, y:200, label:"Kong",           sub:"API Gateway",         desc:"API gateway handling tenant authentication, JWT validation, rate limiting, request routing, and usage logging to ClickHouse." },
  { id:"redis",       x:220, y:350, label:"Redis",          sub:"Rate Limits",         desc:"Stores per-tenant rate limit counters and sliding window buckets. Kong reads these synchronously before proxying requests." },
  { id:"clickhouse",  x:220, y:480, label:"ClickHouse",     sub:"Usage Analytics",     desc:"Columnar database for high-volume usage event ingestion. Stores per-tenant token counts, latency, and error rates for billing and analytics." },
  // Control Plane (top)
  { id:"tenants",     x:400, y:40,  label:"Tenant Registry",sub:"PostgreSQL",          desc:"Source of truth for tenant plans, quotas, LoRA adapter assignments, and billing status. Kong reads this to make routing decisions." },
  { id:"stripe",      x:580, y:40,  label:"Stripe",         sub:"Billing",             desc:"Handles subscription management, usage-based billing webhooks, and plan upgrades. Stripe events update the tenant registry." },
  { id:"terraform",   x:760, y:40,  label:"Terraform",      sub:"K8s Provisioning",    desc:"Provisions Kubernetes namespaces, GPU resource quotas, and network policies for new enterprise tenants automatically." },
  // Routing (x=420)
  { id:"router",      x:420, y:280, label:"Inference Router",sub:"Plan-Based Routing", desc:"Routes inference requests to the correct backend based on tenant plan. Starter/Pro -> vLLM shared tier. Enterprise -> dedicated pod." },
  // Inference (x=620)
  { id:"vllm-shared", x:620, y:170, label:"vLLM Shared",   sub:"Multi-LoRA",           desc:"Shared vLLM instance serving starter and pro tenants with continuous batching and per-request LoRA adapter swapping." },
  { id:"llama-ent",   x:620, y:320, label:"Enterprise LLM",sub:"Dedicated Pod",        desc:"Dedicated llama-server process per enterprise tenant. Isolated GPU memory — no KV cache sharing with other tenants." },
  { id:"k8s",         x:620, y:460, label:"Kubernetes",     sub:"GPU Operator",        desc:"Schedules inference containers across GPU nodes. NVIDIA GPU Operator manages driver installation and resource quota enforcement." },
  // Agentic (x=420, y=450)
  { id:"harness",     x:420, y:450, label:"Agent Harness",  sub:"Tool-Use Loop",       desc:"Implements the agentic execution loop: receives a task, calls tools (read_file, run_command, web_search), observes results, and iterates." },
  { id:"mcp",         x:560, y:450, label:"MCP",            sub:"Tool Protocol",       desc:"Model Context Protocol server exposes the tool catalog to the harness. Enables tool discovery and JSON-RPC execution." },
  { id:"sandbox",     x:420, y:560, label:"Sandbox",        sub:"gVisor Runtime",      desc:"Each tool execution that runs code does so in a fresh gVisor container. Kernel-level isolation prevents tenant cross-contamination." },
  // Knowledge (x=700, y=480)
  { id:"qdrant-ns",   x:700, y:480, label:"Qdrant",         sub:"Per-Tenant Vectors",  desc:"Per-tenant Qdrant collections with server-generated namespace prefixes. Tenant A's embeddings are physically isolated from Tenant B's." },
  { id:"minio-ns",    x:830, y:480, label:"MinIO",          sub:"Per-Tenant Files",    desc:"Per-tenant MinIO buckets with IAM policies. Stores raw documents, model artifacts, and agent session workspaces." },
  { id:"pg-schema",   x:700, y:570, label:"PostgreSQL",     sub:"Per-Schema",          desc:"Per-tenant PostgreSQL schemas for metadata, feedback, and document manifests. Separate roles enforce schema-level access control." },
  // Observability (x=880)
  { id:"otel",        x:880, y:100, label:"OpenTelemetry",  sub:"Distributed Tracing", desc:"Instruments all services with a consistent tracing model. Trace IDs propagate across service boundaries for end-to-end latency attribution." },
  { id:"langfuse",    x:880, y:170, label:"Langfuse",       sub:"LLM Traces",          desc:"Captures full LLM traces: prompt, retrieved chunks, model parameters, token counts, and latency per tenant." },
  { id:"grafana",     x:880, y:280, label:"Grafana",        sub:"Metrics",             desc:"Visualizes Prometheus metrics from vLLM, Kong, Qdrant, and ClickHouse. Alerting rules fire on SLA breach or GPU saturation." },
  { id:"presidio",    x:880, y:390, label:"Presidio",       sub:"PII Redaction",       desc:"Scans ingested documents and LLM outputs for 50+ PII entity types. Anonymizes before indexing or returning to the client." },
];

const LM_EDGES = [
  // Clients -> kong
  { from:"cli",       to:"kong",        dashed:false },
  { from:"sdk",       to:"kong",        dashed:false },
  { from:"vscode",    to:"kong",        dashed:false },
  // kong -> redis, router, clickhouse
  { from:"kong",      to:"redis",       dashed:false },
  { from:"kong",      to:"router",      dashed:false },
  { from:"kong",      to:"clickhouse",  dashed:true  },
  { from:"kong",      to:"presidio",    dashed:true  },
  // router -> inference
  { from:"router",    to:"vllm-shared", dashed:false },
  { from:"router",    to:"llama-ent",   dashed:false },
  { from:"router",    to:"langfuse",    dashed:true  },
  // inference -> harness
  { from:"vllm-shared",to:"harness",   dashed:false },
  { from:"llama-ent", to:"harness",    dashed:false },
  // harness -> mcp, sandbox
  { from:"harness",   to:"mcp",         dashed:false },
  { from:"harness",   to:"sandbox",     dashed:false },
  // sandbox -> knowledge
  { from:"sandbox",   to:"qdrant-ns",   dashed:false },
  { from:"sandbox",   to:"minio-ns",    dashed:false },
  // control plane
  { from:"tenants",   to:"kong",        dashed:true  },
  { from:"stripe",    to:"tenants",     dashed:true  },
  { from:"terraform", to:"k8s",         dashed:false },
  { from:"k8s",       to:"llama-ent",   dashed:false },
  // otel
  { from:"kong",      to:"otel",        dashed:true  },
  { from:"router",    to:"otel",        dashed:true  },
  { from:"vllm-shared",to:"otel",      dashed:true  },
];

const LM_ZONES = [
  { id:"clients",     label:"CLIENTS",         x:10,  y:100, w:145, h:410, color:G.purple },
  { id:"gateway",     label:"API GATEWAY",     x:175, y:150, w:175, h:380, color:G.amber  },
  { id:"control",     label:"CONTROL PLANE",   x:360, y:10,  w:490, h:70,  color:G.purple },
  { id:"inference",   label:"INFERENCE",       x:585, y:120, w:215, h:380, color:G.green  },
  { id:"agentic",     label:"AGENTIC",         x:385, y:420, w:210, h:175, color:G.purple, dashed:true },
  { id:"knowledge",   label:"KNOWLEDGE",       x:670, y:450, w:210, h:155, color:G.blue   },
  { id:"observ",      label:"OBSERVABILITY",   x:850, y:60,  w:130, h:370, color:G.amber  },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

const NODE_W = 120;
const NODE_H = 50;

function nodeCenter(node) {
  return { cx: node.x + NODE_W / 2, cy: node.y + NODE_H / 2 };
}

function edgePath(fromNode, toNode) {
  const { cx: x1, cy: y1 } = nodeCenter(fromNode);
  const { cx: x2, cy: y2 } = nodeCenter(toNode);
  const dx = x2 - x1;
  const dy = y2 - y1;
  // Use cubic bezier for smooth routing
  const cx1 = x1 + dx * 0.5;
  const cy1 = y1;
  const cx2 = x1 + dx * 0.5;
  const cy2 = y2;
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}

function connectedNodeIds(nodeId, edges) {
  const ids = new Set();
  edges.forEach(e => {
    if (e.from === nodeId) ids.add(e.to);
    if (e.to === nodeId) ids.add(e.from);
  });
  return ids;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ArchDiagram({ variant }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const isAria = variant === "aria";
  const nodes  = isAria ? ARIA_NODES  : LM_NODES;
  const edges  = isAria ? ARIA_EDGES  : LM_EDGES;
  const zones  = isAria ? ARIA_ZONES  : LM_ZONES;
  const accent = isAria ? G.cyan      : G.purple;
  const viewW  = 1000;
  const viewH  = isAria ? 650 : 640;

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  const connected = hoveredNode ? connectedNodeIds(hoveredNode, edges) : new Set();
  const hoveredNodeData = hoveredNode ? nodeMap[hoveredNode] : null;

  function nodeOpacity(id) {
    if (!hoveredNode) return 1;
    if (id === hoveredNode || connected.has(id)) return 1;
    return 0.3;
  }

  function edgeOpacity(e) {
    if (!hoveredNode) return 0.35;
    if (e.from === hoveredNode || e.to === hoveredNode) return 1;
    return 0.08;
  }

  const markerId = `arrow-${variant}`;

  return (
    <div className="arch-diagram-wrap">
      <svg
        className="arch-diagram-svg"
        viewBox={`0 0 ${viewW} ${viewH}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`${isAria ? "A.R.I.A." : "LocalMind"} architecture diagram`}
      >
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={accent} opacity="0.7" />
          </marker>
          <filter id={`glow-${variant}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Zero egress boundary */}
        <rect
          x={8} y={8} width={viewW - 16} height={viewH - 16}
          rx={14} fill="none"
          stroke={accent} strokeOpacity={0.22}
          strokeWidth={1.5} strokeDasharray="8 6"
        />
        <text
          x={viewW / 2} y={22}
          textAnchor="middle"
          fontFamily="'IBM Plex Mono', monospace"
          fontSize={9}
          letterSpacing={2}
          fill={accent}
          opacity={0.7}
          textTransform="uppercase"
        >
          ZERO EGRESS BOUNDARY
        </text>

        {/* Zones */}
        {zones.map(z => (
          <g key={z.id}>
            <rect
              x={z.x} y={z.y} width={z.w} height={z.h}
              rx={8} fill={z.color} fillOpacity={0.03}
              stroke={z.color} strokeOpacity={0.18}
              strokeWidth={1}
              strokeDasharray={z.dashed ? "5 4" : undefined}
            />
            <text
              x={z.x + 8} y={z.y + 13}
              fontFamily="'IBM Plex Mono', monospace"
              fontSize={9}
              letterSpacing={2}
              fill={z.color}
              opacity={0.8}
            >
              {z.label}
            </text>
          </g>
        ))}

        {/* Edges */}
        {edges.map((e, i) => {
          const fromNode = nodeMap[e.from];
          const toNode   = nodeMap[e.to];
          if (!fromNode || !toNode) return null;
          const op = edgeOpacity(e);
          const isActive = hoveredNode && (e.from === hoveredNode || e.to === hoveredNode);
          return (
            <path
              key={i}
              d={edgePath(fromNode, toNode)}
              fill="none"
              stroke={accent}
              strokeOpacity={op}
              strokeWidth={isActive ? 2 : 1.5}
              strokeDasharray={e.dashed ? "6 4" : undefined}
              markerEnd={`url(#${markerId})`}
              style={e.dashed ? { animation: "dash-flow 1.2s linear infinite" } : undefined}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(n => {
          const op = nodeOpacity(n.id);
          const isHovered = hoveredNode === n.id;
          return (
            <g
              key={n.id}
              style={{ cursor: "pointer", opacity: op, transition: "opacity 0.15s" }}
              onMouseEnter={() => setHoveredNode(n.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect
                x={n.x} y={n.y}
                width={NODE_W} height={NODE_H}
                rx={8}
                fill={G.faint}
                stroke={accent}
                strokeOpacity={isHovered ? 0.9 : 0.35}
                strokeWidth={isHovered ? 1.5 : 1}
                filter={isHovered ? `url(#glow-${variant})` : undefined}
              />
              <text
                x={n.x + NODE_W / 2} y={n.y + 20}
                textAnchor="middle"
                fontFamily="'Syne', sans-serif"
                fontSize={12}
                fontWeight={600}
                fill={G.text}
              >
                {n.label}
              </text>
              <text
                x={n.x + NODE_W / 2} y={n.y + 34}
                textAnchor="middle"
                fontFamily="'IBM Plex Mono', monospace"
                fontSize={9}
                fill={G.muted}
              >
                {n.sub}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredNodeData ? (
        <div className="arch-tooltip">
          <strong>{hoveredNodeData.label}</strong>
          {hoveredNodeData.desc}
        </div>
      ) : (
        <div className="arch-tooltip" style={{ color: G.muted, opacity: 0.5 }}>
          Hover a node to see details.
        </div>
      )}
    </div>
  );
}
