import { toNodeHandler } from "better-auth/node";
import express from "express";

import { auth } from "./config/auth";
import { healthRouter } from "./routes/health";

export function createApp() {
  const app = express();

  // must be mounted before express.json() — better-auth reads the raw body itself
  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use(express.json());
  app.use(healthRouter);

  return app;
}
