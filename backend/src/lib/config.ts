export interface IBrigConfig {
    express: {
        port: string;
    };
}

export const config: IBrigConfig = {
    express: {
        port: process.env.PORT || '8080',
    },
};