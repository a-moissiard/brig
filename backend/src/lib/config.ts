export interface IBrigConfig {
    express: {
        port: string;
    };
    mongo: IBrigMongoConfig;
    auth: IBrigAuthConfig;
}

export interface IBrigMongoConfig {
    connection: {
        user: string;
        pass: string;
        host: string;
        port: string;
    };
    dbName: string;
}

export interface IBrigAuthConfig {
    openToUserRegistration: string;
    jwt: {
        jwtSigningSecret: string;
        jwtValidityPeriod: string;

    };
}

export const config: IBrigConfig = {
    express: {
        port: process.env.PORT || '8080',
    },
    mongo: {
        connection:{
            user: process.env.MONGO_USER || '',
            pass: process.env.MONGO_PASS || '',
            host: process.env.MONGO_HOST || '',
            port: process.env.MONGO_PORT || '27017',
        },
        dbName: 'brig',
    },
    auth: {
        openToUserRegistration: process.env.OPEN_TO_USER_REGISTRATION || 'false',
        jwt: {
            jwtSigningSecret: process.env.JWT_SECRET || '',
            jwtValidityPeriod: '1h',
        },
    },
};
