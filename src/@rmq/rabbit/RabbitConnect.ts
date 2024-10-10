import { Logger } from '@nestjs/common';
import  { connect, AmqpConnectionManager, ChannelWrapper } from  'amqp-connection-manager'

export class RabbitConnect {

    private _connection: AmqpConnectionManager;
    private readonly log = new Logger(RabbitConnect.name);
 
    public async connect(connectionString: string, name: string) {
        this._connection = await connect(connectionString, {connectionOptions: {clientProperties: {connection_name: name}}});

        this._connection.on('connect', () => {
            this.log.debug('[RabbitMQ] Connected');
        });
        
        this._connection.on('disconnect', (params) => {
            this.log.debug('[RabbitMQ] Disconnected.', params.err.stack);
        });
    }

    public async disconnect() {
        return this._connection.close();
    }
    
    public async createChannel(name: string) : Promise<ChannelWrapper> {
        return this._connection.createChannel({name});
    }

    public isConnected() : boolean {
        return this._connection.isConnected();
    }
}
