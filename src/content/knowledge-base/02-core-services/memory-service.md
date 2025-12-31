# AgentCore Memory Service

## What is Memory?

AgentCore Memory is a fully managed service that gives agents the ability to remember information across interactions. It eliminates the need to build and manage complex memory infrastructure while providing control over what agents remember.

## Why Agents Need Memory

Without memory, every conversation starts from scratch:
- User: "My name is Alice"
- Agent: "Nice to meet you, Alice!"
- [New session]
- User: "What's my name?"
- Agent: "I don't know your name."

With memory:
- Context persists across sessions
- Agents learn and improve over time
- Personalized experiences become possible

## Types of Memory

### Short-Term Memory
Context within a single conversation:
- Current conversation history
- Recently mentioned entities
- Temporary working state

**Managed by**: Agent framework (Strands, LangGraph, etc.)

### Long-Term Memory
Persistent knowledge across sessions:
- User preferences and facts
- Past interactions summary
- Learned behaviors
- Shared knowledge between agents

**Managed by**: AgentCore Memory service

## Key Features

### Industry-Leading Accuracy
Memory retrieval is optimized for:
- Relevance to current query
- Recency of information
- Importance of facts

### No Infrastructure Management
- Fully managed storage
- Automatic scaling
- Built-in redundancy

### Fine-Grained Control
You decide:
- What gets stored
- How long it's retained
- Who can access it
- When to forget

## Memory Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AgentCore Memory                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Memory Store                           │ │
│  │                                                     │ │
│  │  ┌─────────────┐  ┌─────────────┐                  │ │
│  │  │  User A's   │  │  User B's   │  ...             │ │
│  │  │  Memories   │  │  Memories   │                  │ │
│  │  └─────────────┘  └─────────────┘                  │ │
│  │                                                     │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │         Shared Knowledge Base               │  │ │
│  │  │  (Available to all agents)                  │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Store     │  │  Retrieve   │  │    Semantic     │ │
│  │   API       │  │   API       │  │    Search       │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Using Memory

### Store Information
```python
from bedrock_agentcore.memory import MemoryClient

memory = MemoryClient()

# Store a fact about a user
memory.store(
    namespace="user_facts",
    key="user_123",
    content={
        "name": "Alice",
        "preferences": ["dark mode", "concise responses"],
        "timezone": "America/New_York"
    }
)
```

### Retrieve Information
```python
# Get specific memories
user_facts = memory.retrieve(
    namespace="user_facts",
    key="user_123"
)

# Semantic search for relevant memories
relevant = memory.search(
    query="What does Alice prefer?",
    namespace="user_facts",
    limit=5
)
```

### Update Memory
```python
# Add to existing memories
memory.append(
    namespace="conversation_summary",
    key="user_123",
    content="User asked about weather on Dec 31"
)

# Replace memory
memory.update(
    namespace="user_facts",
    key="user_123",
    content=updated_facts
)
```

### Delete Memory
```python
# Remove specific memory
memory.delete(
    namespace="user_facts",
    key="user_123"
)

# Clear all memories for a user
memory.clear(namespace="*", key_prefix="user_123")
```

## Memory Patterns

### User Profile Pattern
Store user information for personalization:
```python
def save_user_profile(user_id, profile):
    memory.store(
        namespace="profiles",
        key=user_id,
        content=profile
    )

def get_user_profile(user_id):
    return memory.retrieve(
        namespace="profiles",
        key=user_id
    )
```

### Conversation Summary Pattern
Keep summarized context from past conversations:
```python
def update_conversation_summary(user_id, new_summary):
    existing = memory.retrieve("summaries", user_id) or ""
    combined = f"{existing}\n{new_summary}"
    
    # Keep only recent summaries to manage size
    memory.store("summaries", user_id, combined[-10000:])
```

### Shared Knowledge Pattern
Make knowledge available to all agents:
```python
# Store company-wide knowledge
memory.store(
    namespace="company_knowledge",
    key="return_policy",
    content="Returns accepted within 30 days with receipt..."
)

# Any agent can access
policy = memory.retrieve("company_knowledge", "return_policy")
```

### Learning Pattern
Improve agent behavior over time:
```python
# Track successful interactions
def log_success(query, response, feedback):
    if feedback == "positive":
        memory.store(
            namespace="successful_responses",
            key=hash(query),
            content={"query": query, "response": response}
        )

# Use successful patterns
def find_similar_success(query):
    return memory.search(
        query=query,
        namespace="successful_responses",
        limit=3
    )
```

## Memory Scope

### User-Scoped Memory
Private to a single user:
- Personal preferences
- Conversation history
- User-specific facts

### Session-Scoped Memory
Tied to a single session:
- Current conversation context
- Temporary working state
- Cleared when session ends

### Agent-Scoped Memory
Shared across all instances of an agent:
- Learned patterns
- Configuration
- Knowledge base

### Global Memory
Available across all agents:
- Company policies
- Product information
- Shared knowledge base

## Best Practices

### Structure Your Namespaces
```python
# Good: Clear hierarchy
"users/{user_id}/preferences"
"users/{user_id}/history"
"knowledge/products"
"knowledge/policies"

# Avoid: Flat, unclear
"data1"
"stuff"
```

### Manage Memory Size
- Summarize long conversations
- Set retention policies
- Delete obsolete data

### Handle Missing Memory
```python
def get_user_name(user_id):
    profile = memory.retrieve("profiles", user_id)
    if profile and "name" in profile:
        return profile["name"]
    return "there"  # Graceful default
```

### Privacy Considerations
- Don't store sensitive data unnecessarily
- Implement data retention policies
- Allow users to request deletion
- Encrypt sensitive information

## Integration with Agent Frameworks

### Strands Agents
```python
from strands import Agent
from bedrock_agentcore.memory import MemoryClient

memory = MemoryClient()

# Memory automatically integrated
agent = Agent(memory=memory)
```

### LangChain
```python
from langchain.memory import AgentCoreMemory

memory = AgentCoreMemory(
    namespace="chat_history",
    user_id=user_id
)

chain = ConversationChain(
    llm=llm,
    memory=memory
)
```

## Pricing

Memory pricing is based on:
- **Storage**: Amount of data stored
- **Operations**: Number of read/write operations
- **Search queries**: Semantic search calls

Scale to zero when not in use.
