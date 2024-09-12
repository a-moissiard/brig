import EventSourcePolyfill from '@sanity/eventsource';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, CanceledError } from 'axios';
import _ from 'lodash';

import { IEventHandlers } from '../../types/sse/EventTypes';
import { AuthFacade } from '../../utils/auth/AuthFacade';
import { BRIG_FRONT_ERROR_CODE, BrigFrontError, HTTP_STATUS_CODES_TO_ERROR_CODE } from '../../utils/error/BrigFrontError';
import { IAuthTokens } from '../auth';
import { config } from '../config';
import { IAxiosRequestOptions } from './ApiClientTypes';
import { parseAxiosError } from './ApiErrorUtils';

const getAuthorizationHeader = (options?: IAxiosRequestOptions): { Authorization: string } => ({
    Authorization: 'Bearer ' + AuthFacade.getToken(options?.tokenType || 'accessToken'),
});

const getAxiosConfig = (options?: IAxiosRequestOptions): AxiosRequestConfig => ({
    headers: getAuthorizationHeader(options),
    signal: options?.signal,
});

export abstract class AuthenticatedApiClient {
    public static async get<T>(url: string, options?: IAxiosRequestOptions): Promise<T> {
        const response = await this.tryAuthenticatedRequest(() => axios.get<T>(url, getAxiosConfig(options)));
        return response.data;
    }

    public static async post<T, B>(url: string, body: B, options?: IAxiosRequestOptions): Promise<T> {
        const response = await this.tryAuthenticatedRequest(() => axios.post<T, AxiosResponse<T>, B>(url, body, getAxiosConfig(options)));
        return response.data;
    }

    public static async openSSE(url: string, handlers: IEventHandlers): Promise<void> {
        const sse = new EventSourcePolyfill(url, {
            headers: getAuthorizationHeader(),
        });
        _.forEach(handlers, (handler, eventKey) => {
            sse.addEventListener(eventKey, handler);
        });
    }

    private static async tryAuthenticatedRequest<T>(fn: () => Promise<T>, alreadyRefreshed = false): Promise<T> {
        try {
            return await fn();
        } catch (e) {
            if (e instanceof CanceledError) {
                throw new BrigFrontError(BRIG_FRONT_ERROR_CODE.REQUEST_CANCELLED, 'Request canceled');
            }
            if (e instanceof AxiosError) {
                const errorDetails = parseAxiosError(e);
                if (errorDetails.status === 401 && errorDetails.message === 'Unauthorized' && !alreadyRefreshed) {
                    AuthFacade.clearToken('accessToken');
                    await this.refreshTokens();
                    return await this.tryAuthenticatedRequest(fn, true);
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
                if (errorDetails.status === 401 && errorDetails.message === 'Unauthorized') {
                    AuthFacade.clearToken('refreshToken');
                }
                throw new BrigFrontError(HTTP_STATUS_CODES_TO_ERROR_CODE[errorDetails.status], errorDetails.message);
            }
            throw e;
        }
    }
}
