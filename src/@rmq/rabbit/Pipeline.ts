
import { ConfirmChannel } from 'amqplib';
import ChannelWrapper from 'amqp-connection-manager/dist/esm/ChannelWrapper';
import { PipelineConfig, Types } from '../topology/interfaces';

export class Pipeline  {

    private channel : ChannelWrapper

    constructor(channel: ChannelWrapper) {
        this.channel = channel;
    }

    public async create(pipeline: PipelineConfig) {
        return this.channel.addSetup(async (channel : ConfirmChannel) => {
            // QUEUES
            const createQueues = pipeline.queues
                .filter(queue => queue.condition)
                .map(_queue =>
                    channel.assertQueue(_queue.name, _queue.options),
            ) as PromiseLike<any>[];
            // EXCHANGES
            const createExchanges = pipeline.exchanges.map(exchange =>
                channel.assertExchange(exchange.name, exchange.type, exchange.options),
            ) as PromiseLike<any>[];

            await Promise.all([...createQueues, ...createExchanges]);
            // BINDINGS
            const createBindings = pipeline.bindings
                .filter(binding => binding.condition)
                .map(binding => {
                    if (binding.type === Types.QUEUE) {
                        return channel.bindQueue(
                            binding.queue, 
                            binding.exchange, 
                            binding.routingKey,
                        );
                    }
                    return channel.bindExchange(binding.queue, binding.exchange, binding.routingKey);
            });

            await Promise.all(createBindings);
        })
    }
}
