export interface IBrigConfig {
    express: {
        port: string;
    };
    mongo: {
        user: string;
        pass: string;
        host: string;
        port: string;
    };
}

export const config: IBrigConfig = {
    express: {
        port: process.env.PORT || '8080',
    },
    mongo: {
        user: process.env.MONGO_USER || '',
        pass: process.env.MONGO_PASS || '',
        host: process.env.MONGO_HOST || '',
        port: process.env.MONGO_PORT || '27017',
    },
};