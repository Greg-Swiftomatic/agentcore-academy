# Building Your First Agent

## Prerequisites

Before building your first agent, ensure you have:

1. **AWS Account** with credentials configured (`aws configure`)
2. **Python 3.10+** installed
3. **Docker** or **Finch** installed (for local development)
4. **Model Access**: Claude enabled in Amazon Bedrock console
5. **AWS Permissions**:
   - `BedrockAgentCoreFullAccess` managed policy
   - `AmazonBedrockFullAccess` managed policy

## Step 1: Install the Tools

```bash
# Install uv (recommended package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install AgentCore packages
uv pip install bedrock-agentcore strands-agents bedrock-agentcore-starter-toolkit

# Or with pip
pip install bedrock-agentcore strands-agents bedrock-agentcore-starter-toolkit
```

## Step 2: Create Your Agent

Create a file called `my_agent.py`:

```python
from bedrock_agentcore import BedrockAgentCoreApp
from strands import Agent

# Initialize the AgentCore application
app = BedrockAgentCoreApp()

# Create a simple agent
agent = Agent()

@app.entrypoint
def invoke(payload):
    """Entry point for agent invocations."""
    # Get the user's message from the payload
    user_message = payload.get("prompt", "Hello! How can I help you today?")
    
    # Run the agent
    result = agent(user_message)
    
    # Return the response
    return {"result": result.message}

if __name__ == "__main__":
    app.run()
```

Create `requirements.txt`:

```txt
bedrock-agentcore
strands-agents
```

## Step 3: Test Locally

Start your agent locally:

```bash
python my_agent.py
```

In another terminal, test it:

```bash
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello! Tell me a joke."}'
```

You should see a response like:
```json
{"result": "Why did the scarecrow win an award? Because he was outstanding in his field!"}
```

## Step 4: Deploy to AgentCore

Configure and deploy:

```bash
# Configure the deployment
agentcore configure -e my_agent.py

# Deploy to AgentCore
agentcore launch
```

This command:
1. Packages your code
2. Creates necessary AWS resources
3. Deploys to AgentCore Runtime

## Step 5: Test Your Deployed Agent

```bash
# Invoke the deployed agent
agentcore invoke '{"prompt": "Tell me about AI agents"}'
```

## Adding Tools to Your Agent

Make your agent more capable with tools:

```python
from bedrock_agentcore import BedrockAgentCoreApp
from strands import Agent, tool

app = BedrockAgentCoreApp()

@tool
def get_current_time() -> str:
    """Get the current date and time."""
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

@tool
def calculate(expression: str) -> float:
    """Evaluate a mathematical expression.
    
    Args:
        expression: A math expression like "2 + 2" or "sqrt(16)"
    """
    import math
    # Safe evaluation of math expressions
    allowed_names = {k: v for k, v in math.__dict__.items() if not k.startswith("_")}
    return eval(expression, {"__builtins__": {}}, allowed_names)

# Create agent with tools
agent = Agent(tools=[get_current_time, calculate])

@app.entrypoint
def invoke(payload):
    user_message = payload.get("prompt", "Hello!")
    result = agent(user_message)
    return {"result": result.message}

if __name__ == "__main__":
    app.run()
```

Now your agent can:
- Tell you the current time
- Perform calculations

Test it:
```bash
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What time is it, and what is 25 * 4?"}'
```

## Adding Memory

Give your agent memory to remember conversations:

```python
from bedrock_agentcore import BedrockAgentCoreApp
from bedrock_agentcore.memory import MemoryClient
from strands import Agent

app = BedrockAgentCoreApp()
memory = MemoryClient()

agent = Agent()

@app.entrypoint
def invoke(payload):
    user_id = payload.get("user_id", "default")
    user_message = payload.get("prompt", "Hello!")
    
    # Retrieve conversation history
    history = memory.retrieve("conversations", user_id) or []
    
    # Add context to the agent
    context = "\n".join([f"{m['role']}: {m['content']}" for m in history[-5:]])
    
    # Run agent with context
    result = agent(f"Previous conversation:\n{context}\n\nUser: {user_message}")
    
    # Store updated history
    history.append({"role": "user", "content": user_message})
    history.append({"role": "assistant", "content": result.message})
    memory.store("conversations", user_id, history)
    
    return {"result": result.message}

if __name__ == "__main__":
    app.run()
```

## Project Structure

For larger projects:

```
my-agent/
├── agent/
│   ├── __init__.py
│   ├── main.py           # Entry point
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── orders.py     # Order-related tools
│   │   └── products.py   # Product-related tools
│   └── prompts/
│       └── system.md     # System prompt
├── tests/
│   └── test_agent.py
├── requirements.txt
└── README.md
```

## Common Issues

### "Model not found" Error
- Ensure Claude is enabled in your Bedrock console
- Check your AWS region matches

### "Permission denied" Error
- Verify IAM policies are attached
- Check `aws sts get-caller-identity` returns expected user

### Docker/Container Issues
- Ensure Docker daemon is running
- Try `docker ps` to verify

### Slow Cold Starts
- Keep dependencies minimal
- Use lazy imports where possible

## Next Steps

1. **Add more tools** for your use case
2. **Integrate with Gateway** for external APIs
3. **Set up Observability** for monitoring
4. **Configure Identity** for user authentication
