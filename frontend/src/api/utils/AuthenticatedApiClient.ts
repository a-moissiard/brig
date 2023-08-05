import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { AuthFacade } from '../../utils/auth/AuthFacade';
import { BrigFrontError, HTTP_STATUS_CODES_TO_ERROR_CODE } from '../../utils/error/BrigFrontError';
import { IAuthTokens } from '../auth';
import { config } from '../config';
import { IAxiosRequestOptions, IRequestOptions } from './ApiClientTypes';
import { parseAxiosError } from './ApiErrorUtils';

const getAxiosConfig = (options?: IAxiosRequestOptions): AxiosRequestConfig => ({
    headers: {
        Authorization: 'Bearer ' + AuthFacade.getToken(options?.tokenType || 'accessToken'),
    },
    signal: options?.signal,
});

export abstract class AuthenticatedApiClient {
    public static async get<T>(url: string, options?: IRequestOptions): Promise<T> {
        const response = await this.tryAuthenticatedRequest(() => axios.get<T>(url, getAxiosConfig(options)));
        return response.data;
    }

    private static async tryAuthenticatedRequest<T>(fn: () => Promise<AxiosResponse<T>>): Promise<AxiosResponse<T>> {
        try {
            return await fn();
        } catch (e) {
            if (e instanceof AxiosError) {
                const errorDetails = parseAxiosError(e);
                if (errorDetails.status === 401) {
                    AuthFacade.clearToken('accessToken');
                    await this.refreshTokens();
                    return await fn();
                }
                throw new BrigFrontError(HTTP_STATUS_CODES_TO_ERROR_CODE[errorDetails.status], errorDetails.message);
            }
            throw e;
        }
    }

    private static async refreshTokens(): Promise<void> {
        try {
            const response = await axios.get<IAuthTokens>(config.apiUrl + 'auth/refresh', getAxiosConfig({
                tokenType: 'refreshToken',
            }));
            const { accessToken, refreshToken } = response.data;
            AuthFacade.setToken('accessToken', accessToken);
            AuthFacade.setToken('refreshToken', refreshToken);
        } catch (e) {
            if (e instanceof AxiosError) {
                const errorDetails = parseAxiosError(e);
                if (errorDetails.status === 401) {
                    AuthFacade.clearToken('refreshToken');
                }
                throw new BrigFrontError(HTTP_STATUS_CODES_TO_ERROR_CODE[errorDetails.status], errorDetails.message);
            }
            throw e;
        }
    }
}
