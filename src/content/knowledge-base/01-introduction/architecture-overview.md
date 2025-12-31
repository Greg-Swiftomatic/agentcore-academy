# AgentCore Architecture Overview

## Core Services

Amazon Bedrock AgentCore consists of nine modular services that can be used together or independently:

### 1. Runtime
**What it does**: Serverless environment for deploying and running AI agents.

**Key capabilities**:
- Complete session isolation (prevents data leakage between users)
- Support for workloads from low-latency conversations to 8-hour async tasks
- Deploy via code upload or containers
- Fast cold starts optimized for agentic workloads
- Pay only for active resources consumed

**When to use**: Every production agent deployment needs Runtime.

### 2. Gateway
**What it does**: Converts your existing APIs and services into agent-compatible tools.

**Key capabilities**:
- Transform APIs and Lambda functions into MCP (Model Context Protocol) tools
- Connect to existing MCP servers
- Intelligent tool discovery via semantic search
- Manage OAuth authorization for tools
- Handle secure credential exchange

**When to use**: When your agent needs to interact with external services, databases, or APIs.

### 3. Memory
**What it does**: Manages what agents remember across interactions.

**Key capabilities**:
- Short-term memory for multi-turn conversations
- Long-term memory shared across agents and sessions
- Industry-leading accuracy for context retrieval
- Control over what gets remembered
- No infrastructure to manage

**When to use**: When agents need to maintain context, learn from interactions, or provide personalized experiences.

### 4. Identity
**What it does**: Manages agent authentication and authorization.

**Key capabilities**:
- Secure agent access to AWS resources
- Third-party tool/service access on behalf of users
- Integration with existing identity providers (Okta, Entra, Cognito)
- Secure token vault (reduces consent fatigue)
- Permission delegation with just-enough access

**When to use**: When agents need to access protected resources or act on behalf of users.

### 5. Tools (Code Interpreter)
**What it does**: Enables agents to write and execute code securely.

**Key capabilities**:
- Secure sandbox environments
- Multiple language support
- Large-scale data processing
- Generate visualizations
- Complex calculations

**When to use**: When agents need to analyze data, create charts, or perform computations.

### 6. Tools (Browser)
**What it does**: Allows agents to interact with websites.

**Key capabilities**:
- Navigate web applications
- Complete multi-step forms
- Execute web-based workflows
- Reduced CAPTCHA interruptions
- Auto-scale from zero to hundreds of sessions

**When to use**: When agents need to interact with web interfaces that don't have APIs.

### 7. Observability
**What it does**: Monitor and debug agent behavior in production.

**Key capabilities**:
- Trace agent decision flows
- Monitor token usage, latency, error rates
- Integrated dashboards via Amazon CloudWatch
- OpenTelemetry compatible
- Debug issues in production

**When to use**: Always - visibility into agent behavior is essential for production systems.

### 8. Policy (Preview)
**What it does**: Control what actions agents can take.

**Key capabilities**:
- Real-time enforcement of rules
- Natural language policy creation
- Converts to Cedar policy language
- Integrates with Gateway
- Doesn't slow down agents

**When to use**: When you need fine-grained control over agent actions and boundaries.

### 9. Evaluations (Preview)
**What it does**: Assess and improve agent quality.

**Key capabilities**:
- Sample and score live interactions
- Built-in and custom evaluators
- Measure correctness, helpfulness, safety
- Track goal success rates
- Continuous monitoring

**When to use**: When you need to ensure agents meet quality standards at scale.

## How Services Work Together

```
User Request
     │
     ▼
┌─────────────┐
│   Runtime   │◄──── Deploys and runs your agent
│             │
│  ┌───────┐  │
│  │ Agent │  │
│  └───┬───┘  │
│      │      │
└──────┼──────┘
       │
       ├─────────► Memory ──────► Retrieve/store context
       │
       ├─────────► Gateway ─────► Call external tools
       │              │
       │              ▼
       │           Policy ──────► Enforce rules on tool calls
       │
       ├─────────► Identity ────► Authenticate to services
       │
       ├─────────► Code Interpreter ► Execute code
       │
       ├─────────► Browser ─────► Interact with websites
       │
       └─────────► Observability ► Log traces and metrics
                      │
                      ▼
                 Evaluations ───► Score quality
```

## Deployment Models

### Serverless (Recommended)
- No infrastructure to manage
- Auto-scales with demand
- Pay-per-use pricing
- Fast deployments

### Container-Based
- Bring your own container
- More control over environment
- Custom dependencies
- Still managed by AgentCore

## Integration Points

### Input/Output
- REST APIs for synchronous requests
- Async APIs for long-running tasks
- Streaming for real-time responses
- Multi-modal support (text, images, files)

### Monitoring
- CloudWatch integration
- OpenTelemetry export
- Custom metrics
- Alerting

### Security
- VPC connectivity
- AWS PrivateLink support
- IAM integration
- Encryption at rest and in transit
