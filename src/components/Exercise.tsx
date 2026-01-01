"use client";

import { useState } from "react";
import type { Exercise, ExerciseField } from "@/lib/exercises";

interface ExerciseProps {
  exercise: Exercise;
  onSubmitToTutor?: (submission: Record<string, unknown>) => void;
}

export function ExerciseComponent({ exercise, onSubmitToTutor }: ExerciseProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [listInputs, setListInputs] = useState<Record<string, string>>({});
  const [showExample, setShowExample] = useState(false);

  const handleFieldChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleListAdd = (name: string) => {
    const input = listInputs[name]?.trim();
    if (!input) return;

    const currentList = (formData[name] as string[]) || [];
    setFormData((prev) => ({
      ...prev,
      [name]: [...currentList, input],
    }));
    setListInputs((prev) => ({ ...prev, [name]: "" }));
  };

  const handleListRemove = (name: string, index: number) => {
    const currentList = (formData[name] as string[]) || [];
    setFormData((prev) => ({
      ...prev,
      [name]: currentList.filter((_, i) => i !== index),
    }));
  };

  const handleChecklistToggle = (name: string, value: string) => {
    const currentList = (formData[name] as string[]) || [];
    if (currentList.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        [name]: currentList.filter((v) => v !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: [...currentList, value],
      }));
    }
  };

  const renderField = (field: ExerciseField) => {
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={(formData[field.name] as string) || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 bg-bp-deep border border-border-subtle text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan transition-colors font-body"
          />
        );

      case "textarea":
        return (
          <textarea
            value={(formData[field.name] as string) || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-4 py-3 bg-bp-deep border border-border-subtle text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan transition-colors font-body resize-y min-h-[100px]"
          />
        );

      case "code":
        return (
          <textarea
            value={(formData[field.name] as string) || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={8}
            className="w-full px-4 py-3 bg-bp-deep border border-border-subtle text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan transition-colors font-mono text-sm resize-y min-h-[200px]"
          />
        );

      case "select":
        return (
          <select
            value={(formData[field.name] as string) || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full px-4 py-3 bg-bp-deep border border-border-subtle text-text-primary focus:outline-none focus:border-cyan transition-colors font-body"
          >
            <option value="">Select an option...</option>
            {field.options?.map((opt) => {
              const value = typeof opt === "string" ? opt : opt.value;
              const label = typeof opt === "string" ? opt : opt.label;
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
        );

      case "list":
        const listValue = (formData[field.name] as string[]) || [];
        return (
          <div className="space-y-2">
            {listValue.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-bp-secondary border border-border-subtle"
              >
                <span className="text-cyan text-sm">▸</span>
                <span className="flex-1 text-text-secondary text-sm">{item}</span>
                <button
                  type="button"
                  onClick={() => handleListRemove(field.name, index)}
                  className="text-text-muted hover:text-error transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={listInputs[field.name] || ""}
                onChange={(e) =>
                  setListInputs((prev) => ({ ...prev, [field.name]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleListAdd(field.name);
                  }
                }}
                placeholder={field.placeholder}
                className="flex-1 px-4 py-2 bg-bp-deep border border-dashed border-border-dashed text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan transition-colors font-body text-sm"
              />
              <button
                type="button"
                onClick={() => handleListAdd(field.name)}
                className="px-4 py-2 border border-cyan text-cyan hover:bg-cyan hover:text-bp-deep transition-colors text-sm"
              >
                Add
              </button>
            </div>
          </div>
        );

      case "checklist":
        const checklistValue = (formData[field.name] as string[]) || [];
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => {
              const value = typeof opt === "string" ? opt : opt.value;
              const label = typeof opt === "string" ? opt : opt.label;
              const isChecked = checklistValue.includes(value);
              return (
                <label
                  key={value}
                  className={`flex items-start gap-3 px-4 py-3 border cursor-pointer transition-colors ${
                    isChecked
                      ? "border-cyan bg-cyan/10"
                      : "border-border-subtle hover:border-border"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleChecklistToggle(field.name, value)}
                    className="mt-0.5 accent-cyan"
                  />
                  <span className={`text-sm ${isChecked ? "text-text-primary" : "text-text-secondary"}`}>
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmitForReview = () => {
    if (onSubmitToTutor) {
      onSubmitToTutor(formData);
    }
  };

  return (
    <div className="space-y-8">
      <div className="schematic-box" data-label="EXERCISE">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-text-primary mb-2">{exercise.title}</h1>
            <p className="text-text-secondary">{exercise.overview}</p>
          </div>
          <div className="flex-shrink-0">
            <span className="badge badge-cyan">{exercise.estimatedTime}</span>
          </div>
        </div>
      </div>

      <div className="schematic-box" data-label="OBJECTIVES">
        <ul className="space-y-2">
          {exercise.objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 border border-dashed border-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan text-xs font-bold">{i + 1}</span>
              </div>
              <span className="text-text-secondary text-sm">{obj}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="prose-blueprint">
        <h3 className="font-display text-lg text-cyan mb-3">Context</h3>
        <p className="text-text-secondary">{exercise.context}</p>
      </div>

      <div className="prose-blueprint">
        <h3 className="font-display text-lg text-cyan mb-3">Instructions</h3>
        <p className="text-text-secondary whitespace-pre-line">{exercise.instructions}</p>
      </div>

      {exercise.exampleSubmission && (
        <div>
          <button
            onClick={() => setShowExample(!showExample)}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-cyan transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showExample ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showExample ? "Hide" : "Show"} Example Submission
          </button>
          {showExample && (
            <div className="mt-4 p-4 bg-bp-secondary border border-dashed border-border-dashed">
              <pre className="text-xs text-text-secondary overflow-x-auto">
                {JSON.stringify(exercise.exampleSubmission, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="schematic-box" data-label="YOUR SUBMISSION">
        <div className="space-y-6">
          {exercise.deliverable.fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-bold text-text-primary mb-2">
                {field.label}
                {field.required && <span className="text-error ml-1">*</span>}
              </label>
              {field.helpText && (
                <p className="text-xs text-text-muted mb-2">{field.helpText}</p>
              )}
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>

      <div className="schematic-box" data-label="SUCCESS CRITERIA">
        <p className="text-xs text-text-muted mb-3">Your submission should meet these criteria:</p>
        <ul className="space-y-2">
          {exercise.successCriteria.map((criterion, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-cyan">☐</span>
              {criterion}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSubmitForReview}
          className="btn btn-primary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Submit for AI Review
        </button>
        <button
          onClick={() => {
            console.log("Saving draft:", formData);
            alert("Draft saved locally! (In production, this would save to your account)");
          }}
          className="btn btn-secondary"
        >
          Save Draft
        </button>
      </div>
    </div>
  );
}
