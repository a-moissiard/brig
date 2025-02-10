import { IUser } from '../../types/users/UsersTypes';
import { config } from '../config';
import { IRequestOptions } from '../utils/ApiClientTypes';
import { AuthenticatedApiClient } from '../utils/AuthenticatedApiClient';

export class UsersApi {
    private static usersApiUrl = config.apiUrl + 'users';

    public static async listUsers(options?: IRequestOptions): Promise<IUser[]> {
        return AuthenticatedApiClient.get<IUser[]>(this.usersApiUrl, options);
    }
}
