# Monitoring and Observability

## AgentCore Observability Overview

AgentCore Observability helps you trace, debug, and monitor agent performance through unified operational dashboards. It supports OpenTelemetry-compatible telemetry and provides detailed visualizations of agent workflows.

## Key Metrics

### Operational Metrics
- **Token Usage**: Input and output tokens consumed
- **Latency**: Response time for agent invocations
- **Session Duration**: How long sessions last
- **Error Rates**: Failed invocations and error types
- **Concurrent Sessions**: Active agent instances

### Quality Metrics
- **Correctness**: Accuracy of responses
- **Helpfulness**: User satisfaction indicators
- **Safety**: Policy compliance
- **Goal Success Rate**: Task completion rate

## CloudWatch Integration

AgentCore automatically sends metrics to CloudWatch:

```python
# Metrics available in CloudWatch
# Namespace: AWS/BedrockAgentCore

# Key metrics:
# - Invocations (count)
# - Duration (milliseconds)
# - TokensConsumed (count)
# - Errors (count by type)
```

### Creating Dashboards

```python
import boto3

cloudwatch = boto3.client('cloudwatch')

# Create dashboard
dashboard_body = {
    "widgets": [
        {
            "type": "metric",
            "properties": {
                "metrics": [
                    ["AWS/BedrockAgentCore", "Invocations", "AgentId", "my-agent"]
                ],
                "title": "Agent Invocations"
            }
        }
    ]
}

cloudwatch.put_dashboard(
    DashboardName='AgentCore-Overview',
    DashboardBody=json.dumps(dashboard_body)
)
```

## Tracing

### OpenTelemetry Support

AgentCore supports OpenTelemetry for distributed tracing:

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

# Configure tracer
provider = TracerProvider()
provider.add_span_processor(
    BatchSpanProcessor(OTLPSpanExporter())
)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer(__name__)

@app.entrypoint
def invoke(payload):
    with tracer.start_as_current_span("agent-invoke") as span:
        span.set_attribute("user_id", payload.get("user_id"))
        result = agent(payload.get("prompt"))
        span.set_attribute("tokens_used", result.token_count)
        return {"result": result.message}
```

### Trace Visualization

Traces show the complete flow:
```
[Agent Invoke] ─┬─ [Parse Input]
                ├─ [Tool Selection]
                ├─ [Tool: get_order_status]
                ├─ [Model Inference]
                └─ [Response Generation]
```

## Alerting

### Set Up Alarms

```python
cloudwatch.put_metric_alarm(
    AlarmName='HighErrorRate',
    MetricName='Errors',
    Namespace='AWS/BedrockAgentCore',
    Statistic='Sum',
    Period=300,
    EvaluationPeriods=1,
    Threshold=10,
    ComparisonOperator='GreaterThanThreshold',
    AlarmActions=['arn:aws:sns:us-west-2:123456789:alerts']
)
```

### Common Alerts
- Error rate > threshold
- Latency > acceptable limit
- Token usage spike
- Session failures

## Logging

### Structured Logging

```python
import logging
import json

logger = logging.getLogger(__name__)

@app.entrypoint
def invoke(payload):
    logger.info(json.dumps({
        "event": "agent_invoked",
        "user_id": payload.get("user_id"),
        "prompt_length": len(payload.get("prompt", ""))
    }))
    
    result = agent(payload.get("prompt"))
    
    logger.info(json.dumps({
        "event": "agent_completed",
        "tokens_used": result.token_count,
        "tool_calls": len(result.tool_calls)
    }))
    
    return {"result": result.message}
```

## Best Practices

1. **Monitor proactively**: Set up dashboards before issues occur
2. **Alert on anomalies**: Not just errors, but unusual patterns
3. **Trace sampling**: Use sampling for high-volume agents
4. **Log context**: Include user_id, session_id for debugging
5. **Retention policies**: Balance cost vs. debugging needs
