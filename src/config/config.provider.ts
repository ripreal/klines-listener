import * as Joi from '@hapi/joi';
import * as _ from 'lodash';
import { Config } from './config';
import { STORAGE_TYPES } from './interface';

export const configProvider = {

    provide: 'config.service',
    useFactory: async (): Promise<Config> => {
        
        const env = process.env;
        const validationSchema = Joi.object().unknown().keys({
            TYPE: Joi.string().required(),
            EXCHANGE: Joi.string().required(),
            DB_HOST: Joi.string().required(),
            DB_PORT: Joi.number().required(),
            DB_USERNAME: Joi.string().required(),
            DB_PASSWORD: Joi.any(),
            DB_DATABASE: Joi.string().required(),
            DB_SYNCHRONIZE: Joi.bool().required(),
            RABBIT_URI: Joi.string().required(),
            RABBIT_CONNECTION_POOL: Joi.number().required(),
            STORAGE_TYPE: Joi.string().valid(...Object.keys(STORAGE_TYPES)).required(),
            LOG_LEVEL: Joi.string().required(),
            TIMEFRAMES: Joi.string().required(),
        });

        const result = validationSchema.validate(env);

        if (result.error) {
            throw new Error('Configuration not valid: ' + result.error.message);
        }

        return {
            TYPE: `${env.TYPE}`,
            EXCHANGE: `${env.EXCHANGE}`,
            DB_HOST: `${env.DB_HOST}`,
            STORAGE_TYPE: STORAGE_TYPES[env.STORAGE_TYPE],
            DB_PORT: _.toNumber(env.DB_PORT),
            DB_USERNAME: `${env.DB_USERNAME}`,
            DB_PASSWORD: `${env.DB_PASSWORD}`,
            DB_DATABASE: `${env.DB_DATABASE}`,
            DB_SYNCHRONIZE: `${env.DB_SYNCHRONIZE}` == "true",
            RABBIT_URI: `${env.RABBIT_URI}`,
            RABBIT_CONNECTION_POOL: _.toNumber(env.RABBIT_CONNECTION_POOL),
            LOG_LEVEL: `${env.LOG_LEVEL}`,
            TIMEFRAMES: `${env.TIMEFRAMES}`,
        };
    }
};