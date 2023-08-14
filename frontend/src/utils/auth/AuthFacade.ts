import { AuthApi } from '../../api/auth';
import { IRequestOptions } from '../../api/utils/ApiClientTypes';
import { IUser } from '../../types/users/UsersTypes';

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

    public static async getLoggedUser(options?: IRequestOptions): Promise<IUser> {
        return AuthApi.getLoggedUser(options);
    }
}
