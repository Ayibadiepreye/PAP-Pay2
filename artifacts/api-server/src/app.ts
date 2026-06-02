import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import path from "path";
import { fileURLToPath } from "url";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use("/api", router);

// Serve static files from frontend build
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDistDir = path.resolve(__dirname, "../../pap-pay/dist/public");
app.use(express.static(frontendDistDir));

// Fallback to index.html for SPA routing
app.get("/*", (_req, res) => {
  res.sendFile(path.join(frontendDistDir, "index.html"));
});

export default app;
