import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export interface IBrigConfig {
    express: {
        port: string;
        authorizedOrigin: {
            host: string;
            port: string;
        };
    };
    mongo: IBrigMongoConfig;
    redis: IBrigRedisConfig;
    auth: IBrigAuthConfig;
}

export interface IBrigMongoConfig {
    connection: {
        username?: string;
        password?: string;
        authSource?: string;
        host: string;
        port: string;
    };
    dbName: string;
}

export interface IBrigRedisConfig {
    connection: {
        password?: string;
        host: string;
        port: number;
        db: number;
    };
}

export interface IBrigAuthConfig {
    openToUserRegistration: string;
    tokens: {
        accessToken: {
            signingSecret: string;
            validityPeriod: string;
        };
        refreshToken: {
            signingSecret: string;
            validityPeriod: string;
        };
    };
}

export const config: IBrigConfig = {
    express: {
        port: process.env.SERVER_PORT || '8080',
        authorizedOrigin: {
            host: process.env.AUTHORIZED_ORIGIN_HOST || '',
            port: process.env.AUTHORIZED_ORIGIN_PORT || '3000',
        },
    },
    mongo: {
        connection:{
            username: process.env.MONGO_USERNAME,
            password: process.env.MONGO_PASSWORD,
            authSource: process.env.MONGO_AUTH_SOURCE,
            host: process.env.MONGO_HOST || '',
            port: process.env.MONGO_PORT || '27017',
        },
        dbName: process.env.MONGO_DB_NAME || 'brig',
    },
    redis: {
        connection:{
            password: process.env.REDIS_PASSWORD,
            host: process.env.REDIS_HOST || '',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            db: parseInt(process.env.REDIS_DB_NUMBER || '0', 10),
        },
    },
    auth: {
        openToUserRegistration: process.env.OPEN_TO_USER_REGISTRATION || 'false',
        tokens: {
            accessToken: {
                signingSecret: process.env.ACCESS_TOKEN_SIGNING_SECRET || '',
                validityPeriod: '5m',
            },
            refreshToken: {
                signingSecret: process.env.REFRESH_TOKEN_SIGNING_SECRET || '',
                validityPeriod: '1h',
            },
        },
    },
};
