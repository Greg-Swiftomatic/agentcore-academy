"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

function NavLink({ href, children, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`
        font-body text-xs font-bold uppercase tracking-widest px-4 py-2
        transition-all duration-150 relative
        ${
          isActive
            ? "text-cyan"
            : "text-text-muted hover:text-cyan"
        }
      `}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-4 right-4 h-px bg-cyan shadow-glow" />
      )}
    </Link>
  );
}

interface NavigationProps {
  user?: {
    name?: string;
    avatarUrl?: string;
  } | null;
}

export function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bp-deep/90 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="hover:opacity-90 transition-opacity relative group">
            <Logo size="sm" />
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-cyan transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center">
            {user ? (
              <>
                <NavLink href="/dashboard" isActive={isActive("/dashboard")}>
                  Dashboard
                </NavLink>
                <NavLink href="/curriculum" isActive={isActive("/curriculum")}>
                  Curriculum
                </NavLink>
                <NavLink href="/learn" isActive={isActive("/learn")}>
                  Learn
                </NavLink>
              </>
            ) : (
              <>
                <NavLink href="/#features" isActive={false}>
                  Features
                </NavLink>
                <NavLink href="/#curriculum" isActive={false}>
                  Curriculum
                </NavLink>
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/settings"
                className="flex items-center gap-3 group"
              >
                {user.avatarUrl ? (
                  <div className="relative">
                    <Image
                      src={user.avatarUrl}
                      alt={user.name || "User"}
                      width={32}
                      height={32}
                      className="border border-border group-hover:border-cyan transition-colors"
                    />
                    <span className="absolute -top-px -right-px w-2 h-2 bg-success" />
                  </div>
                ) : (
                  <div className="w-8 h-8 border border-border bg-bp-secondary flex items-center justify-center group-hover:border-cyan transition-colors">
                    <span className="font-body text-xs text-cyan font-bold">
                      {user.name?.[0] || "U"}
                    </span>
                  </div>
                )}
              </Link>
            ) : (
              <Link href="/auth/signin" className="btn btn-primary">
                <span>Initialize</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Scanline effect on hover */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 hover:opacity-100 transition-opacity">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-cyan/5 to-transparent"
          style={{ height: '2px', animation: 'scanline 3s linear infinite' }}
        />
      </div>
    </nav>
  );
}
