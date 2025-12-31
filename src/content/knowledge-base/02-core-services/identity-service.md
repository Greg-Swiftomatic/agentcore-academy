# AgentCore Identity Service

## What is Identity?

AgentCore Identity provides secure, scalable agent identity and access management. It enables agents to access AWS resources and third-party services—either on behalf of users or with pre-authorized permissions.

## The Identity Challenge

When agents need to access protected resources:
- How does the agent prove who it is?
- How does it access user-specific data?
- How do you limit what agents can do?
- How do you integrate with existing identity systems?

Identity solves all of these challenges.

## Key Features

### Identity Provider Integration
Works with existing systems:
- Amazon Cognito
- Okta
- Microsoft Entra (Azure AD)
- Any OIDC-compliant provider

No user migration required.

### Token Vault
Secure storage of credentials:
- Reduces consent fatigue (users don't re-authorize repeatedly)
- Automatic token refresh
- Encrypted at rest

### Permission Delegation
Agents act with appropriate permissions:
- User delegates specific permissions
- Just-enough access principle
- Time-limited tokens
- Revocable at any time

### AWS Service Access
Agents can access AWS resources:
- S3 buckets
- DynamoDB tables
- Lambda functions
- Any AWS service

## Identity Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User/Application                      │
│                                                          │
│                         │                                │
│                    authenticates                         │
│                         │                                │
│                         ▼                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Identity Provider                         │ │
│  │     (Cognito, Okta, Entra, etc.)                   │ │
│  └────────────────────────────────────────────────────┘ │
│                         │                                │
│                    identity token                        │
│                         │                                │
│                         ▼                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │              AgentCore Identity                     │ │
│  │                                                     │ │
│  │  ┌─────────────┐  ┌─────────────┐                 │ │
│  │  │   Token     │  │ Permission  │                 │ │
│  │  │   Vault     │  │  Resolver   │                 │ │
│  │  └─────────────┘  └─────────────┘                 │ │
│  │                                                     │ │
│  └────────────────────────────────────────────────────┘ │
│                         │                                │
│                  scoped credentials                      │
│                         │                                │
│                         ▼                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │                    Agent                            │ │
│  │  (accesses resources with delegated permissions)   │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Identity Modes

### User-Delegated Identity
Agent acts on behalf of a specific user:
```python
# User authenticates
user_token = authenticate_user()

# Agent receives delegated permissions
agent_credentials = identity.delegate(
    user_token=user_token,
    scopes=["read:orders", "read:profile"]
)

# Agent uses credentials to access user's data
orders = api_client.get_orders(credentials=agent_credentials)
```

### Agent Identity
Agent has its own identity:
```python
# Agent authenticates as itself
agent_credentials = identity.get_agent_credentials(
    agent_id="support-agent-prod",
    scopes=["read:products", "read:policies"]
)

# Agent accesses shared resources
products = catalog.search(credentials=agent_credentials)
```

### Hybrid Identity
Combines agent and user identity:
```python
# Agent has base permissions
agent_creds = identity.get_agent_credentials(agent_id="support-agent")

# Plus user-specific access
user_creds = identity.delegate(user_token=user_token, scopes=["read:orders"])

# Agent can access both
```

## Setting Up Identity

### Configure Identity Provider
```python
from bedrock_agentcore.identity import IdentityClient

identity = IdentityClient()

# Configure Cognito
identity.configure_provider(
    provider="cognito",
    user_pool_id="us-west-2_xxxxxx",
    client_id="xxxxxxxxxxxxx"
)

# Or configure Okta
identity.configure_provider(
    provider="okta",
    domain="your-domain.okta.com",
    client_id="xxxxx",
    client_secret_name="okta-secret"  # In Secrets Manager
)
```

### Define Permission Scopes
```python
identity.define_scopes({
    "read:orders": "Read access to user's orders",
    "write:orders": "Create and modify orders",
    "read:profile": "Read user profile information",
    "read:products": "Read product catalog (shared)",
})
```

### Configure Agent Permissions
```python
identity.configure_agent(
    agent_id="support-agent-prod",
    allowed_scopes=["read:orders", "read:profile", "read:products"],
    # This agent cannot write orders
)
```

## Third-Party Service Access

### OAuth Integration
Connect to external services:
```python
# Configure OAuth for Google Calendar
identity.configure_oauth(
    service="google_calendar",
    client_id="xxxxx.apps.googleusercontent.com",
    client_secret_name="google-oauth-secret",
    scopes=["https://www.googleapis.com/auth/calendar.readonly"]
)

# User grants access once
authorization_url = identity.get_authorization_url("google_calendar")
# User completes OAuth flow

# Agent can now access calendar
calendar_token = identity.get_service_token(
    user_id=user_id,
    service="google_calendar"
)
```

### Token Refresh
Identity handles token lifecycle:
```python
# Tokens automatically refreshed
token = identity.get_service_token(user_id, "google_calendar")
# If expired, automatically refreshes

# Manual refresh if needed
identity.refresh_token(user_id, "google_calendar")
```

### Token Revocation
Users can revoke access:
```python
# User revokes agent access
identity.revoke_access(user_id, "google_calendar")

# Or revoke all agent access
identity.revoke_all(user_id)
```

## AWS Resource Access

### IAM Role Assumption
Agents assume roles to access AWS:
```python
# Configure agent role
identity.configure_aws_access(
    agent_id="data-analyst-agent",
    role_arn="arn:aws:iam::123456789:role/AgentDataAccessRole"
)

# Agent gets credentials
aws_credentials = identity.get_aws_credentials(agent_id="data-analyst-agent")

# Use with boto3
s3 = boto3.client('s3', **aws_credentials)
data = s3.get_object(Bucket='data-bucket', Key='analysis.csv')
```

### Scoped Permissions
Limit what agents can do:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::data-bucket",
        "arn:aws:s3:::data-bucket/*"
      ]
    }
  ]
}
```

## Security Best Practices

### Least Privilege
Grant only necessary permissions:
```python
# Bad: overly broad
scopes=["admin:all"]

# Good: specific permissions
scopes=["read:orders", "read:profile"]
```

### Token Expiration
Use short-lived tokens:
```python
credentials = identity.delegate(
    user_token=user_token,
    scopes=["read:orders"],
    expires_in_seconds=3600  # 1 hour
)
```

### Audit Logging
Track all identity operations:
```python
identity.enable_audit_logging(
    log_group="/agentcore/identity/audit"
)

# All token requests, grants, and revocations logged
```

### Consent Management
Be transparent about permissions:
```python
# Show users what they're granting
consent_details = identity.get_consent_details(scopes)
# Returns human-readable description of each permission

# Let users review and modify
active_grants = identity.get_user_grants(user_id)
```

## Integration Example

Complete identity flow in an agent:

```python
from bedrock_agentcore import BedrockAgentCoreApp
from bedrock_agentcore.identity import IdentityClient
from strands import Agent

app = BedrockAgentCoreApp()
identity = IdentityClient()

@app.entrypoint
def invoke(payload):
    user_token = payload.get("user_token")
    
    # Verify user and get delegated credentials
    try:
        user_info = identity.verify_token(user_token)
        credentials = identity.delegate(
            user_token=user_token,
            scopes=["read:orders", "read:profile"]
        )
    except InvalidTokenError:
        return {"error": "Invalid or expired token"}
    
    # Agent uses credentials
    agent = Agent(
        credentials=credentials,
        user_context=user_info
    )
    
    result = agent(payload.get("prompt"))
    return {"result": result.message}
```
