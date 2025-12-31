"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  type: "concept" | "scenario" | "application" | "critical";
  question: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  concept: string;
}

interface CheckData {
  moduleId: string;
  passingScore: number;
  questions: Question[];
}

interface ComprehensionCheckProps {
  moduleId: string;
  onComplete?: (passed: boolean, score: number) => void;
}

export function ComprehensionCheck({ moduleId, onComplete }: ComprehensionCheckProps) {
  const { user } = useAuth();
  const [checkData, setCheckData] = useState<CheckData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCheck() {
      try {
        const data = await import(`@/content/checks/${moduleId}.json`);
        setCheckData(data.default || data);
      } catch (error) {
        console.error("Failed to load comprehension check:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCheck();
  }, [moduleId]);

  if (loading) {
    return (
      <div className="card border-border-subtle">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-text-muted">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading comprehension check...
          </div>
        </div>
      </div>
    );
  }

  if (!checkData) {
    return (
      <div className="card border-border-subtle">
        <div className="text-center py-8">
          <p className="text-text-muted">No comprehension check available for this module yet.</p>
        </div>
      </div>
    );
  }

  const question = checkData.questions[currentQuestion];
  const totalQuestions = checkData.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleSelectAnswer = (answerId: string) => {
    if (showResult) return;
    setSelectedAnswer(answerId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !question) return;
    
    setAnswers((prev) => ({ ...prev, [question.id]: selectedAnswer }));
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Calculate final score
      const correctCount = checkData.questions.reduce((count, q) => {
        return count + (answers[q.id] === q.correctAnswer || 
          (q.id === question.id && selectedAnswer === q.correctAnswer) ? 1 : 0);
      }, 0);
      const finalScore = Math.round((correctCount / totalQuestions) * 100);
      setScore(finalScore);
      setIsComplete(true);
      
      const passed = finalScore >= checkData.passingScore;
      onComplete?.(passed, finalScore);
    }
  };

  const isCorrect = selectedAnswer === question?.correctAnswer;

  if (isComplete) {
    const passed = score >= checkData.passingScore;
    
    return (
      <div className="card border-border-subtle">
        <div className="text-center py-8">
          {/* Result icon */}
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            passed ? "bg-success/20 border-2 border-success" : "bg-warning/20 border-2 border-warning"
          }`}>
            {passed ? (
              <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>

          {/* Score */}
          <h3 className="font-display text-2xl text-text-primary mb-2">
            {passed ? "Module Verified!" : "Keep Learning"}
          </h3>
          <p className="text-text-secondary mb-6">
            You scored <span className={`font-bold ${passed ? "text-success" : "text-warning"}`}>{score}%</span>
            {" "}({Math.round(score * totalQuestions / 100)}/{totalQuestions} correct)
          </p>
          
          {passed ? (
            <p className="text-text-muted text-sm mb-8">
              You&apos;ve demonstrated understanding of the key concepts in this module.
              You can now proceed to the next module.
            </p>
          ) : (
            <p className="text-text-muted text-sm mb-8">
              You need {checkData.passingScore}% to pass. Review the lessons and try again.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            {!passed && (
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setSelectedAnswer(null);
                  setShowResult(false);
                  setAnswers({});
                  setIsComplete(false);
                  setScore(0);
                }}
                className="btn btn-secondary"
              >
                Try Again
              </button>
            )}
            <a
              href={passed ? "/curriculum" : `/learn/${moduleId}/01-what-is-agentcore`}
              className="btn btn-primary"
            >
              {passed ? "Continue to Curriculum" : "Review Lessons"}
            </a>
          </div>
        </div>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    concept: "Concept Check",
    scenario: "Scenario",
    application: "Application",
    critical: "Critical Thinking",
  };

  return (
    <div className="card border-border-subtle">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-cyan text-xs">{typeLabels[question.type]}</span>
          <p className="text-text-muted text-xs mt-1">
            Question {currentQuestion + 1} of {totalQuestions}
          </p>
        </div>
        <div className="text-right">
          <p className="text-text-muted text-xs uppercase tracking-wider">Progress</p>
          <p className="font-display text-lg text-cyan">{Math.round(progress)}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-8">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <h3 className="font-body text-lg text-text-primary mb-6 leading-relaxed">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrectOption = option.id === question.correctAnswer;
          
          let optionClass = "border-border-subtle hover:border-cyan/50";
          if (showResult) {
            if (isCorrectOption) {
              optionClass = "border-success bg-success/10";
            } else if (isSelected && !isCorrectOption) {
              optionClass = "border-error bg-error/10";
            }
          } else if (isSelected) {
            optionClass = "border-cyan bg-cyan/10";
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelectAnswer(option.id)}
              disabled={showResult}
              className={`w-full p-4 border text-left transition-all ${optionClass} ${
                showResult ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-6 h-6 border flex items-center justify-center flex-shrink-0 ${
                  showResult && isCorrectOption
                    ? "bg-success border-success text-bp-deep"
                    : showResult && isSelected && !isCorrectOption
                    ? "bg-error border-error text-white"
                    : isSelected
                    ? "bg-cyan border-cyan text-bp-deep"
                    : "border-border-dashed text-text-muted"
                }`}>
                  <span className="text-xs font-bold uppercase">{option.id}</span>
                </div>
                <p className={`font-body text-sm ${
                  showResult && isCorrectOption
                    ? "text-success"
                    : showResult && isSelected && !isCorrectOption
                    ? "text-error"
                    : "text-text-primary"
                }`}>
                  {option.text}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation (shown after answering) */}
      {showResult && (
        <div className={`p-4 border mb-6 ${isCorrect ? "border-success/50 bg-success/5" : "border-warning/50 bg-warning/5"}`}>
          <div className="flex items-start gap-3">
            <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center ${
              isCorrect ? "text-success" : "text-warning"
            }`}>
              {isCorrect ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <p className={`font-body font-bold text-sm mb-1 ${isCorrect ? "text-success" : "text-warning"}`}>
                {isCorrect ? "Correct!" : "Not quite right"}
              </p>
              <p className="text-text-secondary text-sm">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        {!showResult ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        ) : (
          <button onClick={handleNextQuestion} className="btn btn-primary">
            {currentQuestion < totalQuestions - 1 ? "Next Question" : "See Results"}
          </button>
        )}
      </div>
    </div>
  );
}
