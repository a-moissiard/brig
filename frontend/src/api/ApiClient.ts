import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

import { BrigFrontError, HTTP_STATUS_CODES_TO_ERROR_CODE } from '../utils/error/BrigFrontError';

const getAxiosConfig = (): AxiosRequestConfig => ({
    headers: {
        Authorization: 'Bearer ' + Cookies.get('jwt'),
    },
});

export abstract class ApiClient {
    public static apiUrl = 'http://localhost:8080/api/';

    public static async get<T>(url: string): Promise<T> {
        try {
            const response = await axios.get<T>(url, getAxiosConfig());
            return response.data;
        } catch (e) {
            if (e instanceof AxiosError && e.response?.data?.error) {
                throw new BrigFrontError(HTTP_STATUS_CODES_TO_ERROR_CODE[e.response.status], e.response.data.error);
            }
            throw e;
        }
    }

    // Used for login
    public static async unauthenticatedPost<T, B>(url: string, body: B): Promise<T> {
        try {
            const response = await axios.post<T>(url, body, { withCredentials: true });
            return response.data;
        } catch (e) {
            if (e instanceof AxiosError && e.response?.data?.error) {
                throw new BrigFrontError(HTTP_STATUS_CODES_TO_ERROR_CODE[e.response.status], e.response.data.error);
            }
            throw e;
        }
    }
}
