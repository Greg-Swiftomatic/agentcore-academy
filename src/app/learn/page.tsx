import { redirect } from "next/navigation";

export default function LearnPage() {
  // Redirect to the first lesson of the first module
  redirect("/learn/01-introduction/01-what-is-agentcore");
}
