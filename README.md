# Zero Egress

Interactive architecture deep-dive for zero-egress AI systems. Built with React + Vite.

## What This Is

An interactive, educational visualization of enterprise AI architecture patterns focused on data sovereignty and zero-egress design. Two architectures are presented side by side, each broken down layer by layer with implementation steps, code examples, and tooling recommendations.

## What's Inside

**ARIA** (Anthropic RAG Intelligence Architecture) -- the cloud-native reference stack. Uses Kafka for event streaming, a vector database for retrieval, an embedding engine, and an LLM orchestrator. Designed for teams that want a production-grade AI pipeline with managed cloud services.

**LocalMind** -- the zero-egress on-premises architecture. All inference, embedding, and retrieval runs inside your network. No data leaves. Built around llama.cpp, local vector stores, and self-hosted tooling. Designed for enterprise buyers who require full data sovereignty.

## Business Model Context

LocalMind targets enterprises that cannot send data to third-party APIs due to compliance, legal, or competitive constraints. The commercial model is on-premises install, onboarding and training, and ongoing support -- not SaaS. ARIA serves as the reference architecture for teams that do not have those constraints.

## Stack

- React 19
- Vite 8
- No external UI libraries (custom CSS-in-JS via style injection)
- Fonts: DM Sans, Syne, IBM Plex Mono (Google Fonts)

## Getting Started

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Author

Mr. Primo | [primo.engineering](https://primo.engineering)
