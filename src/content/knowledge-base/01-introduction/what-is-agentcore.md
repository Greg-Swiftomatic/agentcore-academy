# What is Amazon Bedrock AgentCore?

## Overview

Amazon Bedrock AgentCore is an agentic platform for building, deploying, and operating effective AI agents securely at scale—with no infrastructure management needed. It accelerates agents from prototype to production with intelligent memory, secure tool access, enterprise-grade security, and dynamic scaling.

## The Problem AgentCore Solves

Traditional AI applications follow simple request-response patterns: you ask a question, you get an answer. But real-world tasks often require:

- **Multiple steps**: Breaking down complex tasks into sequential actions
- **Tool usage**: Interacting with databases, APIs, and external services
- **Complex reasoning**: Making decisions based on context and constraints
- **State management**: Maintaining context across interactions

Building this infrastructure yourself is challenging:
- Session isolation and security
- Scaling from zero to thousands of concurrent users
- Managing authentication across multiple services
- Monitoring and debugging agent behavior
- Handling long-running tasks (up to 8 hours)

AgentCore handles all of this infrastructure so you can focus on building your agent's capabilities.

## Key Characteristics

### Framework Agnostic
AgentCore works with any agent framework:
- Strands Agents
- LangGraph / LangChain
- CrewAI
- LlamaIndex
- Custom frameworks

### Model Agnostic
Use any Large Language Model:
- Amazon Bedrock models (Claude, Titan, etc.)
- OpenAI models
- Self-hosted models
- Any model provider

### Composable Services
AgentCore services can be used together or independently:
- Use just Runtime for deployment
- Add Memory when you need persistence
- Add Gateway when you need tool integration
- Mix and match based on your needs

## Where AgentCore Fits

```
┌─────────────────────────────────────────────────────────┐
│                  Your Application                        │
│           (Web app, API, Chat interface)                │
├─────────────────────────────────────────────────────────┤
│              Amazon Bedrock AgentCore                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │
│  │ Runtime │ │ Gateway │ │ Memory  │ │   Identity  │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────────┘   │
│  ┌─────────┐ ┌─────────┐ ┌─────────────────────────┐   │
│  │  Tools  │ │  Policy │ │    Observability        │   │
│  └─────────┘ └─────────┘ └─────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│         Your Agent Framework (Strands, LangGraph...)    │
├─────────────────────────────────────────────────────────┤
│         Foundation Models (Claude, GPT, etc.)           │
├─────────────────────────────────────────────────────────┤
│                    AWS Cloud                             │
│          (Lambda, DynamoDB, S3, IAM, etc.)              │
└─────────────────────────────────────────────────────────┘
```

AgentCore sits between your application and the underlying models/cloud services, providing the specialized infrastructure that AI agents need.

## Real-World Use Cases

### Customer Support Agents
- Handle complex support tickets across multiple systems
- Look up order information, process returns
- Escalate to humans when needed
- Maintain conversation context across sessions

### Research Assistants
- Search documents and databases
- Summarize findings from multiple sources
- Generate structured reports
- Remember user preferences and past queries

### DevOps Automation
- Monitor systems and detect anomalies
- Diagnose issues using logs and metrics
- Execute remediation steps automatically
- Document actions taken

### Data Analysis
- Query databases with natural language
- Perform calculations and transformations
- Generate visualizations
- Answer follow-up questions with context

### Enterprise Workflows
- Process multi-step approval workflows
- Integrate with existing enterprise systems
- Maintain audit trails
- Handle long-running asynchronous tasks

## Customer Examples

- **Ericsson**: Uses AgentCore for AI agents in R&D, achieving double-digit productivity gains across tens of thousands of engineers
- **Thomson Reuters**: Explores AgentCore to compress content workflow timelines from months to weeks
- **Cox Automotive**: Deploys virtual assistants and marketplace agents to improve dealer and customer experience
- **Amazon Devices**: Leverages AgentCore for manufacturing process automation, reducing model training from days to under an hour
