# Key AgentCore Concepts

## Foundational Terms

### Agent
An AI system that can:
- Receive tasks or questions from users
- Reason about how to accomplish goals
- Take actions using tools
- Maintain context across interactions
- Handle multi-step workflows

Unlike a simple chatbot, an agent can autonomously decide what to do and execute those decisions.

### Runtime
The execution environment where your agent code runs. AgentCore Runtime is:
- **Serverless**: No servers to manage
- **Isolated**: Each session is completely separate
- **Scalable**: Handles one user or thousands
- **Secure**: Built-in security controls

### Session
A single interaction context with an agent. Sessions can be:
- **Short**: A quick question/answer exchange
- **Long**: Multi-turn conversations lasting hours
- **Isolated**: Data from one session cannot leak to another

### Tool
A capability that an agent can use to take actions:
- Call an API
- Query a database
- Send an email
- Execute code
- Browse a website

Agents decide which tools to use based on the task.

### MCP (Model Context Protocol)
An open protocol for connecting AI models to external data and tools. AgentCore Gateway can:
- Convert existing APIs to MCP tools
- Connect to MCP servers
- Manage tool discovery

## Memory Concepts

### Short-Term Memory
Context within a single session:
- Current conversation history
- Recently accessed information
- Temporary state

Automatically managed by the agent framework.

### Long-Term Memory
Persistent knowledge across sessions:
- User preferences
- Past interactions
- Learned information
- Shared knowledge between agents

Stored and retrieved via AgentCore Memory service.

### Context Window
The amount of information a model can process at once. AgentCore helps manage this by:
- Storing and retrieving relevant context
- Summarizing long histories
- Prioritizing important information

## Security Concepts

### Session Isolation
Each agent session runs in complete isolation:
- Cannot access other sessions' data
- Cannot affect other sessions' state
- Prevents data leakage between users

### Identity Federation
AgentCore integrates with existing identity providers:
- Users authenticate via their normal systems (Okta, Entra, Cognito)
- Agents inherit user permissions
- No separate authentication system needed

### Permission Delegation
Agents can act on behalf of users:
- User grants consent once
- Agent receives limited, scoped tokens
- Just-enough access principle

### Policy Enforcement
Rules that control agent behavior:
- What tools can be called
- Under what conditions
- With what parameters
- Real-time enforcement

## Operational Concepts

### Cold Start
Time to start a new agent instance. AgentCore optimizes for:
- Fast cold starts for interactive use cases
- Warm instances for high-traffic applications

### Observability
Visibility into agent behavior:
- **Traces**: Follow the path of a request through the system
- **Metrics**: Quantitative measurements (latency, tokens, errors)
- **Logs**: Detailed event records

### Evaluation
Measuring agent quality:
- **Correctness**: Are answers accurate?
- **Helpfulness**: Does it solve the user's problem?
- **Safety**: Does it follow guidelines?
- **Goal Success**: Does it complete the task?

## Development Concepts

### Entrypoint
The function that receives incoming requests:
```python
@app.entrypoint
def invoke(payload):
    user_message = payload.get("prompt")
    result = agent(user_message)
    return {"result": result}
```

### Local Development
Test agents locally before deploying:
```bash
python my_agent.py  # Run locally
curl http://localhost:8080/invocations  # Test
```

### Deployment
Push to AgentCore Runtime:
```bash
agentcore configure -e my_agent.py
agentcore launch
```

## Pricing Concepts

### Pay-Per-Use
Only pay for:
- Runtime: Active compute time
- Memory: Storage and queries
- Gateway: Tool invocations
- Tools: Code interpreter/browser sessions

### No Idle Costs
When agents aren't running:
- No charges for waiting
- Scale to zero automatically

## Framework Concepts

### Strands Agents
AWS's open-source agent framework:
- Model-first approach
- Minimal code required
- Native AgentCore integration

### LangGraph / LangChain
Popular community frameworks:
- Graph-based agent workflows
- Large ecosystem of tools
- Works with AgentCore

### CrewAI
Multi-agent orchestration:
- Teams of specialized agents
- Role-based collaboration
- Works with AgentCore

## Key Relationships

```
┌─────────────────────────────────────────────────────────┐
│                      Your Code                          │
│  ┌─────────────┐     ┌─────────────┐                   │
│  │   Agent     │────►│    Tools    │                   │
│  │  (Strands,  │     │  (defined   │                   │
│  │  LangGraph) │     │   by you)   │                   │
│  └──────┬──────┘     └─────────────┘                   │
│         │                                               │
└─────────┼───────────────────────────────────────────────┘
          │
          ▼ deployed to
┌─────────────────────────────────────────────────────────┐
│               AgentCore Runtime                         │
│                                                         │
│   ┌──────────────────────────────────────────────────┐ │
│   │ Session (isolated)                               │ │
│   │  - Your agent code                               │ │
│   │  - Context for this user                         │ │
│   │  - Connections to AgentCore services             │ │
│   └──────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
