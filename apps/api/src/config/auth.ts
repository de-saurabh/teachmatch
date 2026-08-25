import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";

import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      accountType: {
        type: "string",
        required: true,
        input: true,
      },
    },
  },
  // "teachmatch://" is the Expo app's deep-link scheme, needed by the
  // expo() plugin below for its OAuth-style redirect handshake even
  // though we only use email/password today.
  trustedOrigins: [process.env.WEB_ORIGIN ?? "http://localhost:5173", "teachmatch://"],
  // spec served at /api/auth/open-api/generate-schema; the built-in
  // HTML reference is disabled in favor of our self-hosted Scalar
  // page at /docs, see app.ts
  plugins: [openAPI({ disableDefaultReference: true }), expo()],
});
