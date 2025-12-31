# Deployment Patterns for AgentCore

## Overview

Deploying AI agents to production requires careful consideration of reliability, scalability, security, and cost. This guide covers proven infrastructure patterns for AgentCore deployments on AWS.

## Deployment Architecture Options

### 1. Serverless (Lambda-based)

Best for: Variable traffic, cost optimization, simple agents

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  API        │────▶│   Lambda    │────▶│  Bedrock    │
│  Gateway    │     │   Function  │     │  API        │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              ┌──────────┐  ┌──────────┐
              │ DynamoDB │  │   S3     │
              │ (State)  │  │ (Assets) │
              └──────────┘  └──────────┘
```

**Implementation:**

```python
# lambda_handler.py
import json
from bedrock_agentcore import Agent

# Initialize outside handler for reuse
agent = Agent(
    model="claude-3-sonnet",
    tools=[...],
    memory_backend="dynamodb"
)

def handler(event, context):
    body = json.loads(event['body'])
    
    response = agent.run_sync(
        message=body['message'],
        session_id=body.get('session_id')
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps({'response': response})
    }
```

**Pros:**
- Zero infrastructure management
- Pay per request
- Auto-scaling built in

**Cons:**
- Cold start latency (mitigate with provisioned concurrency)
- 15 minute timeout limit
- Limited compute resources

### 2. Container-based (ECS/Fargate)

Best for: Consistent traffic, complex agents, long-running tasks

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│    ALB      │────▶│   ECS       │────▶│  Bedrock API        │
│             │     │   Service   │     └─────────────────────┘
└─────────────┘     │  ┌───────┐  │
                    │  │Task 1 │  │     ┌─────────────────────┐
                    │  ├───────┤  │────▶│  ElastiCache        │
                    │  │Task 2 │  │     │  (Session Cache)    │
                    │  ├───────┤  │     └─────────────────────┘
                    │  │Task N │  │
                    │  └───────┘  │     ┌─────────────────────┐
                    └─────────────┘────▶│  DynamoDB           │
                                        │  (Persistent State) │
                                        └─────────────────────┘
```

**Dockerfile:**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

EXPOSE 8080

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

**ECS Task Definition:**

```json
{
  "family": "agent-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "agent",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/agent:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "AWS_REGION", "value": "us-east-1"},
        {"name": "DYNAMODB_TABLE", "value": "agent-state"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/agent-service",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "agent"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

### 3. Kubernetes (EKS)

Best for: Multi-agent systems, complex orchestration, existing K8s infrastructure

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent-service
  template:
    metadata:
      labels:
        app: agent-service
    spec:
      serviceAccountName: agent-service-sa  # For IAM roles
      containers:
      - name: agent
        image: 123456789.dkr.ecr.us-east-1.amazonaws.com/agent:latest
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        env:
        - name: AWS_REGION
          value: "us-east-1"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: agent-service
spec:
  selector:
    app: agent-service
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: agent-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: agent-service
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Infrastructure as Code

### CDK Example

```python
# infrastructure/agent_stack.py
from aws_cdk import (
    Stack,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    aws_dynamodb as dynamodb,
    aws_elasticache as elasticache,
    aws_iam as iam,
    Duration,
)
from constructs import Construct

class AgentStack(Stack):
    def __init__(self, scope: Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)
        
        # DynamoDB table for state
        state_table = dynamodb.Table(
            self, "AgentState",
            partition_key=dynamodb.Attribute(
                name="PK",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="SK",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            point_in_time_recovery=True
        )
        
        # ECS Cluster
        cluster = ecs.Cluster(self, "AgentCluster")
        
        # Fargate Service with ALB
        service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "AgentService",
            cluster=cluster,
            cpu=1024,
            memory_limit_mib=2048,
            desired_count=2,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_asset("./app"),
                container_port=8080,
                environment={
                    "DYNAMODB_TABLE": state_table.table_name,
                    "AWS_REGION": self.region
                }
            ),
            public_load_balancer=True
        )
        
        # Grant permissions
        state_table.grant_read_write_data(service.task_definition.task_role)
        
        # Bedrock permissions
        service.task_definition.task_role.add_to_policy(
            iam.PolicyStatement(
                actions=["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
                resources=["*"]
            )
        )
        
        # Auto-scaling
        scaling = service.service.auto_scale_task_count(
            min_capacity=2,
            max_capacity=20
        )
        
        scaling.scale_on_cpu_utilization(
            "CpuScaling",
            target_utilization_percent=70,
            scale_in_cooldown=Duration.seconds(60),
            scale_out_cooldown=Duration.seconds(60)
        )
```

### Terraform Example

```hcl
# infrastructure/main.tf

# DynamoDB Table
resource "aws_dynamodb_table" "agent_state" {
  name         = "agent-state"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "agent_cluster" {
  name = "agent-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECS Service
resource "aws_ecs_service" "agent_service" {
  name            = "agent-service"
  cluster         = aws_ecs_cluster.agent_cluster.id
  task_definition = aws_ecs_task_definition.agent_task.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.agent_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.agent_tg.arn
    container_name   = "agent"
    container_port   = 8080
  }
}

# IAM Role for ECS Task
resource "aws_iam_role" "agent_task_role" {
  name = "agent-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "agent_bedrock_policy" {
  name = "bedrock-access"
  role = aws_iam_role.agent_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = "*"
      }
    ]
  })
}
```

## Blue-Green Deployment

Safe deployment with instant rollback capability:

```
                    ┌─────────────────┐
                    │   Route 53      │
                    │   (DNS)         │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │      ALB        │
                    │  (Listener)     │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
      ┌───────▼───────┐           ┌─────────▼─────────┐
      │  Target Group │           │  Target Group     │
      │  BLUE (live)  │           │  GREEN (new)      │
      │  Weight: 100% │           │  Weight: 0%       │
      └───────┬───────┘           └─────────┬─────────┘
              │                             │
      ┌───────▼───────┐           ┌─────────▼─────────┐
      │  ECS Service  │           │  ECS Service      │
      │  v1.2.3       │           │  v1.2.4           │
      └───────────────┘           └───────────────────┘
```

**Deployment Process:**

```python
# deploy.py
import boto3

def blue_green_deploy(cluster, service, new_task_def):
    ecs = boto3.client('ecs')
    elbv2 = boto3.client('elbv2')
    
    # 1. Deploy to green target group
    ecs.update_service(
        cluster=cluster,
        service=f"{service}-green",
        taskDefinition=new_task_def,
        desiredCount=2
    )
    
    # 2. Wait for green to be healthy
    waiter = ecs.get_waiter('services_stable')
    waiter.wait(cluster=cluster, services=[f"{service}-green"])
    
    # 3. Run smoke tests against green
    if not run_smoke_tests(get_green_url()):
        raise Exception("Smoke tests failed")
    
    # 4. Shift traffic to green
    elbv2.modify_listener(
        ListenerArn=listener_arn,
        DefaultActions=[{
            'Type': 'forward',
            'ForwardConfig': {
                'TargetGroups': [
                    {'TargetGroupArn': green_tg_arn, 'Weight': 100},
                    {'TargetGroupArn': blue_tg_arn, 'Weight': 0}
                ]
            }
        }]
    )
    
    # 5. Scale down blue (keep for rollback)
    ecs.update_service(
        cluster=cluster,
        service=f"{service}-blue",
        desiredCount=0
    )
    
    print("Deployment complete. Blue kept at 0 for quick rollback.")

def rollback():
    """Instant rollback by shifting traffic back to blue."""
    elbv2.modify_listener(
        ListenerArn=listener_arn,
        DefaultActions=[{
            'Type': 'forward',
            'ForwardConfig': {
                'TargetGroups': [
                    {'TargetGroupArn': blue_tg_arn, 'Weight': 100},
                    {'TargetGroupArn': green_tg_arn, 'Weight': 0}
                ]
            }
        }]
    )
```

## Canary Deployment

Gradual traffic shift with automatic rollback:

```python
# canary_deploy.py
import time

def canary_deploy(cluster, service, new_task_def):
    """Deploy with gradual traffic shift and automatic rollback."""
    
    traffic_stages = [
        {"weight": 5, "duration_minutes": 5},
        {"weight": 25, "duration_minutes": 10},
        {"weight": 50, "duration_minutes": 15},
        {"weight": 100, "duration_minutes": 0}
    ]
    
    for stage in traffic_stages:
        # Shift traffic
        shift_traffic(new_version_weight=stage["weight"])
        
        if stage["duration_minutes"] > 0:
            # Monitor for issues
            start = time.time()
            while time.time() - start < stage["duration_minutes"] * 60:
                metrics = get_metrics()
                
                if metrics["error_rate"] > 0.05:  # 5% error threshold
                    print(f"Error rate too high at {stage['weight']}%, rolling back")
                    shift_traffic(new_version_weight=0)
                    raise Exception("Canary failed - rolled back")
                
                if metrics["latency_p95"] > 5000:  # 5s latency threshold
                    print(f"Latency too high at {stage['weight']}%, rolling back")
                    shift_traffic(new_version_weight=0)
                    raise Exception("Canary failed - rolled back")
                
                time.sleep(30)  # Check every 30 seconds
    
    print("Canary deployment successful - 100% traffic on new version")
```

## Multi-Region Deployment

For high availability and low latency:

```
                    ┌─────────────────┐
                    │   Route 53      │
                    │ (Latency-based) │
                    └────────┬────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │                                       │
         ▼                                       ▼
┌─────────────────────┐             ┌─────────────────────┐
│    US-EAST-1        │             │    EU-WEST-1        │
│  ┌───────────────┐  │             │  ┌───────────────┐  │
│  │  ALB          │  │             │  │  ALB          │  │
│  └───────┬───────┘  │             │  └───────┬───────┘  │
│          │          │             │          │          │
│  ┌───────▼───────┐  │             │  ┌───────▼───────┐  │
│  │  ECS Service  │  │             │  │  ECS Service  │  │
│  └───────┬───────┘  │             │  └───────┬───────┘  │
│          │          │             │          │          │
│  ┌───────▼───────┐  │             │  ┌───────▼───────┐  │
│  │  DynamoDB     │  │◄───────────▶│  │  DynamoDB     │  │
│  │  Global Table │  │  Replication│  │  Global Table │  │
│  └───────────────┘  │             │  └───────────────┘  │
└─────────────────────┘             └─────────────────────┘
```

**Configuration:**

```python
# Enable DynamoDB Global Tables for state replication
dynamodb = boto3.client('dynamodb')

dynamodb.update_table(
    TableName='agent-state',
    ReplicaUpdates=[
        {
            'Create': {
                'RegionName': 'eu-west-1'
            }
        }
    ]
)
```

## Environment Configuration

### Development

```yaml
# config/dev.yaml
environment: development
agent:
  model: claude-3-haiku  # Cheaper for dev
  max_tokens: 1000
  timeout: 30
infrastructure:
  instances: 1
  instance_type: t3.small
logging:
  level: DEBUG
  include_prompts: true  # For debugging
```

### Production

```yaml
# config/prod.yaml
environment: production
agent:
  model: claude-3-sonnet
  max_tokens: 4000
  timeout: 120
infrastructure:
  instances: 3
  instance_type: m5.large
  auto_scaling:
    min: 3
    max: 50
logging:
  level: INFO
  include_prompts: false  # Privacy
security:
  rate_limiting: true
  waf_enabled: true
```

## Health Checks

```python
# health.py
from fastapi import FastAPI, Response
from datetime import datetime

app = FastAPI()

@app.get("/health")
async def health_check():
    """Basic health check - is the service running?"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/ready")
async def readiness_check():
    """Readiness check - can the service handle requests?"""
    checks = {
        "dynamodb": await check_dynamodb(),
        "bedrock": await check_bedrock(),
        "memory": check_memory_usage()
    }
    
    all_healthy = all(c["healthy"] for c in checks.values())
    status_code = 200 if all_healthy else 503
    
    return Response(
        content=json.dumps({"checks": checks, "ready": all_healthy}),
        status_code=status_code,
        media_type="application/json"
    )

async def check_dynamodb():
    try:
        await dynamodb.describe_table(TableName=TABLE_NAME)
        return {"healthy": True}
    except Exception as e:
        return {"healthy": False, "error": str(e)}

async def check_bedrock():
    try:
        # Lightweight check - just verify API is reachable
        await bedrock.list_foundation_models()
        return {"healthy": True}
    except Exception as e:
        return {"healthy": False, "error": str(e)}

def check_memory_usage():
    import psutil
    memory = psutil.virtual_memory()
    healthy = memory.percent < 90
    return {"healthy": healthy, "usage_percent": memory.percent}
```

## Secrets Management

```python
# Using AWS Secrets Manager
import boto3
import json

def get_secrets():
    client = boto3.client('secretsmanager')
    
    response = client.get_secret_value(SecretId='agent-service/prod')
    secrets = json.loads(response['SecretString'])
    
    return {
        'api_key': secrets['API_KEY'],
        'database_url': secrets['DATABASE_URL']
    }

# In ECS task definition, reference secrets:
# {
#   "secrets": [
#     {
#       "name": "API_KEY",
#       "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:agent-service/prod:API_KEY::"
#     }
#   ]
# }
```

## Best Practices Summary

1. **Start simple** - Lambda/Serverless for prototypes, graduate to containers as needed
2. **Design for failure** - Health checks, circuit breakers, graceful degradation
3. **Automate everything** - IaC for infrastructure, CI/CD for deployments
4. **Monitor comprehensively** - Metrics, logs, traces, alerts
5. **Deploy safely** - Blue-green or canary deployments, never big-bang
6. **Secure by default** - Least privilege IAM, secrets management, encryption
7. **Plan for scale** - Stateless design, external state, auto-scaling
8. **Test in production-like environments** - Staging should mirror production
