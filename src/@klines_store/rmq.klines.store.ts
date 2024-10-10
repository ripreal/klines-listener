import { Injectable, Logger } from '@nestjs/common';
import { SocketKlineDTO } from 'src/klines/dto/socket.kline.dto';
import { RmqSendService } from '../@rmq/rmq.send.service';
import { PipelineConfigKline } from '../@rmq/topology';
import { ConfigService } from '@nestjs/config';
import TimeFrameEnum from 'src/klines/entities/timeframe.enum';

@Injectable()
export class RMQKlinesStore {
    private readonly pipe = PipelineConfigKline()
    constructor(private readonly rmqSendService: RmqSendService, private readonly configService: ConfigService) {
        
    }

    public async onModuleInit() {
        await this.rmqSendService.initConnections()
        await this.initProducers()
    }

    private async initProducers(): Promise<any[]> {
        const stringTimeframes = this.configService.get('TIMEFRAMES')
        let timeframes = stringTimeframes.split(',').map((t) => t.trim());
        
        const promises = []
        for (let timeframe of timeframes) {
            promises.push(this.rmqSendService.createRMQProducer(this.getProducerId(timeframe),  this.pipe))
        }
        return Promise.all(promises)
    }

    async pushKline(data: SocketKlineDTO) {
        delete (data as any).openTimeDebug
        await this.rmqSendService.addToQueue(
            this.getProducerId(data.timeframe), // id
            `${data.exchange.toUpperCase()}.${this.configService.get("TYPE").toUpperCase()}.${data.symbol.toUpperCase()}.${data.timeframe}`, // routing key
            data, 
            this.pipe
        )
    }

    private getProducerId(timeframe: TimeFrameEnum) {
        return `${this.configService.get("EXCHANGE").toUpperCase()}.${this.configService.get("TYPE").toUpperCase()}.${timeframe}`
    }
  
}
