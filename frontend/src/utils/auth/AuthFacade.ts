import { AuthApi } from '../../api/auth';
import { IRequestOptions } from '../../api/utils/ApiClientTypes';

export type TokenType = 'accessToken' | 'refreshToken'

export class AuthFacade {
    public static setToken(tokenType: TokenType, token: string): void {
        localStorage.setItem(tokenType, token);
    }

    public static getToken(tokenType: TokenType): string | null {
        return localStorage.getItem(tokenType);
    }

    public static clearToken(tokenType: TokenType): void {
        localStorage.removeItem(tokenType);
    }

    public static async isLoggedIn(options?: IRequestOptions): Promise<boolean> {
        return AuthApi.isLoggedIn(options);
    }
}
