import cors from "cors";
import express, { Response } from "express";


class SSEManager {
  readonly clients = new Map<string, Set<Response>>();

  constructor() {
    this.clients = new Map<string, Set<Response>>();
  }

  subscribe(clientId: string, response: Response) {
    let client = this.clients.get(clientId);
    if (!client) {
      client = new Set();
      this.clients.set(clientId, client);
    }

    client.add(response);
    response.on("close", () => {
      client.delete(response);
      if (client.size === 0) {
        this.clients.delete(clientId);
      }
    });
  }

  notify(clientId: string, message: any) {
    let clients = this.clients.get(clientId);
    if (!clients) return;

    const content = `data: ${JSON.stringify(message)}\n\n`;
    for (const client of clients) {
      client.write(content);
    }
  }
}

const main = async () => {
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  );

  const port = 3000;

  const sseManager = new SSEManager();

  app.get("/api/v1/notifications/stream", async (request, response) => {
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.flushHeaders();

    const { clientId } = request.query as {
      clientId: string;
    };

    if (clientId) sseManager.subscribe(clientId, response);
    response.write(`data: {\"message\": \"conectado\"}\n\n`);
  });

  app.post("/api/v1/notifications/notify", async (request, response) => {
    const { clientId, message } = request.body as {
      clientId: string;
      message: string;
    };

    sseManager.notify(clientId, message);
    response.end();
  });

  app.listen(port, () => console.info(`Server running on localhost:${port}`));
};

main();
