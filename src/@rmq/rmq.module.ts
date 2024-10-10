import { Module } from '@nestjs/common';
import { RmqSendService } from './rmq.send.service';
@Module({
  providers: [
    RmqSendService,
  ],
  exports: [RmqSendService],
})
export class RMQModule {}
