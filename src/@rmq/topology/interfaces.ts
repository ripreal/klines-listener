import { Options } from 'amqplib';

/** RMQ */

export interface PipelineConfig {
    queues: Queue[];
    exchanges: Exchange[];
    bindings: Binding[];
}

export interface Queue {
    name: string;
    options: Options.AssertQueue;
    condition: boolean
}

export interface Exchange {
    name: string;
    type: ExchangeTypes;
    options: Options.AssertExchange;
}

export interface Binding {
    type: Types;
    queue: string;
    exchange: string;
    routingKey: string;
    condition: boolean
}


export enum Types {
    QUEUE = 'queue',
    EXCHANGE = 'exchange',
}

export enum ExchangeTypes {
    TOPIC = 'topic',
    DIRECT = 'direct',
    HEADERS = 'headers',
    FANOUT = 'fanout',
}