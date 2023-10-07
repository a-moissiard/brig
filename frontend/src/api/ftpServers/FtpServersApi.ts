import { EventSourceMessage } from '@microsoft/fetch-event-source';

import { IFtpServer, IFtpServerConnectionStateModel } from '../../types/ftp/FtpServersTypes';
import { config } from '../config';
import { IRequestOptions } from '../utils/ApiClientTypes';
import { AuthenticatedApiClient } from '../utils/AuthenticatedApiClient';
import { IFilesListingResponse } from './FtpServersActionsTypes';

export class FtpServersApi {
    private static serversApiUrl = config.apiUrl + 'servers/';

    public static async getFtpServers(options?: IRequestOptions): Promise<IFtpServer[]> {
        return AuthenticatedApiClient.get<IFtpServer[]>(this.serversApiUrl, options);
    }

    public static async getUserConnectedServers(options?: IRequestOptions): Promise<IFtpServerConnectionStateModel[]> {
        const url = this.serversApiUrl + 'connected';
        return AuthenticatedApiClient.get<IFtpServerConnectionStateModel[]>(url, options);
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

    public static async list(serverId: string, path?: string, options?: IRequestOptions): Promise<IFilesListingResponse> {
        const url = this.serversApiUrl + serverId + '/actions/list';
        return AuthenticatedApiClient.post(url, { path }, options);
    }

    public static async createDir(serverId: string, path?: string, options?: IRequestOptions): Promise<IFilesListingResponse> {
        const url = this.serversApiUrl + serverId + '/actions/createDir';
        return AuthenticatedApiClient.post(url, { path }, options);
    }

    public static async delete(serverId: string, path?: string, options?: IRequestOptions): Promise<IFilesListingResponse> {
        const url = this.serversApiUrl + serverId + '/actions/delete';
        return AuthenticatedApiClient.post(url, { path }, options);
    }

    public static async transfer(sourceServerId: string, path: string, destinationServerId: string, options?: IRequestOptions): Promise<Record<string, string>> {
        const url = this.serversApiUrl + sourceServerId + '/actions/transfer/' + destinationServerId;
        return AuthenticatedApiClient.post(url, { path }, options);
    }

    public static async cancelTransfer(sourceServerId: string, options?: IRequestOptions): Promise<void> {
        const url = this.serversApiUrl + sourceServerId + '/actions/cancelTransfer';
        await AuthenticatedApiClient.post(url, null, options);
    }

    public static async trackProgress(onMessage: (event: EventSourceMessage) => void): Promise<void> {
        const url = this.serversApiUrl + 'trackProgress';
        await AuthenticatedApiClient.openSSE(url, 'POST', onMessage);
    }
}
