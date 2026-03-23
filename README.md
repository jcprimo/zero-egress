# Zero Egress

Interactive architecture deep-dive for zero-egress AI systems. Built with React + Vite.

## What This Is

An interactive, educational visualization of enterprise AI architecture patterns focused on data sovereignty and zero-egress design. Two architecture approaches are explored side by side:

1. **Cloud-Native RAG Pipeline** (Kafka, vector DB, embedding engine, LLM orchestrator)
2. **Zero-Egress Architecture** (all processing stays on-premises, no data leaves the network)

Each layer is broken down with implementation steps, code examples, and tooling recommendations.

## Stack

- React 19
- Vite 6
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

## Project Status

Active development. This is a Primo Engineering project.

## Author

Mr. Primo | [primo.engineering](https://primo.engineering)
