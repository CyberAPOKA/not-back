const express = require("express");
const cors = require("cors");
const amqp = require("amqplib");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

const statusMap = new Map();

let channel;
async function connectRabbit() {
    const connection = await amqp.connect("amqps://bjnuffmq:gj-YQIiEXyfxQxjsZtiYDKeXIT8ppUq7@jaragua-01.lmq.cloudamqp.com/bjnuffmq");
    channel = await connection.createChannel();

    const inputQueue = "queue.notification.input.christiansteffens";
    const statusQueue = "queue.notification.status.christiansteffens";

    await channel.assertQueue(inputQueue, { durable: true });
    await channel.assertQueue(statusQueue, { durable: true });

    channel.consume(inputQueue, async (msg) => {
        const { messageId, messageContent } = JSON.parse(msg.content.toString());

        await new Promise((res) =>
            setTimeout(res, 1000 + Math.random() * 1000)
        );

        const random = Math.floor(Math.random() * 10) + 1;
        const status = random <= 2 ? "PROCESSING_FAILED" : "PROCESSED_SUCCESS";

        statusMap.set(messageId, status);

        channel.sendToQueue(
            statusQueue,
            Buffer.from(JSON.stringify({ messageId, status }))
        );

        io.emit("statusUpdate", { messageId, status });
    });
}

app.post("/api/notify", async (req, res) => {
    const { messageId, messageContent } = req.body;
    if (!messageContent) {
        return res.status(400).json({ error: "Message content required" });
    }

    statusMap.set(messageId, "PENDING");

    const inputQueue = "queue.notification.input.christiansteffens";
    channel.sendToQueue(
        inputQueue,
        Buffer.from(JSON.stringify({ messageId, messageContent }))
    );

    res.status(202).json({ messageId, status: "PENDING" });
});

app.get("/api/status/:id", (req, res) => {
    const status = statusMap.get(req.params.id) || "PENDING";
    res.json({ status });
});

server.listen(3000, async () => {
    console.log("Server running on http://localhost:3000");
    await connectRabbit();
});
