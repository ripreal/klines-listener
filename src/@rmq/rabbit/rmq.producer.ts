import { ChannelWrapper } from "amqp-connection-manager";
import { Pipeline } from "./Pipeline";
import { Logger, LoggerService } from "@nestjs/common";
import { PipelineConfig } from "../topology/interfaces";

export default class RMQProducer {
    private readonly pipeline: Pipeline;
    private readonly logger = new Logger(RMQProducer.name);

    constructor(private readonly id : string,
        private readonly channel : ChannelWrapper) {

        this.pipeline = new Pipeline(this.channel);
    }

    public async createTopology(pipeline: PipelineConfig) : Promise<void> {
        try {
            await this.pipeline.create(pipeline)
        } catch (ex) {
            this.logger.error(`instance:${this.id} ${ex}`)
        }
    }

    public async publishMessage(routingKey: string, body : string, pipeline: PipelineConfig) : Promise<boolean> {
        return this.channel.publish(
            pipeline.exchanges[0].name,
            routingKey, 
            Buffer.from(body)
        )
    }
}