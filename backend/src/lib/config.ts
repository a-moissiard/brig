import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export interface IBrigConfig {
    express: {
        host: string;
        port: string;
    };
    mongo: IBrigMongoConfig;
    auth: IBrigAuthConfig;
}

export interface IBrigMongoConfig {
    connection: {
        user?: string;
        pass?: string;
        authSource?: string;
        host: string;
        port: string;
    };
    dbName: string;
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
        host: process.env.SERVER_HOST || '',
        port: process.env.SERVER_PORT || '8080',
    },
    mongo: {
        connection:{
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PASS,
            authSource: process.env.MONGO_AUTH_SOURCE,
            host: process.env.MONGO_HOST || '',
            port: process.env.MONGO_PORT || '27017',
        },
        dbName: process.env.MONGO_DB_NAME || 'brig',
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
