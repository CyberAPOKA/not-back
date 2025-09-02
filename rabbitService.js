async function publishMessage(channel, queue, message) {
  await channel.assertQueue(queue, { durable: true });
  return channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
}

module.exports = { publishMessage };
