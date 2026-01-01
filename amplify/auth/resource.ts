import { defineAuth, secret } from "@aws-amplify/backend";

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
        "https://main.d137jxngnvzxkf.amplifyapp.com/auth/callback",
      ],
      logoutUrls: [
        "http://localhost:3000/",
        "https://main.d137jxngnvzxkf.amplifyapp.com/",
      ],
    },
  },
});
