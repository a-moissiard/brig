import { IFtpServer } from '../../types/ftpServers/FtpServersTypes';
import { config } from '../config';
import { IRequestOptions } from '../utils/ApiClientTypes';
import { AuthenticatedApiClient } from '../utils/AuthenticatedApiClient';

export class FtpServersApi {
    private static serversApiUrl = config.apiUrl + 'servers/';

    public static async getFtpServers(options?: IRequestOptions): Promise<IFtpServer[]> {
        return AuthenticatedApiClient.get<IFtpServer[]>(this.serversApiUrl, options);
    }
}
