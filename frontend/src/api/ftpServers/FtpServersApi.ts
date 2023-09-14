import { IFtpServer } from '../../types/ftpServers/FtpServersTypes';
import { config } from '../config';
import { IRequestOptions } from '../utils/ApiClientTypes';
import { AuthenticatedApiClient } from '../utils/AuthenticatedApiClient';
import { IFilesListingResponse } from './FtpServersActionsTypes';

export class FtpServersApi {
    private static serversApiUrl = config.apiUrl + 'servers/';

    public static async getFtpServers(options?: IRequestOptions): Promise<IFtpServer[]> {
        return AuthenticatedApiClient.get<IFtpServer[]>(this.serversApiUrl, options);
    }

    // Actions
    public static async connect(serverId: string, password: string, options?: IRequestOptions): Promise<IFilesListingResponse> {
        const url = this.serversApiUrl + serverId + '/actions/connect';
        return AuthenticatedApiClient.post<IFilesListingResponse, { password: string }>(url, { password }, options);
    }

    public static async disconnect(serverId: string, options?: IRequestOptions): Promise<void> {
        const url = this.serversApiUrl + serverId + '/actions/disconnect';
        return AuthenticatedApiClient.post(url, null, options);
    }
}
