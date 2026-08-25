import { apiReference } from "@scalar/express-api-reference";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";

import { auth } from "./config/auth";
import { healthRouter } from "./routes/health";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
      credentials: true,
    }),
  );

  // must be mounted before express.json() — better-auth reads the raw body itself
  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use(express.json());
  app.use(healthRouter);

  app.use(
    "/docs",
    apiReference({
      url: "/api/auth/open-api/generate-schema",
      theme: "purple",
    }),
  );

  return app;
}
