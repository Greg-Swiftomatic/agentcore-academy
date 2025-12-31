# Production Deployment Checklist

## Overview

This checklist covers everything you need to verify before deploying an AgentCore application to production. Use it as a pre-launch review to ensure reliability, security, and operational readiness.

---

## 1. Security

### Authentication & Authorization

- [ ] **API Authentication** - All endpoints require authentication (API keys, JWT, or IAM)
- [ ] **User Authorization** - Role-based access control implemented
- [ ] **Session Management** - Sessions expire appropriately, tokens rotated
- [ ] **Secrets Management** - All secrets in AWS Secrets Manager or Parameter Store (never in code)

```python
# Verify: No hardcoded secrets
# BAD:
api_key = "sk-abc123..."

# GOOD:
api_key = get_secret("agent-service/api-key")
```

### IAM Configuration

- [ ] **Least Privilege** - Task roles have minimum required permissions
- [ ] **No Wildcard Resources** - Avoid `Resource: "*"` where possible
- [ ] **Service-Linked Roles** - Using service roles, not user credentials

```json
// Example: Scoped Bedrock permissions
{
  "Effect": "Allow",
  "Action": ["bedrock:InvokeModel"],
  "Resource": [
    "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet*"
  ]
}
```

### Network Security

- [ ] **Private Subnets** - Services run in private subnets
- [ ] **Security Groups** - Minimal ingress rules, egress restricted
- [ ] **VPC Endpoints** - Using VPC endpoints for AWS services (DynamoDB, Bedrock)
- [ ] **WAF Enabled** - Web Application Firewall on ALB (if public)
- [ ] **TLS Everywhere** - All connections use TLS 1.2+

### Data Protection

- [ ] **Encryption at Rest** - DynamoDB, S3, EBS all encrypted
- [ ] **Encryption in Transit** - TLS for all network communication
- [ ] **PII Handling** - Personal data identified and protected
- [ ] **Data Retention** - Policies defined and implemented

---

## 2. Reliability

### High Availability

- [ ] **Multi-AZ Deployment** - Services distributed across availability zones
- [ ] **No Single Points of Failure** - Minimum 2 instances of each component
- [ ] **Auto-Scaling Configured** - Scales based on load metrics
- [ ] **Load Balancer Health Checks** - Proper health check endpoints

```yaml
# Verify auto-scaling configuration
min_capacity: 2      # Never less than 2 for HA
max_capacity: 50     # Room to scale
target_cpu: 70%      # Scale before hitting limits
```

### Fault Tolerance

- [ ] **Circuit Breakers** - External service calls have circuit breakers
- [ ] **Retry Logic** - Transient failures retried with exponential backoff
- [ ] **Timeouts Set** - All external calls have timeouts
- [ ] **Graceful Degradation** - Service degrades gracefully under load

```python
# Verify: All external calls have timeouts
response = await bedrock.invoke_model(
    messages=messages,
    timeout=30  # Must have timeout
)
```

### Disaster Recovery

- [ ] **Backup Strategy** - DynamoDB point-in-time recovery enabled
- [ ] **Cross-Region Replication** - Critical data replicated (if required)
- [ ] **Recovery Procedures** - Documented and tested
- [ ] **RTO/RPO Defined** - Recovery objectives documented

---

## 3. Performance

### Latency

- [ ] **Response Time Targets** - P50, P95, P99 targets defined
- [ ] **Streaming Enabled** - Long responses streamed to users
- [ ] **Caching Implemented** - Appropriate caching for repeated queries
- [ ] **Connection Pooling** - Database connections pooled

```python
# Performance targets example
LATENCY_TARGETS = {
    "p50": 2000,   # 2 seconds
    "p95": 5000,   # 5 seconds
    "p99": 10000   # 10 seconds
}
```

### Throughput

- [ ] **Load Tested** - System tested at 2x expected peak load
- [ ] **Bottlenecks Identified** - Known limits documented
- [ ] **Rate Limiting** - Per-user and global rate limits configured

### Resource Optimization

- [ ] **Right-Sized Instances** - Not over or under-provisioned
- [ ] **Memory Limits** - Container memory limits set appropriately
- [ ] **Connection Limits** - Database connection limits configured

---

## 4. Observability

### Logging

- [ ] **Structured Logging** - JSON format with consistent fields
- [ ] **Log Levels** - Appropriate levels (INFO in prod, DEBUG available)
- [ ] **Request Tracing** - Request IDs propagated through all logs
- [ ] **No Sensitive Data** - Prompts/responses not logged (or redacted)
- [ ] **Log Retention** - Retention policies configured

```python
# Verify: Structured logging with request ID
logger.info("Request processed", extra={
    "request_id": request_id,
    "user_id": user_id,
    "latency_ms": latency,
    "status": "success"
})
```

### Metrics

- [ ] **Business Metrics** - Task completion rate, user satisfaction
- [ ] **Technical Metrics** - Latency, throughput, error rate
- [ ] **Resource Metrics** - CPU, memory, connections
- [ ] **Cost Metrics** - Token usage, API costs
- [ ] **Dashboards Created** - Key metrics visualized

```python
# Key metrics to track
REQUIRED_METRICS = [
    "requests_total",
    "request_latency_seconds",
    "errors_total",
    "tokens_used_total",
    "active_sessions",
    "bedrock_api_latency_seconds"
]
```

### Alerting

- [ ] **Critical Alerts** - Page on-call for critical issues
- [ ] **Warning Alerts** - Notify team of potential issues
- [ ] **Alert Runbooks** - Each alert has documented response
- [ ] **Alert Testing** - Alerts tested and verified working

```yaml
# Example alert configuration
alerts:
  - name: HighErrorRate
    condition: error_rate > 5%
    duration: 5m
    severity: critical
    runbook: https://wiki/runbooks/high-error-rate
    
  - name: HighLatency
    condition: latency_p95 > 10s
    duration: 5m
    severity: warning
    runbook: https://wiki/runbooks/high-latency
```

### Tracing

- [ ] **Distributed Tracing** - X-Ray or similar enabled
- [ ] **Trace Sampling** - Appropriate sampling rate (not 100% in prod)
- [ ] **Cross-Service Traces** - Traces span service boundaries

---

## 5. Operational Readiness

### Deployment

- [ ] **CI/CD Pipeline** - Automated build, test, deploy
- [ ] **Blue-Green or Canary** - Safe deployment strategy
- [ ] **Rollback Procedure** - One-click rollback tested
- [ ] **Database Migrations** - Safe migration strategy

```bash
# Verify: Rollback is fast and tested
# Rollback should complete in < 5 minutes
./rollback.sh --version previous
```

### Documentation

- [ ] **Architecture Diagram** - Current state documented
- [ ] **API Documentation** - All endpoints documented
- [ ] **Runbooks** - Operational procedures documented
- [ ] **On-Call Rotation** - Team scheduled, escalation paths defined

### Incident Response

- [ ] **Incident Process** - Clear process for handling incidents
- [ ] **Communication Plan** - How to communicate during outages
- [ ] **Post-Mortem Process** - Learning from incidents

---

## 6. Cost Management

### Budget & Limits

- [ ] **Budget Alerts** - AWS Budget alerts configured
- [ ] **Cost Allocation Tags** - Resources tagged for cost tracking
- [ ] **Spending Limits** - Hard limits on Bedrock API usage

```python
# Verify: Cost controls in place
cost_config = {
    "daily_token_limit": 1_000_000,
    "monthly_budget_usd": 5000,
    "alert_threshold": 0.8  # Alert at 80%
}
```

### Optimization

- [ ] **Model Selection** - Using appropriate model tiers
- [ ] **Caching** - Reducing redundant API calls
- [ ] **Reserved Capacity** - Provisioned throughput where beneficial

---

## 7. Compliance & Privacy

### Data Handling

- [ ] **Data Classification** - Data types identified and classified
- [ ] **Retention Policies** - Data retained only as long as needed
- [ ] **Deletion Procedures** - User data can be deleted on request
- [ ] **Audit Logging** - Access to sensitive data logged

### Agent Behavior

- [ ] **Content Filtering** - Harmful content blocked
- [ ] **Scope Boundaries** - Agent stays within defined domain
- [ ] **Disclosure** - Users know they're interacting with AI
- [ ] **Human Escalation** - Path to human support when needed

---

## 8. Testing Verification

### Test Coverage

- [ ] **Unit Tests** - Core logic tested
- [ ] **Integration Tests** - Service integrations tested
- [ ] **Behavioral Tests** - Agent behaviors verified
- [ ] **Load Tests** - Performance under load verified
- [ ] **Security Tests** - Vulnerability scans passed

### Pre-Production Validation

- [ ] **Staging Environment** - Mirrors production
- [ ] **Smoke Tests** - Basic functionality verified
- [ ] **Regression Tests** - No existing functionality broken

---

## 9. Final Checks

### Before Go-Live

- [ ] **DNS Configuration** - Domain pointing to correct resources
- [ ] **SSL Certificates** - Valid and auto-renewing
- [ ] **Environment Variables** - All required vars set
- [ ] **Feature Flags** - Flags configured for gradual rollout
- [ ] **Monitoring Active** - Dashboards and alerts active
- [ ] **On-Call Ready** - Team briefed and available

### Go-Live Day

- [ ] **Team Available** - Core team online during launch
- [ ] **Rollback Ready** - Previous version deployable
- [ ] **Communication Prepared** - Status page, user comms ready
- [ ] **Metrics Baseline** - Know what "normal" looks like

---

## Quick Reference: Critical Items

If you're short on time, these are the absolute minimum before production:

1. **Security**: No hardcoded secrets, IAM least privilege
2. **Reliability**: Multi-AZ, health checks, auto-scaling
3. **Observability**: Logging, basic metrics, critical alerts
4. **Deployment**: Automated pipeline, rollback tested
5. **Cost**: Budget alerts, spending limits

---

## Sign-Off

| Area | Reviewer | Date | Status |
|------|----------|------|--------|
| Security | | | |
| Reliability | | | |
| Performance | | | |
| Observability | | | |
| Operations | | | |
| Cost | | | |
| Compliance | | | |

**Final Approval**: _________________ Date: _____________
