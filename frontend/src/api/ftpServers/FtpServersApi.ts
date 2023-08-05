import { config } from '../config';
import { AuthenticatedApiClient } from '../utils/AuthenticatedApiClient';
import { IFtpServer } from './FtpServersTypes';

export class FtpServersApi {
    private static authApiUrl = config.apiUrl + 'servers/';

    public static async getFtpServers(): Promise<IFtpServer[]> {
        return AuthenticatedApiClient.get<IFtpServer[]>(this.authApiUrl);
    }
}
