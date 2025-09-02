const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const { connectRabbit } = require("./rabbit");
const { setStatus, getStatus } = require("./store");

const app = express();
app.use(cors());
app.use(express.json());

let channel;

app.post("/api/notify", async (req, res) => {
  const { messageContent, messageId } = req.body;

  if (!messageContent || messageContent.trim() === "") {
    return res.status(400).json({ error: "messageContent is required" });
  }

  const id = messageId || uuidv4();
  setStatus(id, "PENDING");

  channel.sendToQueue("queue.notification.input.christiansteffens",
    Buffer.from(JSON.stringify({ messageId: id, messageContent })),
    { persistent: true }
  );

  res.status(202).json({ messageId: id, status: "PENDING" });
});

app.get("/api/notify/status/:id", (req, res) => {
  const status = getStatus(req.params.id);
  res.json({ messageId: req.params.id, status });
});

async function start() {
  channel = await connectRabbit();
  app.listen(3000, () => console.log("🚀 Backend running at http://localhost:3000"));
}
start();
