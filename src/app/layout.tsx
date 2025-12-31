import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentCore Academy",
  description:
    "Learn Amazon Bedrock AgentCore through interactive lessons and AI-powered tutoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
