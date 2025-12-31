# Tool Selection Patterns

## How Agents Choose Tools

When an agent receives a request, it must decide:
1. Does this require using a tool?
2. If yes, which tool(s)?
3. What parameters should be passed?
4. Should tools be called sequentially or in parallel?

## The Tool Selection Process

```
User Request: "What's the status of my order #12345?"
                │
                ▼
┌─────────────────────────────────────────┐
│         Agent Reasoning                  │
│                                         │
│  1. Parse intent: check order status    │
│  2. Identify needed info: order ID      │
│  3. Search available tools              │
│  4. Select: get_order_status            │
│  5. Extract parameter: orderId=12345    │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│         Tool Execution                   │
│  get_order_status(orderId="12345")      │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│         Response Synthesis               │
│  "Your order #12345 shipped on Dec 30   │
│   and will arrive by Jan 2."            │
└─────────────────────────────────────────┘
```

## Tool Description Best Practices

The model selects tools based on descriptions. Good descriptions are critical:

### Bad Example
```python
tool = Tool(
    name="get_data",
    description="Gets data from the system"
)
# Too vague - when would the model use this?
```

### Good Example
```python
tool = Tool(
    name="get_order_status",
    description="""
    Retrieves the current fulfillment status of a customer order.
    Returns shipping status, tracking number, estimated delivery date,
    and list of items in the order. Use this when customers ask about
    where their order is, when it will arrive, or what's in their order.
    """
)
```

## Common Selection Patterns

### Single Tool Selection
Most straightforward - one tool answers the question:
```
User: "What's the weather in Seattle?"
Agent selects: get_weather(location="Seattle")
```

### Sequential Tool Selection
Multiple tools, where later tools depend on earlier results:
```
User: "Cancel my most recent order"

Step 1: get_recent_orders(user_id=user_id)
        → Returns order #12345

Step 2: cancel_order(order_id="12345")
        → Returns cancellation confirmation
```

### Parallel Tool Selection
Multiple independent tools at once:
```
User: "Compare the weather in Seattle and Portland"

Parallel execution:
  - get_weather(location="Seattle")
  - get_weather(location="Portland")
  
Both results combined in response
```

### Conditional Tool Selection
Choose tools based on context:
```
User: "Help me with my order"

If user has recent order:
  → get_order_status(order_id=recent_order_id)
  
If no recent order:
  → search_orders(user_id=user_id)
```

## Implementing Tool Selection

### With Strands Agents
```python
from strands import Agent, tool

@tool
def get_order_status(order_id: str) -> dict:
    """Get the current status of a customer order.
    
    Args:
        order_id: The unique order identifier
        
    Returns:
        Order status including shipping info and delivery estimate
    """
    return order_service.get_status(order_id)

@tool
def search_products(query: str, category: str = None) -> list:
    """Search the product catalog.
    
    Args:
        query: Search terms
        category: Optional category filter
        
    Returns:
        List of matching products with prices and availability
    """
    return catalog.search(query, category)

# Agent automatically selects appropriate tools
agent = Agent(tools=[get_order_status, search_products])
response = agent("Where is order 12345?")  # Uses get_order_status
response = agent("Find red shoes")  # Uses search_products
```

### With Gateway
```python
from bedrock_agentcore.gateway import GatewayClient

gateway = GatewayClient()

# Register tools with rich descriptions
gateway.register_tool(
    name="get_order_status",
    description="Get order fulfillment status, tracking, and delivery estimate",
    parameters={"order_id": {"type": "string", "required": True}}
)

# Let agent discover and select tools
tools = gateway.get_tools()
agent = Agent(tools=tools)
```

## Handling Tool Selection Errors

### No Matching Tool
```python
def handle_request(prompt):
    # Search for relevant tools
    tools = gateway.search_tools(prompt, limit=5)
    
    if not tools:
        return "I'm sorry, I don't have the capability to help with that request."
    
    # Proceed with available tools
    agent = Agent(tools=tools)
    return agent(prompt)
```

### Ambiguous Tool Selection
When multiple tools could work:
```python
# Provide more context in tool descriptions
gateway.register_tool(
    name="get_order_status",
    description="...",
    use_when="Customer asks about order status, shipping, or delivery",
    do_not_use_when="Customer wants to modify or cancel an order"
)
```

### Wrong Tool Selected
Train the model with examples:
```python
agent = Agent(
    tools=tools,
    examples=[
        {
            "user": "Where is my order?",
            "tool": "get_order_status",
            "reasoning": "Customer is asking about order location/status"
        },
        {
            "user": "I want to return my order",
            "tool": "initiate_return",
            "reasoning": "Customer wants to return, not check status"
        }
    ]
)
```

## Tool Selection with Many Tools

When agents have hundreds of tools:

### Semantic Search
```python
# Don't load all tools - search for relevant ones
relevant_tools = gateway.search_tools(
    query=user_message,
    limit=10
)

agent = Agent(tools=relevant_tools)
```

### Tool Categories
```python
# Organize tools by domain
order_tools = gateway.get_tools(category="orders")
product_tools = gateway.get_tools(category="products")
support_tools = gateway.get_tools(category="support")

# Select category based on intent
if intent == "order_inquiry":
    agent = Agent(tools=order_tools)
```

### Two-Stage Selection
```python
# Stage 1: Classify intent
intent = classifier.classify(user_message)

# Stage 2: Load relevant tools
if intent == "order":
    tools = gateway.get_tools(category="orders")
elif intent == "product":
    tools = gateway.get_tools(category="products")
else:
    tools = gateway.get_tools(category="general")

agent = Agent(tools=tools)
```

## Monitoring Tool Selection

Track which tools are selected:
```python
from bedrock_agentcore.observability import trace

@trace
def handle_request(prompt):
    agent = Agent(tools=tools)
    response = agent(prompt)
    
    # Log tool selection for analysis
    logger.info({
        "prompt": prompt,
        "tools_selected": response.tools_used,
        "success": response.success
    })
    
    return response
```

Analyze patterns:
- Which tools are used most?
- Which prompts lead to wrong tool selection?
- Are there missing tools?
