import { Amplify } from "aws-amplify";

/**
 * Configure Amplify for client-side usage.
 * After deployment, amplify_outputs.json will be generated
 * with actual configuration values.
 */
export function configureAmplify() {
  // This will be populated after `amplify sandbox` or deployment
  // For now, we check if the config file exists
  try {
    // Dynamic import to handle missing file during development
    const outputs = require("../../amplify_outputs.json");
    Amplify.configure(outputs);
  } catch {
    console.warn(
      "Amplify outputs not found. Run `npx ampx sandbox` to generate configuration."
    );
  }
}
