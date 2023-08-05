import { AxiosError } from 'axios';

import { IAxiosErrorDetails } from './ApiClientTypes';

export const parseAxiosError = (e: AxiosError): IAxiosErrorDetails => {
    let status: number;
    let message: string | undefined = undefined;
    if (e.response) {
        status = e.response.status;
        switch (typeof e.response.data) {
            case 'string':
                message = e.response.data;
                break;
            case 'object':
                if (typeof (e.response.data as any).error === 'string') {
                    message = (e.response.data as any).error;
                }
                break;
            default:
                break;
        }
        if (!message) {
            message = e.response.statusText;
        }
        return {
            status,
            message,
        };
    }
    throw e;
};
