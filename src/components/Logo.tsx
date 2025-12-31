"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-sm" },
    md: { icon: 36, text: "text-base" },
    lg: { icon: 48, text: "text-xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      {/* Blueprint-style hexagonal circuit logo */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Outer hexagon - dashed */}
        <path
          d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
          stroke="var(--color-cyan)"
          strokeWidth="1"
          strokeDasharray="4 2"
          fill="none"
        />
        {/* Inner hexagon - solid */}
        <path
          d="M24 10L36 17V31L24 38L12 31V17L24 10Z"
          stroke="var(--color-cyan)"
          strokeWidth="1.5"
          fill="var(--color-cyan-muted)"
        />
        {/* Center node */}
        <circle cx="24" cy="24" r="4" fill="var(--color-cyan)" />
        {/* Connection nodes */}
        <circle cx="24" cy="14" r="2" fill="var(--color-cyan)" />
        <circle cx="32" cy="19" r="2" fill="var(--color-cyan)" />
        <circle cx="32" cy="29" r="2" fill="var(--color-cyan)" />
        <circle cx="24" cy="34" r="2" fill="var(--color-cyan)" />
        <circle cx="16" cy="29" r="2" fill="var(--color-cyan)" />
        <circle cx="16" cy="19" r="2" fill="var(--color-cyan)" />
        {/* Connection lines */}
        <line x1="24" y1="14" x2="24" y2="20" stroke="var(--color-cyan)" strokeWidth="1" />
        <line x1="32" y1="19" x2="27" y2="22" stroke="var(--color-cyan)" strokeWidth="1" />
        <line x1="32" y1="29" x2="27" y2="26" stroke="var(--color-cyan)" strokeWidth="1" />
        <line x1="24" y1="34" x2="24" y2="28" stroke="var(--color-cyan)" strokeWidth="1" />
        <line x1="16" y1="29" x2="21" y2="26" stroke="var(--color-cyan)" strokeWidth="1" />
        <line x1="16" y1="19" x2="21" y2="22" stroke="var(--color-cyan)" strokeWidth="1" />
      </svg>
      {showText && (
        <div className={`font-body font-bold ${text} tracking-wider uppercase`}>
          <span className="text-text-primary">Agent</span>
          <span className="text-cyan">Core</span>
          <span className="text-text-muted ml-1 font-normal text-[0.7em] tracking-widest">
            Academy
          </span>
        </div>
      )}
    </div>
  );
}
