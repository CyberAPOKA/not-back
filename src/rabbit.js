const amqp = require("amqplib");
const { setStatus } = require("./store");

const RABBIT_URL = "amqps://bjnuffmq:gj-YQIiEXyfxQxjsZtiYDKeXIT8ppUq7@jaragua-01.lmq.cloudamqp.com/bjnuffmq";

async function connectRabbit() {
    const conn = await amqp.connect(RABBIT_URL);
    const channel = await conn.createChannel();

    const inputQueue = "queue.notification.input.christiansteffens";
    const statusQueue = "queue.notification.status.christiansteffens";

    await channel.assertQueue(inputQueue, { durable: true });
    await channel.assertQueue(statusQueue, { durable: true });

    channel.consume(inputQueue, async (msg) => {
        if (!msg) return;
        const { messageId, messageContent } = JSON.parse(msg.content.toString());

        console.log("Received:", messageId, messageContent);
        setStatus(messageId, "PROCESSING");

        await new Promise(res => setTimeout(res, 1000 + Math.random() * 1000));

        const isError = Math.floor(Math.random() * 10) < 2;
        const status = isError ? "PROCESSING_FAILED" : "PROCESSED_SUCCESS";

        setStatus(messageId, status);

        channel.sendToQueue(statusQueue, Buffer.from(JSON.stringify({ messageId, status })), { persistent: true });

        channel.ack(msg);
    });

    return channel;
}

module.exports = { connectRabbit };
