const { publishMessage } = require('./rabbitService');

describe('publishMessage', () => {
    it('should publish message to the queue with correct arguments', async () => {
        const mockChannel = {
            assertQueue: jest.fn().mockResolvedValue(true),
            sendToQueue: jest.fn().mockReturnValue(true),
        };

        const queue = 'queue.notification.input.christiansteffens';
        const message = { messageId: '123', messageContent: 'ChrisTeste' };

        await publishMessage(mockChannel, queue, message);

        expect(mockChannel.assertQueue).toHaveBeenCalledWith(queue, { durable: true });
        expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
            queue,
            Buffer.from(JSON.stringify(message))
        );
    });
});
