import { defineAuth, secret } from "@aws-amplify/backend";

/**
 * Define authentication with GitHub and Google OAuth providers.
 * 
 * To configure OAuth:
 * 1. Create OAuth apps in Google Cloud Console
 * 2. Run: npx ampx sandbox secret set GOOGLE_CLIENT_ID
 * 3. Run: npx ampx sandbox secret set GOOGLE_CLIENT_SECRET
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret("GOOGLE_CLIENT_ID"),
        clientSecret: secret("GOOGLE_CLIENT_SECRET"),
        scopes: ["email", "profile", "openid"],
        attributeMapping: {
          email: "email",
          fullname: "name",
          profilePicture: "picture",
        },
      },
      callbackUrls: [
        "http://localhost:3000/auth/callback",
        // Add production URL after deployment
      ],
      logoutUrls: [
        "http://localhost:3000/",
        // Add production URL after deployment
      ],
    },
  },
});
