import http from "node:http";
import { fileURLToPath } from "node:url";
import { createDatabaseClient, type IDatabaseClient } from "@stellarclear/db";
import { createApiServer, type ApiServer } from "./server.js";
import { loadApiConfigFromEnv, detectUnsafeDefaults, type ApiConfig } from "./config.js";
import type { HttpRequest, HttpResponse } from "./types.js";

function generateUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface ApiServerInstance {
  server: http.Server;
  apiServer: ApiServer;
  config: ApiConfig;
  stop: () => Promise<void>;
}

/**
 * Starts the standalone StellarClear REST API HTTP server.
 */
export async function startApiServer(
  customConfig?: Partial<ApiConfig>,
  customDbClient?: IDatabaseClient
): Promise<ApiServerInstance> {
  const envConfig = loadApiConfigFromEnv(process.env);
  const config: ApiConfig = { ...envConfig, ...customConfig };

  const warnings = detectUnsafeDefaults(config, config.network === "mainnet");
  for (const w of warnings) {
    console.warn(`[CONFIG WARNING] ${w}`);
  }

  const dbClient = customDbClient ?? createDatabaseClient({ databaseUrl: config.databaseUrl });
  const apiServer = createApiServer(config, dbClient);

  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    req.on("end", async () => {
      let body: unknown = undefined;
      if (chunks.length > 0) {
        const rawBody = Buffer.concat(chunks).toString("utf8");
        try {
          body = JSON.parse(rawBody);
        } catch {
          body = rawBody;
        }
      }

      const httpRequest: HttpRequest = {
        method: req.method || "GET",
        url: req.url || "/",
        headers: req.headers as Record<string, string | string[] | undefined>,
        body,
        requestId: (req.headers["x-request-id"] as string) || generateUuid(),
      };

      try {
        const httpResponse: HttpResponse = await apiServer.handleRequest(httpRequest);
        const headers: Record<string, string> = { ...httpResponse.headers };
        const responseBody =
          typeof httpResponse.body === "string"
            ? httpResponse.body
            : JSON.stringify(httpResponse.body);

        if (!headers["content-type"]) {
          headers["content-type"] = "application/json";
        }
        res.writeHead(httpResponse.statusCode, headers);
        res.end(responseBody);
      } catch (err: unknown) {
        const errorBody = JSON.stringify({
          error: {
            code: "INTERNAL_ERROR",
            message: "Internal server error occurred",
            requestId: httpRequest.requestId,
          },
        });
        res.writeHead(500, { "content-type": "application/json" });
        res.end(errorBody);
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(config.port, config.host, () => {
      console.log(
        `[StellarClear API] Listening on http://${config.host}:${config.port} (Network: ${config.network})`
      );
      resolve();
    });
    server.once("error", reject);
  });

  const stop = async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await dbClient.close();
  };

  return { server, apiServer, config, stop };
}

// Auto-start when executed directly as entrypoint
const isDirectEntry =
  process.argv[1] &&
  (process.argv[1].endsWith("main.js") ||
    process.argv[1].endsWith("main.ts") ||
    process.argv[1] === fileURLToPath(import.meta.url));

if (isDirectEntry) {
  startApiServer()
    .then((instance) => {
      const handleSignal = async (signal: string) => {
        console.log(`[StellarClear API] Received ${signal}, shutting down gracefully...`);
        await instance.stop();
        process.exit(0);
      };
      process.on("SIGINT", () => handleSignal("SIGINT"));
      process.on("SIGTERM", () => handleSignal("SIGTERM"));
    })
    .catch((err) => {
      console.error("[StellarClear API] Failed to start:", err);
      process.exit(1);
    });
}
