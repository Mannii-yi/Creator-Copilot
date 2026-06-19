# Creator-Copilot
The negotiation, compliance, and trust layer for India's creator economy. 
Creator Copilot AI is a unified operational hub designed to empower creators and brands. It replaces fragmented workflows (WhatsApp, Email, Excel) with automated, asynchronous tools to appraise deals, analyze contract risks, manage workflows, and audit regional compliance effortlessly
Tech Stack & System Architecture: The application implements a decoupled asynchronous design pattern to handle heavy LLM inference and document parsing without frontend latency timeouts. 
Frontend: A standalone, completely responsive Single Page Application (SPA) engineered with React 18, Vite, and TailwindCSS, utilizing custom layouts derived from Shadcn/ui configurations.  
Backend Gateway: A containerized Python FastAPI instance providing token-based JWT authentication, route shielding, and structural data serialization via Pydantic v2. 
Task Orchestration: Celery queues coupled with a Redis broker manage multi-page document parsing workloads and high-context data transformations.  Database: Relational Supabase PostgreSQL persistence tier designed to scale dynamically into production environments.
AI Engine Cluster: Dual-model configuration utilizing Google Gemini APIs:  gemini-1.5-flash: Dedicated for deterministic, quick text operations and routing scenarios.  gemini-1.5-pro: Dedicated for multi-page contract extraction leveraging strict structural JSON schemas.
