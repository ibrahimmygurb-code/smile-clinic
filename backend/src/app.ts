import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth";
import { apiRouter } from "./routes/api";

export function createApp() {
  const app = express();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  app.use(
    cors({
      origin: [frontendUrl, "http://localhost:3000", "http://localhost:3001"],
    }),
  );
  app.use(express.json());
  app.use("/api/auth", authRouter);
  app.use("/api", apiRouter);

  return app;
}
