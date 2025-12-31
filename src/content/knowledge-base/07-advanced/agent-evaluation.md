# Evaluating Agent Performance

## Overview

Evaluating AI agents is fundamentally different from evaluating traditional software. Agents exhibit non-deterministic behavior, handle open-ended tasks, and may achieve goals through multiple valid paths. This guide covers metrics, techniques, and frameworks for measuring agent quality.

## Why Agent Evaluation Matters

- **Quality assurance** - Ensure agents meet performance standards before deployment
- **Regression detection** - Catch degradation when updating models or prompts
- **Comparison** - Objectively compare different agent configurations
- **Cost optimization** - Balance quality against token usage and latency

## Evaluation Dimensions

### 1. Task Completion

Did the agent accomplish the requested task?

```python
class TaskCompletionEvaluator:
    def evaluate(self, task: str, result: AgentResult) -> float:
        """
        Returns score 0-1 for task completion.
        Uses LLM-as-judge pattern.
        """
        evaluation_prompt = f"""
        Task requested: {task}
        Agent result: {result.output}
        
        Rate task completion from 0-10:
        - 10: Fully completed, exceeded expectations
        - 7-9: Completed with minor issues
        - 4-6: Partially completed
        - 1-3: Attempted but failed
        - 0: Did not attempt or completely wrong
        
        Score:
        """
        score = await judge_model.evaluate(evaluation_prompt)
        return score / 10
```

### 2. Correctness

Is the agent's output factually correct?

**For code agents:**
```python
def evaluate_code_correctness(generated_code: str, test_cases: list) -> float:
    """Run generated code against test cases."""
    passed = 0
    for test in test_cases:
        try:
            result = execute_code(generated_code, test.input)
            if result == test.expected_output:
                passed += 1
        except Exception:
            pass
    return passed / len(test_cases)
```

**For factual responses:**
```python
def evaluate_factual_accuracy(response: str, ground_truth: str) -> float:
    """Compare response against known correct answer."""
    evaluation_prompt = f"""
    Ground truth: {ground_truth}
    Agent response: {response}
    
    Evaluate factual accuracy:
    - Are all claims in the response supported by ground truth?
    - Are there any factual errors or hallucinations?
    
    Accuracy score (0-1):
    """
    return await judge_model.evaluate(evaluation_prompt)
```

### 3. Efficiency

How efficiently did the agent complete the task?

```python
class EfficiencyMetrics:
    total_tokens: int          # Input + output tokens
    llm_calls: int             # Number of model invocations
    tool_calls: int            # Number of tool uses
    wall_time_seconds: float   # Total elapsed time
    cost_usd: float            # Estimated cost
    
    def efficiency_score(self, baseline: "EfficiencyMetrics") -> float:
        """Compare against baseline efficiency."""
        token_ratio = baseline.total_tokens / self.total_tokens
        time_ratio = baseline.wall_time_seconds / self.wall_time_seconds
        return (token_ratio + time_ratio) / 2
```

### 4. Safety & Compliance

Does the agent follow safety guidelines?

```python
SAFETY_CRITERIA = [
    "Does not generate harmful content",
    "Does not leak sensitive information", 
    "Stays within defined scope",
    "Follows ethical guidelines",
    "Respects rate limits and quotas"
]

def evaluate_safety(agent_trace: AgentTrace) -> dict:
    """Evaluate agent behavior against safety criteria."""
    results = {}
    for criterion in SAFETY_CRITERIA:
        results[criterion] = check_criterion(agent_trace, criterion)
    return results
```

### 5. User Experience

How satisfying is the interaction?

```python
UX_DIMENSIONS = {
    "clarity": "Is the response clear and easy to understand?",
    "helpfulness": "Does it actually help the user?",
    "tone": "Is the tone appropriate?",
    "conciseness": "Is it appropriately concise?",
    "formatting": "Is the formatting helpful?"
}

def evaluate_ux(conversation: list[Message]) -> dict[str, float]:
    """Evaluate user experience dimensions."""
    scores = {}
    for dimension, question in UX_DIMENSIONS.items():
        scores[dimension] = await judge_model.evaluate(
            f"Conversation: {conversation}\n\nQuestion: {question}\n\nScore (0-1):"
        )
    return scores
```

## Evaluation Techniques

### LLM-as-Judge

Use a language model to evaluate agent outputs:

```python
from bedrock_agentcore.eval import LLMJudge

judge = LLMJudge(
    model="claude-3-sonnet",
    rubric="""
    Evaluate the agent response on:
    1. Accuracy (0-10): Is information correct?
    2. Completeness (0-10): Does it fully address the query?
    3. Clarity (0-10): Is it easy to understand?
    
    Provide scores and brief justification.
    """,
    output_format="structured"
)

evaluation = await judge.evaluate(
    task="Explain how memory service works",
    response=agent_response
)
# Returns: {"accuracy": 8, "completeness": 9, "clarity": 7, "justification": "..."}
```

**Reducing judge bias:**
- Use multiple judges and average
- Randomize order when comparing responses
- Blind the judge to which model produced output

### Human Evaluation

Gold standard for subjective quality:

```python
class HumanEvaluation:
    def create_evaluation_task(self, agent_response: str) -> EvalTask:
        return EvalTask(
            prompt="Rate this agent response",
            response=agent_response,
            criteria=[
                {"name": "helpful", "scale": "1-5"},
                {"name": "accurate", "scale": "1-5"},
                {"name": "would_use_again", "scale": "yes/no"}
            ],
            metadata={"anonymized": True}
        )
```

### Automated Test Suites

Create reproducible test cases:

```python
# test_agent_capabilities.py

TEST_CASES = [
    {
        "id": "basic_query",
        "input": "What is the Memory Service?",
        "expected_contains": ["persistent storage", "conversation context"],
        "max_tokens": 500
    },
    {
        "id": "code_generation",
        "input": "Write a function to list all agents",
        "validation": "syntax_check",
        "expected_imports": ["bedrock_agentcore"]
    },
    {
        "id": "error_handling",
        "input": "Call a non-existent tool",
        "expected_behavior": "graceful_error",
        "should_not_contain": ["traceback", "exception"]
    }
]

async def run_test_suite(agent: Agent) -> TestReport:
    results = []
    for test in TEST_CASES:
        response = await agent.run(test["input"])
        result = evaluate_response(response, test)
        results.append(result)
    return TestReport(results)
```

### A/B Testing

Compare agent variants in production:

```python
from bedrock_agentcore.eval import ABTest

ab_test = ABTest(
    name="prompt_v2_test",
    variants={
        "control": agent_with_original_prompt,
        "treatment": agent_with_new_prompt
    },
    traffic_split={"control": 0.5, "treatment": 0.5},
    metrics=["task_completion", "user_satisfaction", "latency"],
    min_sample_size=1000
)

# Route requests through A/B test
response = await ab_test.run(user_request)

# Analyze results
results = ab_test.analyze()
# {"winner": "treatment", "confidence": 0.95, "lift": 0.12}
```

## Building an Evaluation Dataset

### Dataset Structure

```python
class EvalExample:
    id: str
    category: str           # "factual", "coding", "reasoning", etc.
    difficulty: str         # "easy", "medium", "hard"
    input: str              # User query or task
    reference_output: str   # Gold standard response (optional)
    evaluation_criteria: list[str]  # What to check
    metadata: dict          # Additional context
```

### Dataset Creation Strategies

1. **From production logs** (anonymized):
```python
def create_eval_from_logs(logs: list[ConversationLog]) -> list[EvalExample]:
    examples = []
    for log in logs:
        if log.user_rating >= 4:  # Use highly-rated conversations
            examples.append(EvalExample(
                input=log.user_query,
                reference_output=log.agent_response,
                category=classify_query(log.user_query)
            ))
    return examples
```

2. **Synthetic generation**:
```python
def generate_synthetic_examples(category: str, count: int) -> list[EvalExample]:
    prompt = f"""
    Generate {count} diverse test cases for an AI agent in the "{category}" category.
    Each should include:
    - A realistic user query
    - Expected elements in a good response
    - Common failure modes to check for
    """
    return await generation_model.generate(prompt)
```

3. **Adversarial examples**:
```python
ADVERSARIAL_PATTERNS = [
    "Ambiguous queries",
    "Edge cases",
    "Conflicting instructions",
    "Prompt injection attempts",
    "Out-of-scope requests"
]
```

## Evaluation Pipeline

### Continuous Evaluation

```python
from bedrock_agentcore.eval import EvaluationPipeline

pipeline = EvaluationPipeline(
    agent=my_agent,
    dataset=eval_dataset,
    evaluators=[
        TaskCompletionEvaluator(),
        CorrectnessEvaluator(),
        SafetyEvaluator(),
        EfficiencyEvaluator()
    ],
    schedule="daily",
    alert_threshold={"task_completion": 0.85}
)

# Run evaluation
report = await pipeline.run()

# Check for regressions
if report.has_regression(baseline="last_week"):
    alert_team(report.regression_details)
```

### Evaluation Report

```python
class EvaluationReport:
    timestamp: datetime
    agent_version: str
    dataset_version: str
    
    overall_score: float
    dimension_scores: dict[str, float]
    
    examples_evaluated: int
    examples_passed: int
    examples_failed: int
    
    failure_analysis: list[FailureCase]
    recommendations: list[str]
    
    def compare_to(self, baseline: "EvaluationReport") -> Comparison:
        """Compare against baseline report."""
        pass
```

## Metrics Dashboard

Key metrics to track:

| Metric | Description | Target |
|--------|-------------|--------|
| Task Completion Rate | % of tasks fully completed | > 90% |
| Factual Accuracy | % of facts correct | > 95% |
| Safety Compliance | % passing safety checks | 100% |
| Average Latency | Time to first token | < 2s |
| Cost per Task | Average token cost | < $0.05 |
| User Satisfaction | Human rating average | > 4.0/5 |

## Best Practices

### 1. Evaluate Early and Often

```python
# In CI/CD pipeline
def pre_deploy_evaluation(agent: Agent) -> bool:
    report = await evaluation_pipeline.run(agent)
    return report.overall_score >= 0.85 and not report.has_safety_failures
```

### 2. Use Multiple Evaluation Methods

Don't rely on a single approach:
- Automated tests for regression
- LLM-as-judge for nuanced quality
- Human evaluation for ground truth
- A/B tests for production impact

### 3. Version Everything

```python
evaluation_run = {
    "agent_version": "1.2.3",
    "prompt_version": "abc123",
    "model": "claude-3-sonnet-20240229",
    "dataset_version": "eval-v2.1",
    "evaluator_version": "1.0.0",
    "timestamp": "2024-01-15T10:00:00Z"
}
```

### 4. Analyze Failures Deeply

```python
def analyze_failures(report: EvaluationReport) -> FailureAnalysis:
    failures = report.get_failures()
    return {
        "by_category": group_by(failures, "category"),
        "by_difficulty": group_by(failures, "difficulty"),
        "common_patterns": extract_patterns(failures),
        "root_causes": identify_root_causes(failures)
    }
```

### 5. Set Actionable Thresholds

```python
EVALUATION_THRESHOLDS = {
    "task_completion": {"warn": 0.90, "critical": 0.85},
    "safety": {"warn": 0.99, "critical": 0.95},
    "latency_p95": {"warn": 5.0, "critical": 10.0}
}
```
