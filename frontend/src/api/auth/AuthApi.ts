import { IUser } from '../../types/users/UsersTypes';
import { AuthFacade } from '../../utils/auth/AuthFacade';
import { config } from '../config';
import { IRequestOptions } from '../utils/ApiClientTypes';
import { AuthenticatedApiClient } from '../utils/AuthenticatedApiClient';
import { UnauthenticatedApiClient } from '../utils/UnauthenticatedApiClient';
import { IAuthTokens } from './AuthTokensTypes';

export class AuthApi {
    private static authApiUrl = config.apiUrl + 'auth/';

    public static async login(username: string, password: string): Promise<void> {
        const url = this.authApiUrl + 'login';
        const { accessToken, refreshToken } = await UnauthenticatedApiClient.post<IAuthTokens, {username: string; password: string}>(url, {
            username,
            password,
        });
        AuthFacade.setToken('accessToken', accessToken);
        AuthFacade.setToken('refreshToken', refreshToken);
    };

    public static async logout(): Promise<void> {
        const url = this.authApiUrl + 'logout';
        await AuthenticatedApiClient.post(url, null, {
            tokenType: 'refreshToken',
        });
        AuthFacade.clearToken('accessToken');
        AuthFacade.clearToken('refreshToken');
    }

    public static async getLoggedUser(options?: IRequestOptions): Promise<IUser> {
        return AuthenticatedApiClient.get(this.authApiUrl + 'getLoggedUser', options);
    };
}
