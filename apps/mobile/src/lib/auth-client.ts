import { expoClient } from "@better-auth/expo/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000",
  plugins: [
    expoClient({ scheme: "teachmatch", storage: SecureStore }),
    inferAdditionalFields({
      user: {
        accountType: { type: "string", input: true },
      },
    }),
  ],
});

export const { useSession, signIn, signUp, signOut } = authClient;
