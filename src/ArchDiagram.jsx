import { useState } from "react";

const G = {
  bg: "#07090f", surface: "#0c1018", card: "#101520", border: "#182030",
  borderHover: "#243550", text: "#d0dff0", muted: "#4a6280", faint: "#1a2535",
  cyan: "#00d4ff", purple: "#a855f7", green: "#22d3a0", amber: "#f59e0b",
  red: "#f87171", blue: "#60a5fa",
};

// ─── ARIA Data ────────────────────────────────────────────────────────────────
// Layout: 7 horizontal bands across full width (x=30 to x=1170)
// Node width=140, height=46. Rows spaced 110px apart starting y=60.

const ARIA_NODES = [
  // Row 1 (y=60): DATA SOURCES
  { id:"slack",        x:60,   y:60,  label:"Slack",         sub:"Bolt SDK",           desc:"Real-time Slack event connector. Captures messages and threads via Bolt SDK and publishes normalized payloads to the Kafka event bus." },
  { id:"confluence",   x:240,  y:60,  label:"Confluence",    sub:"REST API",            desc:"Polls Confluence pages and spaces via REST API on a schedule. Extracts page content, metadata, and author information." },
  { id:"github",       x:420,  y:60,  label:"GitHub",        sub:"Webhooks",            desc:"Receives push and PR events via GitHub webhooks. Indexes code changes, commit messages, and pull request discussions." },
  { id:"crm",          x:600,  y:60,  label:"CRM",           sub:"API Polling",         desc:"Polls CRM records on a configurable schedule. Extracts customer notes, deal history, and support ticket content." },
  { id:"pdf",          x:800,  y:60,  label:"PDF Upload",    sub:"Unstructured.io",     desc:"Accepts PDF and document uploads. Routes to Unstructured.io for layout-aware text extraction before ingestion." },

  // Row 2 (y=170): INGESTION
  { id:"n8n",          x:200,  y:170, label:"n8n",           sub:"Orchestrator",        desc:"Workflow orchestrator that coordinates connector scheduling, retry logic, and routing rules between data sources and the event bus." },
  { id:"kafka",        x:500,  y:170, label:"Kafka",         sub:"Event Bus (KRaft)",   desc:"Central event bus in KRaft mode (no ZooKeeper). Decouples connectors from processing -- messages queue safely if downstream is busy." },
  { id:"unstructured", x:800,  y:170, label:"Parser",        sub:"Unstructured.io",     desc:"Extracts and normalizes text from PDFs, Word docs, HTML, and images. Preserves layout context (tables, headers, captions)." },

  // Row 3 (y=280): PROCESSING
  { id:"chunker",      x:200,  y:280, label:"Chunking",      sub:"LangChain + spaCy",   desc:"Splits documents into semantically meaningful chunks using sentence-boundary detection (spaCy) and recursive text splitting (LangChain)." },
  { id:"embedder",     x:500,  y:280, label:"Embedding",     sub:"Ollama + nomic",      desc:"Converts text chunks to dense vector embeddings using the nomic-embed-text model via Ollama. Runs entirely on local hardware." },
  { id:"pgmeta",       x:800,  y:280, label:"Metadata",      sub:"PostgreSQL",          desc:"Stores document metadata: source, author, timestamp, chunk index, and document hash. Used for filtering and deduplication." },

  // Row 4 (y=390): STORAGE
  { id:"qdrant",       x:200,  y:390, label:"Qdrant",        sub:"Vector DB",           desc:"Stores and indexes vector embeddings. Serves approximate nearest-neighbor search queries with sub-millisecond latency at scale." },
  { id:"minio",        x:500,  y:390, label:"MinIO",         sub:"Raw Documents",       desc:"S3-compatible object storage for raw documents. Enables reindexing if the embedding model or chunking strategy changes." },
  { id:"ollama",       x:730,  y:390, label:"Ollama",        sub:"Local LLM",           desc:"Serves open-weight LLMs locally via a REST API. Primary inference engine for CPU/consumer GPU deployments." },
  { id:"vllm",         x:920,  y:390, label:"vLLM",          sub:"GPU Inference",       desc:"High-throughput LLM serving with PagedAttention and continuous batching. Used when NVIDIA GPUs are available for higher concurrency." },

  // Row 5 (y=500): ORCHESTRATION
  { id:"llamaindex",   x:350,  y:500, label:"LlamaIndex",    sub:"RAG Engine",          desc:"Orchestrates the full RAG pipeline: query rewriting, hybrid retrieval (vector + keyword), reranking, and prompt construction." },
  { id:"fastapi",      x:650,  y:500, label:"FastAPI",       sub:"WebSocket API",       desc:"Async API server. Exposes WebSocket endpoint for streaming chat responses. Handles session management and request routing." },

  // Row 6 (y=610): INTERFACE
  { id:"webui",        x:200,  y:610, label:"Open WebUI",    sub:"Chat Interface",      desc:"Self-hosted chat interface with conversation history, model switching, and document upload UI. Deployed behind Nginx." },
  { id:"keycloak",     x:500,  y:610, label:"Keycloak",      sub:"SSO/LDAP",            desc:"Identity provider. Handles employee SSO via LDAP/AD integration. Issues JWT tokens validated by FastAPI middleware." },
  { id:"nginx",        x:730,  y:610, label:"Nginx",         sub:"TLS Proxy",           desc:"Terminates TLS, routes traffic to Open WebUI and FastAPI, and enforces access controls at the network edge." },

  // Row 7 (y=720): LEARNING LOOP
  { id:"argilla",      x:280,  y:720, label:"Argilla",       sub:"Feedback",            desc:"Captures human feedback on model responses. Analysts review and label outputs, creating a fine-tuning dataset." },
  { id:"unsloth",      x:530,  y:720, label:"Unsloth",       sub:"LoRA Training",       desc:"Efficient LoRA/QLoRA fine-tuning framework. Runs on a single GPU overnight using the labeled feedback dataset from Argilla." },
  { id:"mlflow",       x:780,  y:720, label:"MLflow",        sub:"Model Registry",      desc:"Tracks training runs, stores model artifacts, and manages version promotion. Newly trained adapters are registered before deployment." },
];

const ARIA_EDGES = [
  // Primary flow: data sources -> kafka (solid)
  { from:"slack",       to:"kafka",       dashed:false },
  { from:"confluence",  to:"kafka",       dashed:false },
  { from:"github",      to:"kafka",       dashed:false },
  { from:"crm",         to:"kafka",       dashed:false },
  { from:"pdf",         to:"unstructured",dashed:false },
  // n8n -> kafka
  { from:"n8n",         to:"kafka",       dashed:false },
  // kafka -> unstructured, minio
  { from:"kafka",       to:"unstructured",dashed:false },
  { from:"kafka",       to:"minio",       dashed:false },
  // unstructured -> chunker
  { from:"unstructured",to:"chunker",     dashed:false },
  // chunker -> embedder, pgmeta
  { from:"chunker",     to:"embedder",    dashed:false },
  { from:"chunker",     to:"pgmeta",      dashed:false },
  // embedder -> qdrant
  { from:"embedder",    to:"qdrant",      dashed:false },
  // qdrant, ollama, vllm -> llamaindex
  { from:"qdrant",      to:"llamaindex",  dashed:false },
  { from:"ollama",      to:"llamaindex",  dashed:false },
  { from:"vllm",        to:"llamaindex",  dashed:false },
  // llamaindex -> fastapi
  { from:"llamaindex",  to:"fastapi",     dashed:false },
  // fastapi -> nginx
  { from:"fastapi",     to:"nginx",       dashed:false },
  // nginx -> webui
  { from:"nginx",       to:"webui",       dashed:false },
  // keycloak -> nginx
  { from:"keycloak",    to:"nginx",       dashed:false },
  // Learning loop (dashed, secondary)
  { from:"fastapi",     to:"argilla",     dashed:true  },
  { from:"argilla",     to:"unsloth",     dashed:true  },
  { from:"unsloth",     to:"mlflow",      dashed:true  },
  { from:"mlflow",      to:"ollama",      dashed:true  },
];

const ARIA_ZONES = [
  { id:"sources",    label:"DATA SOURCES",       x:30, y:36,  w:1140, h:80,  color:G.cyan   },
  { id:"ingestion",  label:"INGESTION",           x:30, y:148, w:1140, h:80,  color:G.cyan   },
  { id:"processing", label:"PROCESSING",          x:30, y:258, w:1140, h:80,  color:G.green  },
  { id:"storage",    label:"STORAGE",             x:30, y:368, w:1140, h:80,  color:G.blue   },
  { id:"orch",       label:"ORCHESTRATION",       x:30, y:478, w:1140, h:80,  color:G.green  },
  { id:"interface",  label:"INTERFACE",           x:30, y:588, w:1140, h:80,  color:G.red    },
  { id:"learning",   label:"LEARNING LOOP",       x:30, y:698, w:1140, h:80,  color:G.amber, dashed:true },
];

// ─── LocalMind Data ───────────────────────────────────────────────────────────
// Layout: 7 horizontal bands across full width
// Row spacing: 110px. Nodes spread horizontally with 180px+ between centers.

const LM_NODES = [
  // Row 1 (y=60): CLIENTS
  { id:"cli",         x:200,  y:60,  label:"CLI",            sub:"Typer + httpx",       desc:"Command-line interface installable via pip. Wraps the inference API and provides streaming agentic task execution from the terminal." },
  { id:"sdk",         x:530,  y:60,  label:"SDK",            sub:"Python/TS/Go",        desc:"Auto-generated typed API clients for Python, TypeScript, and Go. Allows tenants to embed agentic AI in their own applications." },
  { id:"vscode",      x:860,  y:60,  label:"VS Code",        sub:"Extension",           desc:"VS Code extension that adds inline agent commands, a chat panel, and code suggestions routed through the LocalMind platform." },

  // Row 2 (y=170): CONTROL PLANE
  { id:"tenants",     x:200,  y:170, label:"Tenant Registry",sub:"PostgreSQL",          desc:"Source of truth for tenant plans, quotas, LoRA adapter assignments, and billing status. Kong reads this to make routing decisions." },
  { id:"stripe",      x:530,  y:170, label:"Stripe",         sub:"Billing",             desc:"Handles subscription management, usage-based billing webhooks, and plan upgrades. Stripe events update the tenant registry." },
  { id:"terraform",   x:860,  y:170, label:"Terraform",      sub:"K8s Provisioning",    desc:"Provisions Kubernetes namespaces, GPU resource quotas, and network policies for new enterprise tenants automatically." },

  // Row 3 (y=280): API GATEWAY
  { id:"kong",        x:200,  y:280, label:"Kong",           sub:"API Gateway",         desc:"API gateway handling tenant authentication, JWT validation, rate limiting, request routing, and usage logging to ClickHouse." },
  { id:"redis",       x:530,  y:280, label:"Redis",          sub:"Rate Limits",         desc:"Stores per-tenant rate limit counters and sliding window buckets. Kong reads these synchronously before proxying requests." },
  { id:"clickhouse",  x:860,  y:280, label:"ClickHouse",     sub:"Usage Analytics",     desc:"Columnar database for high-volume usage event ingestion. Stores per-tenant token counts, latency, and error rates for billing and analytics." },

  // Row 4 (y=390): INFERENCE
  { id:"router",      x:100,  y:390, label:"Inference Router",sub:"Plan-Based Routing", desc:"Routes inference requests to the correct backend based on tenant plan. Starter/Pro -> vLLM shared tier. Enterprise -> dedicated pod." },
  { id:"vllm-shared", x:360,  y:390, label:"vLLM Shared",   sub:"Multi-LoRA",           desc:"Shared vLLM instance serving starter and pro tenants with continuous batching and per-request LoRA adapter swapping." },
  { id:"llama-ent",   x:620,  y:390, label:"Enterprise LLM",sub:"Dedicated Pod",        desc:"Dedicated llama-server process per enterprise tenant. Isolated GPU memory -- no KV cache sharing with other tenants." },
  { id:"k8s",         x:880,  y:390, label:"Kubernetes",     sub:"GPU Operator",        desc:"Schedules inference containers across GPU nodes. NVIDIA GPU Operator manages driver installation and resource quota enforcement." },

  // Row 5 (y=500): AGENTIC
  { id:"harness",     x:200,  y:500, label:"Agent Harness",  sub:"Tool-Use Loop",       desc:"Implements the agentic execution loop: receives a task, calls tools (read_file, run_command, web_search), observes results, and iterates." },
  { id:"mcp",         x:530,  y:500, label:"MCP",            sub:"Tool Protocol",       desc:"Model Context Protocol server exposes the tool catalog to the harness. Enables tool discovery and JSON-RPC execution." },
  { id:"sandbox",     x:860,  y:500, label:"Sandbox",        sub:"gVisor Runtime",      desc:"Each tool execution that runs code does so in a fresh gVisor container. Kernel-level isolation prevents tenant cross-contamination." },

  // Row 6 (y=610): KNOWLEDGE
  { id:"qdrant-ns",   x:200,  y:610, label:"Qdrant",         sub:"Per-Tenant Vectors",  desc:"Per-tenant Qdrant collections with server-generated namespace prefixes. Tenant A's embeddings are physically isolated from Tenant B's." },
  { id:"minio-ns",    x:530,  y:610, label:"MinIO",          sub:"Per-Tenant Files",    desc:"Per-tenant MinIO buckets with IAM policies. Stores raw documents, model artifacts, and agent session workspaces." },
  { id:"pg-schema",   x:860,  y:610, label:"PostgreSQL",     sub:"Per-Schema",          desc:"Per-tenant PostgreSQL schemas for metadata, feedback, and document manifests. Separate roles enforce schema-level access control." },

  // Row 7 (y=720): OBSERVABILITY
  { id:"otel",        x:130,  y:720, label:"OpenTelemetry",  sub:"Distributed Tracing", desc:"Instruments all services with a consistent tracing model. Trace IDs propagate across service boundaries for end-to-end latency attribution." },
  { id:"langfuse",    x:380,  y:720, label:"Langfuse",       sub:"LLM Traces",          desc:"Captures full LLM traces: prompt, retrieved chunks, model parameters, token counts, and latency per tenant." },
  { id:"grafana",     x:630,  y:720, label:"Grafana",        sub:"Metrics",             desc:"Visualizes Prometheus metrics from vLLM, Kong, Qdrant, and ClickHouse. Alerting rules fire on SLA breach or GPU saturation." },
  { id:"presidio",    x:880,  y:720, label:"Presidio",       sub:"PII Redaction",       desc:"Scans ingested documents and LLM outputs for 50+ PII entity types. Anonymizes before indexing or returning to the client." },
];

const LM_EDGES = [
  // Clients -> kong (primary flow, solid)
  { from:"cli",        to:"kong",        dashed:false },
  { from:"sdk",        to:"kong",        dashed:false },
  { from:"vscode",     to:"kong",        dashed:false },
  // control plane (dashed, async)
  { from:"stripe",     to:"tenants",     dashed:true  },
  { from:"tenants",    to:"kong",        dashed:true  },
  { from:"terraform",  to:"k8s",         dashed:false },
  // kong -> redis, router
  { from:"kong",       to:"redis",       dashed:false },
  { from:"kong",       to:"router",      dashed:false },
  // kong -> analytics/security (dashed)
  { from:"kong",       to:"clickhouse",  dashed:true  },
  // router -> inference
  { from:"router",     to:"vllm-shared", dashed:false },
  { from:"router",     to:"llama-ent",   dashed:false },
  // k8s manages llama-ent
  { from:"k8s",        to:"llama-ent",   dashed:false },
  // inference -> harness
  { from:"vllm-shared",to:"harness",     dashed:false },
  { from:"llama-ent",  to:"harness",     dashed:false },
  // harness -> mcp, sandbox
  { from:"harness",    to:"mcp",         dashed:false },
  { from:"harness",    to:"sandbox",     dashed:false },
  // sandbox -> knowledge
  { from:"sandbox",    to:"qdrant-ns",   dashed:false },
  { from:"sandbox",    to:"minio-ns",    dashed:false },
  // observability (dashed)
  { from:"kong",       to:"otel",        dashed:true  },
  { from:"router",     to:"langfuse",    dashed:true  },
  { from:"vllm-shared",to:"otel",        dashed:true  },
];

const LM_ZONES = [
  { id:"clients",    label:"CLIENTS",         x:30, y:36,  w:1140, h:80,  color:G.purple },
  { id:"control",    label:"CONTROL PLANE",   x:30, y:148, w:1140, h:80,  color:G.purple },
  { id:"gateway",    label:"API GATEWAY",     x:30, y:258, w:1140, h:80,  color:G.amber  },
  { id:"inference",  label:"INFERENCE",       x:30, y:368, w:1140, h:80,  color:G.green  },
  { id:"agentic",    label:"AGENTIC",         x:30, y:478, w:1140, h:80,  color:G.purple, dashed:true },
  { id:"knowledge",  label:"KNOWLEDGE",       x:30, y:588, w:1140, h:80,  color:G.blue   },
  { id:"observ",     label:"OBSERVABILITY",   x:30, y:698, w:1140, h:80,  color:G.amber  },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

const NODE_W = 140;
const NODE_H = 46;

function nodeCenter(node) {
  return { cx: node.x + NODE_W / 2, cy: node.y + NODE_H / 2 };
}

function edgePath(fromNode, toNode) {
  const { cx: x1, cy: y1 } = nodeCenter(fromNode);
  const { cx: x2, cy: y2 } = nodeCenter(toNode);
  const dy = y2 - y1;
  const dx = x2 - x1;

  // Mostly vertical (same column or close): straight vertical with small curve
  if (Math.abs(dx) < 20) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  // Skip-level or horizontal: cubic bezier
  const cx1 = x1 + dx * 0.5;
  const cy1 = y1 + dy * 0.2;
  const cx2 = x1 + dx * 0.5;
  const cy2 = y2 - dy * 0.2;
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
  const viewW  = 1200;
  const viewH  = 800;

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
    if (!hoveredNode) return 0.2;
    if (e.from === hoveredNode || e.to === hoveredNode) return 1;
    return 0.05;
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
        {/* Boundary label: bottom-right corner, away from zone labels */}
        <text
          x={viewW - 16} y={viewH - 14}
          textAnchor="end"
          fontFamily="'IBM Plex Mono', monospace"
          fontSize={8}
          letterSpacing={2}
          fill={accent}
          opacity={0.4}
        >
          ZERO EGRESS BOUNDARY
        </text>

        {/* Zones */}
        {zones.map(z => (
          <g key={z.id}>
            <rect
              x={z.x} y={z.y} width={z.w} height={z.h}
              rx={8} fill={z.color} fillOpacity={0.02}
              stroke={z.color} strokeOpacity={0.1}
              strokeWidth={1}
              strokeDasharray={z.dashed ? "5 4" : undefined}
            />
            <text
              x={z.x + 10} y={z.y + 14}
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
                strokeOpacity={isHovered ? 0.9 : 0.25}
                strokeWidth={isHovered ? 1.5 : 1}
                filter={isHovered ? `url(#glow-${variant})` : undefined}
              />
              <text
                x={n.x + NODE_W / 2} y={n.y + 19}
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
