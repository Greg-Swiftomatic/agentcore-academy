"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 48, text: "text-3xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      {/* Abstract AI/Agent icon - geometric brain/network */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Outer hexagon */}
        <path
          d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
          stroke="var(--color-accent)"
          strokeWidth="2"
          fill="none"
        />
        {/* Inner connections - neural network style */}
        <circle cx="24" cy="14" r="3" fill="var(--color-accent)" />
        <circle cx="14" cy="24" r="3" fill="var(--color-accent)" />
        <circle cx="34" cy="24" r="3" fill="var(--color-accent)" />
        <circle cx="19" cy="32" r="3" fill="var(--color-accent)" />
        <circle cx="29" cy="32" r="3" fill="var(--color-accent)" />
        <circle cx="24" cy="24" r="4" fill="var(--color-accent)" />
        {/* Connection lines */}
        <line x1="24" y1="14" x2="24" y2="20" stroke="var(--color-accent)" strokeWidth="1.5" />
        <line x1="14" y1="24" x2="20" y2="24" stroke="var(--color-accent)" strokeWidth="1.5" />
        <line x1="28" y1="24" x2="34" y2="24" stroke="var(--color-accent)" strokeWidth="1.5" />
        <line x1="22" y1="27" x2="19" y2="30" stroke="var(--color-accent)" strokeWidth="1.5" />
        <line x1="26" y1="27" x2="29" y2="30" stroke="var(--color-accent)" strokeWidth="1.5" />
      </svg>
      {showText && (
        <span className={`font-display font-semibold ${text} tracking-tight`}>
          <span className="text-text-primary">AgentCore</span>
          <span className="text-accent ml-1">Academy</span>
        </span>
      )}
    </div>
  );
}
