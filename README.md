# Agent Atlas

[![GitHub](https://img.shields.io/badge/github-bhumitsingh856--cyber/Agent--Atlas-blue?logo=github)](https://github.com/bhumitsingh856-cyber/Agent-Atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![Node.js 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)

Intelligent research assistant powered by multi-agent orchestration. Break down complex topics, conduct autonomous research, generate structured reports with citations, and chat with your research using RAG.

![Agent Atlas](https://img.shields.io/badge/Status-Active-brightgreen)
![Deployment](https://img.shields.io/badge/Deployed-Railway%20%26%20Vercel-blue)

## ✨ Features

- **Multi-Agent Research Workflow** - Specialized agents for different research tasks
- **Parallel Researcher Execution** - Concurrent research investigations
- **RAG-Powered Chat** - Ask questions about generated reports with semantic search
- **Rich Report Generation** - Citations, embedded images, Mermaid diagrams
- **Research Persistence** - Store and retrieve research history
- **Thread-Based Conversations** - Maintain context across multiple questions
- **Streaming Responses** - Real-time report generation
- **Source Attribution** - Every finding is cited and traceable

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js + TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: React Hooks , zustand
- **Real-time Updates**: Server-Sent Events (SSE)

### Backend Stack
- **API**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL
- **Agent Orchestration**: LangChain + LangGraph
- **Vector Search**: Pinecone
- **Runtime**: Uvicorn

### Multi-Agent System

| Agent | Model | Purpose |
|-------|-------|---------|
| Prompt Enhancement | Llama 3.1 8B Instant | Topic refinement & clarification |
| Research Planning | Llama 3.3 70B Versatile | Strategy & breakdown |
| Research Agents (Parallel) | Llama 4 Scout 17B | Deep research investigation |
| Worker Agents | DeepSeek V4 Flash | Data collection & synthesis |
| Citation Generation | Llama 3.3 70B | Source attribution |
| Summarization | GPT-OSS 120B | Report synthesis |
| RAG Reasoning | GPT-OSS 120B | Chat responses (streaming) |
| Embeddings | NVIDIA NV-Embed-v1 | Semantic search vectors |

### Data Flow
User Query
↓
Prompt Enhancement (Llama 3.1 8B)
↓
Research Planning (Llama 3.3 70B)
↓
Parallel Researchers (Llama 4 Scout 17B)
↓
Worker Agents (DeepSeek V4 Flash)
↓
Citation Generation (Llama 3.3 70B)
↓
Report Synthesis (GPT-OSS 120B)
↓
Vector Embedding (NVIDIA NV-Embed-v1)
↓
Storage (PostgreSQL + Pinecone)
↓
User Report + RAG Chat Ready
## 📊 Performance Metrics

- **Tokens per Research**: ~100k - 145k
- **Average Research Time**: 2-5 minutes
- **Parallel Researchers**: 3-5 concurrent
- **RAG Query Latency**: <3000ms
- ~100k to ~145k embeddings per research

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Git
- 
### Vector Database (Pinecone)

-  Vector search
- Semantic search for RAG


## 🐛 Issues & Support

Found a bug? Have a suggestion?

- [Open an Issue](https://github.com/bhumitsingh856-cyber/Agent-Atlas/issues)
- [Discussions](https://github.com/bhumitsingh856-cyber/Agent-Atlas/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Bhumit Singh**
- GitHub: [@bhumitsingh856-cyber](https://github.com/bhumitsingh856-cyber)
- Project: [Agent Atlas](https://github.com/bhumitsingh856-cyber/Agent-Atlas)

## 🙏 Acknowledgments

- [LangChain](https://langchain.com) - LLM framework
- [LangGraph](https://langgraph.com) - Agent orchestration
- [FastAPI](https://fastapi.tiangolo.com) - Web framework
- [Next.js](https://nextjs.org) - React framework
- [Pinecone](https://pinecone.io) - Vector database
- [shadcn/ui](https://ui.shadcn.com) - UI components

---

**⭐ If this project helped you, please consider giving it a star!**

[Live Demo](https://agent-atlas-one.vercel.app) • [GitHub](https://github.com/bhumitsingh856-cyber/Agent-Atlas) • [Report Issue](https://github.com/bhumitsingh856-cyber/Agent-Atlas/issues)
