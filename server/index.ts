import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { fail } from "./utils/response.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, service: "enjez-api", time: new Date().toISOString() });
});

app.use((_req, res) => fail(res, 404, "Route not found"));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[server] unhandled error:", err);
  return fail(res, 500, "Internal server error");
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
