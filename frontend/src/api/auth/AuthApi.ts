import { AuthFacade } from '../../utils/auth/AuthFacade';
import { BRIG_FRONT_ERROR_CODE, BrigFrontError } from '../../utils/error/BrigFrontError';
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

    public static async isLoggedIn(options?: IRequestOptions): Promise<boolean> {
        try {
            await AuthenticatedApiClient.get(this.authApiUrl + 'isLoggedIn', options);
            return true;
        } catch (e) {
            if (e instanceof BrigFrontError && e.code === BRIG_FRONT_ERROR_CODE.REQUEST_401) {
                return false;
            }
            throw e;
        }
    };
}
