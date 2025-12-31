# AgentCore Runtime Service

## What is Runtime?

AgentCore Runtime is a secure, serverless runtime purpose-built for deploying and scaling AI agents. It handles the infrastructure complexity so you can focus on building agent capabilities.

## Key Features

### Session Isolation
Every agent session runs in complete isolation:
- Separate execution environment per session
- No data leakage between users
- Independent resource allocation
- Clean state for each interaction

### Extended Runtime Support
Unlike traditional serverless (15-minute limits):
- Support for low-latency conversations (seconds)
- Long-running tasks up to **8 hours**
- Ideal for complex, multi-step workflows
- Async processing for background tasks

### Fast Cold Starts
Optimized for agentic workloads:
- Quick initialization for interactive use
- Pre-warmed instances for high traffic
- Efficient resource allocation

### Deployment Options

**Code Upload**:
```python
from bedrock_agentcore import BedrockAgentCoreApp
from strands import Agent

app = BedrockAgentCoreApp()
agent = Agent()

@app.entrypoint
def invoke(payload):
    user_message = payload.get("prompt", "Hello!")
    result = agent(user_message)
    return {"result": result.message}

if __name__ == "__main__":
    app.run()
```

Deploy with:
```bash
agentcore configure -e my_agent.py
agentcore launch
```

**Container-Based**:
- Bring your own Docker container
- Custom dependencies and environments
- More control over runtime

## How Runtime Works

```
┌─────────────────────────────────────────────────────────┐
│                     AgentCore Runtime                    │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Session 1   │  │  Session 2   │  │  Session N   │  │
│  │  (User A)    │  │  (User B)    │  │  (User X)    │  │
│  │              │  │              │  │              │  │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │  │
│  │ │  Agent   │ │  │ │  Agent   │ │  │ │  Agent   │ │  │
│  │ │  Code    │ │  │ │  Code    │ │  │ │  Code    │ │  │
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │  │
│  │              │  │              │  │              │  │
│  │  Isolated    │  │  Isolated    │  │  Isolated    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│                    ┌─────────────┐                      │
│                    │ Auto-Scale  │                      │
│                    └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

## Request Flow

1. **Request arrives**: User sends a message to your agent
2. **Session created**: Runtime allocates an isolated environment
3. **Agent executes**: Your code runs with full access to AgentCore services
4. **Response returned**: Results sent back to user
5. **Session cleanup**: Resources released (or kept warm for subsequent requests)

## Invocation Types

### Synchronous
For real-time interactions:
```bash
agentcore invoke '{"prompt": "What is the weather?"}'
```
- Immediate response
- Best for interactive use cases
- Timeout limits apply

### Asynchronous
For long-running tasks:
```python
# Start async task
response = client.invoke_async(payload)
task_id = response['taskId']

# Check status later
status = client.get_task_status(task_id)
```
- Returns immediately with task ID
- Poll for completion
- Up to 8 hours runtime

### Streaming
For real-time output:
```python
for chunk in client.invoke_stream(payload):
    print(chunk['text'], end='')
```
- Progressive output
- Better user experience
- Reduces perceived latency

## Local Development

Test locally before deploying:

```bash
# Run your agent locally
python my_agent.py

# Test with curl
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello!"}'
```

The local environment mimics Runtime behavior for easy testing.

## Configuration

### Environment Variables
Set configuration via environment:
```python
import os
os.environ['MODEL_ID'] = 'anthropic.claude-v2'
os.environ['MAX_TOKENS'] = '1000'
```

### Resource Allocation
Runtime automatically manages:
- Memory allocation
- CPU allocation
- Concurrent execution limits
- Timeout handling

## Pricing Model

**Pay-per-use**:
- Charged for active compute time only
- No charges when idle
- Scales to zero automatically

**Factors**:
- Duration of execution
- Memory allocated
- Number of invocations

## Best Practices

### Design for Statelessness
- Don't rely on local file storage between requests
- Use Memory service for persistence
- Store state externally

### Handle Timeouts
- Long tasks should use async invocation
- Implement checkpointing for very long workflows
- Provide progress updates

### Optimize Cold Starts
- Keep dependencies minimal
- Use lazy loading where possible
- Consider container deployment for heavy dependencies

### Error Handling
```python
@app.entrypoint
def invoke(payload):
    try:
        result = agent(payload.get("prompt"))
        return {"result": result.message}
    except Exception as e:
        return {"error": str(e), "status": "failed"}
```

## Integration with Other Services

Runtime is the foundation - other services plug in:

```python
from bedrock_agentcore import BedrockAgentCoreApp
from bedrock_agentcore.memory import MemoryClient
from bedrock_agentcore.gateway import GatewayClient

app = BedrockAgentCoreApp()
memory = MemoryClient()
gateway = GatewayClient()

@app.entrypoint
def invoke(payload):
    # Retrieve context from Memory
    context = memory.get_context(payload.get("session_id"))
    
    # Use tools via Gateway
    tools = gateway.get_tools()
    
    # Run agent with context and tools
    result = agent(payload.get("prompt"), context=context, tools=tools)
    
    # Store updated context
    memory.store_context(payload.get("session_id"), result.context)
    
    return {"result": result.message}
```
