import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { CollapsibleTutor } from "@/components/CollapsibleTutor";
import { LessonTracker } from "@/components/LessonTracker";
import { ModuleGate } from "@/components/ModuleGate";
import curriculumData from "@/content/modules/curriculum.json";
import { loadLessonContent } from "@/lib/lessons";

interface LessonPageProps {
  params: Promise<{
    moduleId: string;
    lessonId: string;
  }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { moduleId, lessonId } = await params;

  // Find the module and lesson
  const currentModule = curriculumData.modules.find((m) => m.id === moduleId);
  const lesson = currentModule?.lessons.find((l) => l.id === lessonId);

  if (!currentModule || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="w-16 h-16 border border-dashed border-error mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl text-text-primary mb-2">Module Not Found</h1>
          <p className="text-text-muted mb-6">The requested training module could not be located.</p>
          <Link href="/curriculum" className="btn btn-primary">
            Return to Schematics
          </Link>
        </div>
      </div>
    );
  }

  // Find current lesson index for navigation
  const currentLessonIndex = currentModule.lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentLessonIndex > 0 ? currentModule.lessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < currentModule.lessons.length - 1
      ? currentModule.lessons[currentLessonIndex + 1]
      : null;

  // Load lesson content from files
  const lessonData = await loadLessonContent(moduleId, lessonId);

  // Find module index
  const moduleIndex = curriculumData.modules.findIndex((m) => m.id === moduleId);

  return (
    <ModuleGate moduleId={moduleId}>
    <div className="min-h-screen relative z-10">
      <Navigation />
      <LessonTracker moduleId={moduleId} lessonId={lessonId} />

      {/* Top Navigation Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-bp-deep/95 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider">
              <Link href="/curriculum" className="text-text-muted hover:text-cyan transition-colors">
                Curriculum
              </Link>
              <span className="text-border-dashed">/</span>
              <Link href={`/learn/${moduleId}`} className="text-text-muted hover:text-cyan transition-colors">
                Module {String(moduleIndex + 1).padStart(2, "0")}
              </Link>
              <span className="text-border-dashed">/</span>
              <span className="text-cyan truncate max-w-[200px]">
                {lesson.title}
              </span>
            </div>

            {/* Progress & Navigation */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
                <span className="text-cyan font-bold">{currentLessonIndex + 1}</span>
                <span>/</span>
                <span>{currentModule.lessons.length}</span>
              </div>
              <div className="flex items-center gap-2">
                {prevLesson ? (
                  <Link
                    href={`/learn/${moduleId}/${prevLesson.id}`}
                    className="w-8 h-8 border border-border-subtle hover:border-cyan flex items-center justify-center transition-colors group"
                    title={prevLesson.title}
                  >
                    <svg className="w-4 h-4 text-text-muted group-hover:text-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Link>
                ) : (
                  <div className="w-8 h-8 border border-border-subtle flex items-center justify-center opacity-30">
                    <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                )}
                {nextLesson ? (
                  <Link
                    href={`/learn/${moduleId}/${nextLesson.id}`}
                    className="btn btn-primary py-2 px-4 text-xs"
                    title={nextLesson.title}
                  >
                    <span>Next</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <Link href={`/learn/${moduleId}/check`} className="btn btn-primary py-2 px-4 text-xs">
                    <span>Take Check</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <main className="pt-32 h-screen">
        <div className="h-[calc(100vh-8rem)] flex">
          {/* Left: Lesson Content */}
          <div className="flex-1 overflow-y-auto border-r border-border-subtle">
            <div className="max-w-3xl mx-auto px-8 py-8">
              {/* Lesson Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="badge badge-cyan">
                    Module {String(moduleIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-border-dashed" />
                </div>
                <h1 className="font-display text-3xl text-text-primary mb-3">{lesson.title}</h1>
                <p className="text-text-secondary">{lesson.description}</p>
              </div>

              {/* Learning Objectives */}
              <div className="schematic-box mb-8" data-label="LEARNING OBJECTIVES">
                <ul className="space-y-3">
                  {lessonData.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 border border-dashed border-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-cyan text-xs font-bold">{i + 1}</span>
                      </div>
                      <span className="text-text-secondary text-sm">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lesson Content */}
              <div className="prose-blueprint">
                <LessonContent content={lessonData.content} />
              </div>

              {/* Bottom Navigation */}
              <div className="mt-12 pt-8 border-t border-border-dashed">
                <div className="flex items-center justify-between">
                  {prevLesson ? (
                    <Link
                      href={`/learn/${moduleId}/${prevLesson.id}`}
                      className="group flex items-center gap-3 text-text-muted hover:text-cyan transition-colors"
                    >
                      <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <div className="text-left">
                        <p className="text-xs uppercase tracking-wider opacity-60">Previous</p>
                        <p className="font-body text-sm font-bold">{prevLesson.title}</p>
                      </div>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {nextLesson ? (
                    <Link
                      href={`/learn/${moduleId}/${nextLesson.id}`}
                      className="group flex items-center gap-3 text-text-muted hover:text-cyan transition-colors"
                    >
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wider opacity-60">Next</p>
                        <p className="font-body text-sm font-bold">{nextLesson.title}</p>
                      </div>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ) : (
                    <Link href={`/learn/${moduleId}/check`} className="btn btn-primary">
                      <span>Take Comprehension Check</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: AI Tutor */}
          <CollapsibleTutor
            moduleId={moduleId}
            lessonId={lessonId}
            moduleContext={`Module: ${currentModule.title}\nDescription: ${currentModule.description}`}
            lessonContent={lessonData.content}
          />
        </div>
      </main>
    </div>
    </ModuleGate>
  );
}

function LessonContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = "";
  let tableRows: string[] = [];
  let elementKey = 0;

  const flushTable = () => {
    if (tableRows.length === 0) return;
    
    const headerRow = tableRows[0];
    const dataRows = tableRows.slice(2);
    
    const parseRow = (row: string) => 
      row.split("|").slice(1, -1).map(cell => cell.trim());
    
    const headers = parseRow(headerRow);
    
    elements.push(
      <div key={elementKey++} className="my-6 overflow-x-auto">
        <table className="lesson-table w-full border-collapse text-sm">
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={i} className="text-left px-3 py-2 border border-border-dashed bg-bp-deep text-cyan font-bold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-cyan-muted/30">
                {parseRow(row).map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-3 py-2 border border-border-subtle text-text-secondary">
                    <InlineMarkdown text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  };

  lines.forEach((line) => {
    if (line.startsWith("```")) {
      flushTable();
      if (inCodeBlock) {
        elements.push(
          <pre key={elementKey++} className="my-6 bg-bp-deep border border-dashed border-border-dashed p-4 overflow-x-auto relative">
            <span className="absolute -top-2 left-4 bg-bp-primary px-2 text-[10px] uppercase tracking-wider text-cyan">
              {codeBlockLang || "code"}
            </span>
            <code className="text-text-primary text-sm font-body">
              {codeBlockContent.join("\n")}
            </code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBlockLang = line.slice(3) || "text";
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    if (line.startsWith("|") && line.endsWith("|")) {
      tableRows.push(line);
      return;
    } else if (tableRows.length > 0) {
      flushTable();
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={elementKey++} className="font-display text-2xl text-text-primary mt-8 mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-cyan" />
          {line.slice(2)}
        </h1>
      );
      return;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={elementKey++} className="font-display text-xl text-text-primary mt-8 mb-4">
          {line.slice(3)}
        </h2>
      );
      return;
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={elementKey++} className="font-display text-lg text-cyan mt-6 mb-3">
          {line.slice(4)}
        </h3>
      );
      return;
    }

    if (line.startsWith("- ")) {
      elements.push(
        <li key={elementKey++} className="ml-6 text-text-secondary list-none flex items-start gap-2 my-1">
          <span className="text-cyan mt-1.5">▸</span>
          <span><InlineMarkdown text={line.slice(2)} /></span>
        </li>
      );
      return;
    }

    const numberedMatch = line.match(/^(\d+)\. (.+)/);
    if (numberedMatch) {
      elements.push(
        <li key={elementKey++} className="ml-6 text-text-secondary list-none flex items-start gap-3 my-2">
          <span className="w-5 h-5 border border-cyan text-cyan text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
            {numberedMatch[1]}
          </span>
          <span><InlineMarkdown text={numberedMatch[2]} /></span>
        </li>
      );
      return;
    }

    if (line.trim() === "") {
      elements.push(<div key={elementKey++} className="h-4" />);
      return;
    }

    elements.push(
      <p key={elementKey++} className="text-text-secondary leading-relaxed mb-4">
        <InlineMarkdown text={line} />
      </p>
    );
  });

  flushTable();

  return <>{elements}</>;
}

function InlineMarkdown({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
    const codeMatch = remaining.match(/`(.+?)`/);

    const matches: { type: string; match: RegExpMatchArray; index: number }[] = [];
    if (boldMatch && boldMatch.index !== undefined) {
      matches.push({ type: "bold", match: boldMatch, index: boldMatch.index });
    }
    if (italicMatch && italicMatch.index !== undefined) {
      matches.push({ type: "italic", match: italicMatch, index: italicMatch.index });
    }
    if (codeMatch && codeMatch.index !== undefined) {
      matches.push({ type: "code", match: codeMatch, index: codeMatch.index });
    }

    if (matches.length === 0) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    matches.sort((a, b) => a.index - b.index);
    const first = matches[0];

    if (first.index > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, first.index)}</span>);
    }

    if (first.type === "bold") {
      parts.push(
        <strong key={key++} className="text-text-primary font-bold">
          {first.match[1]}
        </strong>
      );
    } else if (first.type === "italic") {
      parts.push(
        <em key={key++} className="text-cyan italic">
          {first.match[1]}
        </em>
      );
    } else if (first.type === "code") {
      parts.push(
        <code key={key++} className="bg-cyan-muted text-cyan px-1.5 py-0.5 text-sm border border-border-subtle">
          {first.match[1]}
        </code>
      );
    }

    remaining = remaining.slice(first.index + first.match[0].length);
  }

  return <>{parts}</>;
}
