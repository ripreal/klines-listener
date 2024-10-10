import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { RabbitConnect } from './rabbit/RabbitConnect';
import { ConfigService } from '@nestjs/config';
import RMQProducer from './rabbit/rmq.producer';
import { ChannelWrapper } from 'amqp-connection-manager';
import { PipelineConfig } from './topology/interfaces';

@Injectable()
export class RmqSendService {

    private readonly rmqConnections: Map<Number, RabbitConnect> = new Map <Number, RabbitConnect>()
    private producers : Map<string, RMQProducer> = new Map<string, RMQProducer>()
    private readonly log = new Logger(RmqSendService.name);

    constructor(
        private readonly configService: ConfigService) {

    }

    public async addToQueue(id: string, routingKey: string, body: Object, pipelineCfg: PipelineConfig) {
        //this.log.verbose(`id:${id} adding send message to rmq`)
        const producer = await this.getRMQProducer(id)
        return producer.publishMessage(routingKey, JSON.stringify(body), pipelineCfg)
    }

    private async getOrCreateRMQProducer(id: string, pipelineCfg: PipelineConfig, waitOnConnect: boolean = true) : Promise<RMQProducer> {
        return this.getRMQProducer(id) || this.createRMQProducer(id, pipelineCfg, waitOnConnect);
    }

    private getRMQProducer(id: string) : RMQProducer {
        return this.producers.get(id)
    }

    private async createChannel(chardNum: number, waitOnConnect: boolean = true) : Promise<ChannelWrapper> {
        const conn = await this.GetRabbitConnectionFromPool(chardNum)

        const channel = await conn.createChannel(`producer:${chardNum}`)

        const waitChannel = new Promise((res, rej) => {
            channel.on("connect", (...args: any[]) => {
                this.log.debug(`producer:${chardNum} RabbitMQ channel connected.`);
                res(args);
            });
            channel.on("close", (reason) => {
                this.log.warn(`producer:${chardNum} RabbitMQ channel closed. Reason: ${reason} `);
                rej(reason);
            });
            channel.on("error", (err) => {
                this.log.warn(`producer:${chardNum} RabbitMQ channel error: ${err}`);
                rej(err);
            })
        });

        if (waitOnConnect)
            await waitChannel;

        return channel;
    }

    public async createRMQProducer(id: string, pipelineCfg: PipelineConfig, waitOnConnect: boolean = true) : Promise<RMQProducer> {
        this.log.debug(`id:${id} Creating new rmq producer...`)

        const shardNum = this.producers.size // TODO: not working properly because of async
        const channel = await this.createChannel(shardNum, waitOnConnect);

        const producer = new RMQProducer(id, channel)
        this.log.debug(`id:${id} rmq producer was created successfully`)
        await producer.createTopology(pipelineCfg)
        this.log.debug(`id:${id} rmq topology was restored successfully`)
        this.producers.set(id, producer)
        return producer
    }

    public async initConnections() {
        const rabbitUri = this.configService.get('RABBIT_URI')
        const connectionPool = +this.configService.get('RABBIT_CONNECTION_POOL')
        const promises = []
        for (let i = 0; i < connectionPool; i++) {
            const rabbitConnect = new RabbitConnect()
            promises.push(rabbitConnect.connect(rabbitUri, `klines-listener-${this.configService.get('EXCHANGE')}-${this.configService.get('TYPE')}-${i + 1}-${connectionPool}`))
            this.rmqConnections.set(i, rabbitConnect);
            this.log.log(`Connection ${i +1} to RabbitMQ has been established.`);
        }
        await Promise.all(promises)
    }

    // Метод получает нового клиента для RabbitMQ из пула клиентов кратно номеру инстанса
    private async GetRabbitConnectionFromPool(chardNum: number) : Promise<RabbitConnect>
    {
        const rabbitUri = this.configService.get('RABBIT_URI')

        // Получаем делитель из конфига
        const connectionPool =  this.configService.get("RABBIT_CONNECTION_POOL")
        // Вычисляем индекс клиента в пуле
        const currentClientIndex = chardNum % connectionPool

        this.log.log(`chardNum: ${chardNum} getting connection from pool ${currentClientIndex}`)

        // Получаем клиента из пула
        let rabbitConnect = this.rmqConnections.get(currentClientIndex)

        /*
        if (!rabbitConnect) {
            // Создаем нового клиента к RabbitMQ, если не найден в пуле
            rabbitConnect = new RabbitConnect()
            await rabbitConnect.connect(rabbitUri, `klines-listener-${currentClientIndex}-${connectionPool}`);
            // Добавляем клиента в пул
            this.rmqConnections.set(currentClientIndex, rabbitConnect);
        }
        */

        return rabbitConnect
    }
    
}