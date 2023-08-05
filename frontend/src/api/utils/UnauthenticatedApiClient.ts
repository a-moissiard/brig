import axios, { AxiosError } from 'axios';

import { BrigFrontError, HTTP_STATUS_CODES_TO_ERROR_CODE } from '../../utils/error/BrigFrontError';
import { parseAxiosError } from './ApiErrorUtils';

export abstract class UnauthenticatedApiClient {
    public static async post<T, B>(url: string, body: B): Promise<T> {
        try {
            const response = await axios.post<T>(url, body);
            return response.data;
        } catch (e) {
            if (e instanceof AxiosError) {
                const errorDetails = parseAxiosError(e);
                throw new BrigFrontError(HTTP_STATUS_CODES_TO_ERROR_CODE[errorDetails.status], errorDetails.message);
            }
            throw e;
        }
    }
}
