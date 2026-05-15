import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const db = new Database("orders.db");

// S3 Client Configuration (Supabase S3 API)
const s3Client = process.env.S3_ACCESS_KEY_ID ? new S3Client({
  endpoint: process.env.S3_ENDPOINT || "https://bievqeogyuvawkrmsrpe.storage.supabase.co/storage/v1/s3",
  region: process.env.S3_REGION || "sa-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
}) : null;

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    items TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ready_at DATETIME
  )
`);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  app.use(express.json());

  // Broadcast helper
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // API Routes
  app.get("/api/orders", (req, res) => {
    const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
    res.json(orders);
  });

  app.post("/api/orders", (req, res) => {
    const { customer_name, items } = req.body;
    if (!customer_name || !items) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const info = db.prepare("INSERT INTO orders (customer_name, items) VALUES (?, ?)").run(customer_name, items);
    broadcast({ type: "ORDER_CREATED", id: info.lastInsertRowid });
    res.json({ id: info.lastInsertRowid, status: "pending" });
  });

  app.patch("/api/orders/:id/ready", (req, res) => {
    const { id } = req.params;
    db.prepare("UPDATE orders SET status = 'ready', ready_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
    broadcast({ type: "ORDER_READY", id: parseInt(id) });
    res.json({ success: true });
  });

  app.patch("/api/orders/:id/delivered", (req, res) => {
    const { id } = req.params;
    db.prepare("UPDATE orders SET status = 'delivered' WHERE id = ?").run(id);
    broadcast({ type: "ORDER_DELIVERED", id: parseInt(id) });
    res.json({ success: true });
  });

  // ESP32 Endpoint
  // Returns the ID of the most recent 'ready' order
  app.get("/api/esp32/status", (req, res) => {
    const lastReady = db.prepare("SELECT id FROM orders WHERE status = 'ready' ORDER BY ready_at DESC LIMIT 1").get();
    res.json({ lastReadyId: lastReady ? lastReady.id : 0 });
  });

  // POST endpoint to trigger LED (requested by user)
  app.post("/api/esp32/trigger", (req, res) => {
    broadcast({ type: "TRIGGER_LED", timestamp: Date.now() });
    res.json({ success: true, message: "LED Trigger broadcasted" });
  });

  // LED State for ESP32
  let ledStatus = "off";

  // ESP32 Polling Endpoint
  // Returns "1" for ON and "0" for OFF
  app.get("/api/esp32/led", (req, res) => {
    res.send(ledStatus === "on" ? "1" : "0");
  });

  // Endpoint to update LED state from the frontend
  app.post("/api/esp32/led", (req, res) => {
    const { status } = req.body;
    if (status === "on" || status === "off") {
      ledStatus = status;
      broadcast({ type: "LED_STATUS_CHANGED", status: ledStatus });
      res.json({ success: true, status: ledStatus });
    } else {
      res.status(400).json({ error: "Invalid status" });
    }
  });

  // S3 Pre-signed URL Endpoint
  app.post("/api/storage/presigned-url", async (req, res) => {
    if (!s3Client) {
      return res.status(503).json({ error: "S3 Storage not configured on server" });
    }

    const { fileName, contentType } = req.body;
    if (!fileName) return res.status(400).json({ error: "fileName required" });

    try {
      const bucket = process.env.S3_BUCKET_NAME || "imagens";
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        ContentType: contentType || "image/jpeg",
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      
      // Construct the likely public URL for Supabase
      // Usually: https://project-id.supabase.co/storage/v1/object/public/bucket/file
      const projectId = "bievqeogyuvawkrmsrpe";
      const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${fileName}`;

      res.json({ uploadUrl: url, publicUrl });
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
