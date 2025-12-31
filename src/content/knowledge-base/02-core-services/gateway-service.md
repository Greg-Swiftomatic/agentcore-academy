# AgentCore Gateway Service

## What is Gateway?

AgentCore Gateway converts your existing APIs, Lambda functions, and services into tools that AI agents can use. It acts as a managed MCP (Model Context Protocol) server, handling the complexity of connecting agents to external systems.

## Why Gateway Matters

Agents need tools to be useful:
- Query databases
- Call APIs
- Send notifications
- Access external services

Without Gateway, you'd need to:
- Write custom integration code for each service
- Handle authentication and credentials
- Manage OAuth flows
- Build tool discovery mechanisms

Gateway handles all of this automatically.

## Key Features

### API to Tool Conversion
Transform any API into an agent-compatible tool:
```yaml
# Your existing API
POST /api/orders/{orderId}/status

# Becomes an agent tool
tool: get_order_status
description: "Get the current status of an order"
parameters:
  orderId: string (required)
```

### Lambda Function Integration
Connect Lambda functions as tools:
```python
# Lambda function
def handler(event, context):
    return {"temperature": 72, "unit": "F"}

# Automatically available as tool
tool: get_temperature
```

### MCP Server Connection
Connect to existing MCP servers:
- Standard protocol compatibility
- Tool aggregation from multiple sources
- Unified access for agents

### Semantic Tool Discovery
When agents have hundreds of tools:
- Search tools by description
- Find relevant tools for the task
- Automatic tool selection

### OAuth Management
Gateway handles authentication:
- OAuth flow management
- Token storage and refresh
- Credential exchange
- User consent management

## Gateway Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AgentCore Gateway                     │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │                 Tool Registry                       │ │
│  │                                                     │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │ │
│  │  │   API    │  │  Lambda  │  │    MCP Server    │ │ │
│  │  │  Tools   │  │  Tools   │  │      Tools       │ │ │
│  │  └──────────┘  └──────────┘  └──────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  Semantic   │  │    Auth     │  │     Policy      │ │
│  │   Search    │  │   Manager   │  │   Enforcement   │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
│                                                          │
│                         │                                │
│                         ▼                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │              External Services                      │ │
│  │  (APIs, Databases, SaaS, Lambda functions)         │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Registering Tools

### From OpenAPI Specification
```python
from bedrock_agentcore.gateway import GatewayClient

gateway = GatewayClient()

# Register tools from OpenAPI spec
gateway.register_openapi(
    name="order_service",
    spec_url="https://api.example.com/openapi.json",
    base_url="https://api.example.com"
)
```

### From Lambda Function
```python
gateway.register_lambda(
    name="get_weather",
    function_arn="arn:aws:lambda:us-west-2:123456789:function:GetWeather",
    description="Get current weather for a location",
    parameters={
        "location": {"type": "string", "description": "City name or zip code"}
    }
)
```

### Manual Tool Definition
```python
gateway.register_tool(
    name="search_products",
    description="Search for products in the catalog",
    parameters={
        "query": {"type": "string", "required": True},
        "category": {"type": "string", "required": False},
        "max_results": {"type": "integer", "default": 10}
    },
    endpoint="https://api.example.com/products/search",
    method="GET"
)
```

## Using Tools in Agents

### Get Available Tools
```python
# Get all tools
tools = gateway.get_tools()

# Search for relevant tools
relevant_tools = gateway.search_tools(
    query="send email notification",
    limit=5
)
```

### Call Tools
```python
# Direct tool invocation
result = gateway.invoke_tool(
    tool_name="get_order_status",
    parameters={"orderId": "12345"}
)

# Agent-driven invocation (automatic)
agent = Agent(tools=gateway.get_tools())
response = agent("Check the status of order 12345")
# Agent automatically selects and calls the right tool
```

## Authentication Patterns

### API Key Authentication
```python
gateway.register_tool(
    name="weather_api",
    endpoint="https://api.weather.com/current",
    auth={
        "type": "api_key",
        "header": "X-API-Key",
        "secret_name": "weather_api_key"  # Stored in Secrets Manager
    }
)
```

### OAuth 2.0
```python
gateway.register_tool(
    name="google_calendar",
    auth={
        "type": "oauth2",
        "provider": "google",
        "scopes": ["calendar.readonly"],
        "callback_url": "https://yourapp.com/oauth/callback"
    }
)
```

### AWS IAM
```python
gateway.register_lambda(
    name="internal_service",
    function_arn="arn:aws:lambda:...",
    auth={
        "type": "iam",
        "role_arn": "arn:aws:iam::123456789:role/AgentRole"
    }
)
```

## Tool Discovery

When agents have many tools, they need to find the right one:

### By Category
```python
# Organize tools into categories
gateway.set_tool_category("get_order_status", "orders")
gateway.set_tool_category("create_order", "orders")
gateway.set_tool_category("send_email", "communications")

# Get tools by category
order_tools = gateway.get_tools(category="orders")
```

### By Semantic Search
```python
# Agent describes what it needs
relevant_tools = gateway.search_tools(
    query="I need to check if a customer's order has shipped",
    limit=3
)
# Returns: get_order_status, get_shipment_tracking, ...
```

### Tool Descriptions
Good descriptions help tool discovery:
```python
# Bad: vague description
gateway.register_tool(
    name="get_data",
    description="Gets some data"  # Too vague!
)

# Good: specific description
gateway.register_tool(
    name="get_order_status",
    description="Retrieves the current fulfillment status of a customer order including shipping tracking information, estimated delivery date, and order line item details"
)
```

## Policy Integration

Gateway integrates with AgentCore Policy for access control:

```python
# Define policy in natural language
policy = """
Agents can only access order information for the current user.
Agents cannot modify payment information.
Agents must log all data access.
"""

gateway.set_policy(policy)

# Policy enforced automatically on tool calls
```

## Best Practices

### Tool Naming
```python
# Good: descriptive, verb-noun format
"get_order_status"
"search_products"
"send_notification"

# Bad: unclear
"order"
"do_thing"
"api_call"
```

### Error Handling
```python
result = gateway.invoke_tool("get_order_status", {"orderId": "12345"})

if result.success:
    return result.data
else:
    # Handle error gracefully
    return f"Unable to check order status: {result.error}"
```

### Rate Limiting
Gateway handles rate limiting automatically, but you can configure:
```python
gateway.set_rate_limit(
    tool_name="expensive_api",
    requests_per_minute=10
)
```

### Caching
Enable caching for frequently accessed, slow-changing data:
```python
gateway.enable_caching(
    tool_name="get_product_catalog",
    ttl_seconds=3600  # Cache for 1 hour
)
```

## MCP Protocol

Gateway is MCP-compatible, meaning:
- Standard tool description format
- Interoperable with other MCP clients/servers
- Future-proof architecture

### MCP Tool Format
```json
{
  "name": "get_order_status",
  "description": "Get the status of a customer order",
  "inputSchema": {
    "type": "object",
    "properties": {
      "orderId": {
        "type": "string",
        "description": "The unique order identifier"
      }
    },
    "required": ["orderId"]
  }
}
```
