const { WebSocketServer } = require("ws");
const Y = require("yjs");
const { readFileSync, writeFileSync, existsSync, mkdirSync } = require("fs");
const path = require("path");

const DOCS_PATH = "./yjs_docs";

// تأكدي أن المجلد موجود لحفظ الحالة
if (!existsSync(DOCS_PATH)) mkdirSync(DOCS_PATH);

const docs = new Map();

function getYDoc(docName) {
  if (!docs.has(docName)) {
    const doc = new Y.Doc();
    const filePath = path.join(DOCS_PATH, `${docName}.bin`);
    if (existsSync(filePath)) {
      try {
        const data = readFileSync(filePath);
        Y.applyUpdate(doc, new Uint8Array(data));
      } catch (err) {
        console.error("❌ Failed to load Yjs doc:", err);
      }
    }

    // حفظ تلقائي كل 30 ثانية
    setInterval(() => {
      const data = Y.encodeStateAsUpdate(doc);
      writeFileSync(filePath, Buffer.from(data));
    }, 30000);

    docs.set(docName, doc);
  }
  return docs.get(docName);
}

function startYjsServer(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/yjs") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        const room = url.searchParams.get("room") || "default";
        const doc = getYDoc(room);

        ws.on("message", (message) => {
          try {
            const data = new Uint8Array(message);
            Y.applyUpdate(doc, data);
            // بث التغييرات لكل المتصلين
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === 1) {
                client.send(data);
              }
            });
          } catch (err) {
            console.error("❌ Error applying update:", err);
          }
        });
      });
    } else {
      socket.destroy();
    }
  });

  console.log(
    "✅ Custom Yjs WebSocket server ready at ws://localhost:5001/yjs"
  );
}

module.exports = { startYjsServer };
