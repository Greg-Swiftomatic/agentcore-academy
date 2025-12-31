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
        font-display text-sm font-medium px-4 py-2 rounded-md
        transition-all duration-150
        ${
          isActive
            ? "text-accent bg-accent-muted"
            : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
        }
      `}
    >
      {children}
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="sm" />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
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
              <div className="flex items-center gap-3">
                <Link
                  href="/settings"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent-muted flex items-center justify-center">
                      <span className="font-display text-sm text-accent">
                        {user.name?.[0] || "U"}
                      </span>
                    </div>
                  )}
                </Link>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="btn btn-primary text-sm"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
