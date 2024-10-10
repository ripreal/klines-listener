import { ExchangeTypes, PipelineConfig, Types } from './interfaces';
import { Options } from 'amqplib';

export const PipelineConfigKline = () => {
    return {
        exchanges: [
            {
                name: 'klines-data',
                type: ExchangeTypes.TOPIC,
                options : {
                    durable: false
                } as Options.AssertExchange
            },
        ],
        queues: [
        ],
        bindings: [
        ],
    } as PipelineConfig
};