# IAM and Permissions for AgentCore

## Overview

Security in AgentCore involves multiple layers:
1. **Developer permissions** - What you can do with AgentCore
2. **Agent permissions** - What your agent can do
3. **User permissions** - What users can do through agents

## Developer/Caller Permissions

To deploy and manage agents, you need these IAM policies:

### Required Managed Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:*"
      ],
      "Resource": "*"
    }
  ]
}
```

Plus `AmazonBedrockFullAccess` for model access.

### Minimal Permissions
For production, use least privilege:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AgentCoreRuntime",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:CreateAgentRuntime",
        "bedrock-agentcore:UpdateAgentRuntime",
        "bedrock-agentcore:DeleteAgentRuntime",
        "bedrock-agentcore:InvokeAgent",
        "bedrock-agentcore:GetAgentRuntime"
      ],
      "Resource": "arn:aws:bedrock-agentcore:*:*:agent-runtime/*"
    },
    {
      "Sid": "BedrockModels",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/*"
    }
  ]
}
```

## Agent Runtime Permissions

Your agent needs an execution role to access AWS services:

### Create Agent Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "bedrock-agentcore.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### Grant Bedrock Access
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-*"
      ]
    }
  ]
}
```

### Grant S3 Access (if needed)
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
        "arn:aws:s3:::your-bucket",
        "arn:aws:s3:::your-bucket/*"
      ]
    }
  ]
}
```

### Grant DynamoDB Access (if needed)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/YourTable"
    }
  ]
}
```

## Memory Service Permissions

To use AgentCore Memory:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:CreateMemory",
        "bedrock-agentcore:GetMemory",
        "bedrock-agentcore:UpdateMemory",
        "bedrock-agentcore:DeleteMemory",
        "bedrock-agentcore:SearchMemory"
      ],
      "Resource": "arn:aws:bedrock-agentcore:*:*:memory/*"
    }
  ]
}
```

## Gateway Permissions

To use AgentCore Gateway:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:CreateGatewayTool",
        "bedrock-agentcore:InvokeGatewayTool",
        "bedrock-agentcore:ListGatewayTools"
      ],
      "Resource": "arn:aws:bedrock-agentcore:*:*:gateway/*"
    }
  ]
}
```

## VPC Configuration

For private network access:

### VPC Endpoint
```python
# Create VPC endpoint for AgentCore
vpc_endpoint = ec2.create_vpc_endpoint(
    VpcId='vpc-xxxxx',
    ServiceName='com.amazonaws.us-west-2.bedrock-agentcore',
    VpcEndpointType='Interface',
    SubnetIds=['subnet-xxxxx'],
    SecurityGroupIds=['sg-xxxxx']
)
```

### Security Group Rules
```python
# Allow inbound from your application
security_group.authorize_ingress(
    IpProtocol='tcp',
    FromPort=443,
    ToPort=443,
    SourceSecurityGroupId='sg-your-app'
)
```

## Secrets Management

Store sensitive data in AWS Secrets Manager:

```python
import boto3

# Store API key
secrets = boto3.client('secretsmanager')
secrets.create_secret(
    Name='my-agent/api-key',
    SecretString='your-api-key'
)

# Retrieve in agent
def get_api_key():
    response = secrets.get_secret_value(SecretId='my-agent/api-key')
    return response['SecretString']
```

### Agent Role Needs Access
```json
{
  "Effect": "Allow",
  "Action": "secretsmanager:GetSecretValue",
  "Resource": "arn:aws:secretsmanager:*:*:secret:my-agent/*"
}
```

## Data Privacy

### Encryption at Rest
- All AgentCore data encrypted by default
- Uses AWS KMS keys

### Encryption in Transit
- TLS 1.2+ for all communications
- Certificate validation enforced

### Data Isolation
- Session isolation prevents cross-user access
- No data sharing between accounts

## Audit Logging

Enable CloudTrail for AgentCore:

```python
cloudtrail.create_trail(
    Name='agentcore-audit',
    S3BucketName='audit-logs-bucket',
    IsMultiRegionTrail=True,
    EnableLogFileValidation=True
)

# Filter for AgentCore events
cloudtrail.put_event_selectors(
    TrailName='agentcore-audit',
    EventSelectors=[{
        'ReadWriteType': 'All',
        'DataResources': [{
            'Type': 'AWS::BedrockAgentCore::AgentRuntime',
            'Values': ['arn:aws:bedrock-agentcore:*']
        }]
    }]
)
```

## Best Practices

### 1. Least Privilege
Grant only necessary permissions:
```json
// Bad: Too broad
"Action": "*",
"Resource": "*"

// Good: Specific
"Action": ["bedrock-agentcore:InvokeAgent"],
"Resource": "arn:aws:bedrock-agentcore:*:*:agent-runtime/my-agent"
```

### 2. Use Conditions
Restrict by IP, time, or other factors:
```json
{
  "Condition": {
    "IpAddress": {
      "aws:SourceIp": "10.0.0.0/8"
    }
  }
}
```

### 3. Rotate Credentials
- Use IAM roles instead of long-term credentials
- Rotate secrets regularly
- Use short-lived tokens

### 4. Monitor Access
- Enable CloudTrail
- Set up alerts for unusual activity
- Regular access reviews
