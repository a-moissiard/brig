import { ApiClient } from '../ApiClient';

const authApiUrl = ApiClient.apiUrl + 'auth/';

export const sendLoginRequest = async (username: string, password: string): Promise<void> => {
    await ApiClient.unauthenticatedPost<void, {username: string; password: string}>(authApiUrl + 'login', {
        username,
        password,
    });
};
