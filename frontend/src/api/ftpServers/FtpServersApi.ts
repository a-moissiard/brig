import { IFtpServer, IFtpServerBase, IFtpServerSlotsModel, IServerSlot, ITransferActivity } from '../../types/ftp';
import { IEventHandlers } from '../../types/sse/EventTypes';
import { config } from '../config';
import { IRequestOptions } from '../utils/ApiClientTypes';
import { AuthenticatedApiClient } from '../utils/AuthenticatedApiClient';
import { IFilesListingResponse } from './FtpServersActionsTypes';

export class FtpServersApi {
    private static serversApiUrl = config.apiUrl + 'servers';

    public static async getFtpServers(options?: IRequestOptions): Promise<IFtpServer[]> {
        return AuthenticatedApiClient.get<IFtpServer[]>(this.serversApiUrl, options);
    }

    public static async createFtpServer(server: IFtpServerBase, options?: IRequestOptions): Promise<IFtpServer> {
        return AuthenticatedApiClient.post<IFtpServer, IFtpServerBase>(this.serversApiUrl, server, options);
    }

    public static async updateFtpServer(serverId: string, server: IFtpServerBase, options?: IRequestOptions): Promise<IFtpServer> {
        const url = `${this.serversApiUrl}/${serverId}`;
        return AuthenticatedApiClient.put<IFtpServer, IFtpServerBase>(url, server, options);
    }

    public static async deleteFtpServer(serverId: string, options?: IRequestOptions): Promise<void> {
        const url = `${this.serversApiUrl}/${serverId}`;
        return AuthenticatedApiClient.delete(url, options);
    }

    public static async getUserConnectedServers(options?: IRequestOptions): Promise<IFtpServerSlotsModel> {
        const url = `${this.serversApiUrl}/connected`;
        return AuthenticatedApiClient.get<IFtpServerSlotsModel>(url, options);
    }

    public static async getTransferActivity(options?: IRequestOptions): Promise<ITransferActivity | null> {
        const url = `${this.serversApiUrl}/activity`;
        return AuthenticatedApiClient.get<ITransferActivity | null>(url, options);
    }

    public static async clearTransferActivity(options?: IRequestOptions): Promise<void> {
        const url = `${this.serversApiUrl}/clearActivity`;
        return AuthenticatedApiClient.post(url, options);
    }

    public static async trackActivity(handlers: IEventHandlers): Promise<void> {
        const url = `${this.serversApiUrl}/trackActivity`;
        await AuthenticatedApiClient.openSSE(url, handlers);
    }
    
    // Actions
    public static async connect(serverId: string, slot: IServerSlot, password: string, options?: IRequestOptions): Promise<IFilesListingResponse> {
        const url = `${this.serversApiUrl}/${serverId}/actions/connect`;
        return AuthenticatedApiClient.post<IFilesListingResponse, { slot: IServerSlot; password: string }>(url, { slot, password }, options);
    }

    public static async disconnect(serverId: string, options?: IRequestOptions): Promise<void> {
        const url = `${this.serversApiUrl}/${serverId}/actions/disconnect`;
        return AuthenticatedApiClient.post(url, null, options);
    }

    public static async list(serverId: string, path?: string, options?: IRequestOptions): Promise<IFilesListingResponse> {
        const url = `${this.serversApiUrl}/${serverId}/actions/list`;
        return AuthenticatedApiClient.post(url, { path }, options);
    }

    public static async createDir(serverId: string, path?: string, options?: IRequestOptions): Promise<IFilesListingResponse> {
        const url = `${this.serversApiUrl}/${serverId}/actions/createDir`;
        return AuthenticatedApiClient.post(url, { path }, options);
    }

    public static async delete(serverId: string, path?: string, options?: IRequestOptions): Promise<IFilesListingResponse> {
        const url = `${this.serversApiUrl}/${serverId}/actions/delete`;
        return AuthenticatedApiClient.post(url, { path }, options);
    }

    public static async transfer(sourceServerId: string, path: string, destinationServerId: string, options?: IRequestOptions): Promise<void> {
        const url = `${this.serversApiUrl}/${sourceServerId}/actions/transfer/${destinationServerId}`;
        await AuthenticatedApiClient.post(url, { path }, options);
    }

    public static async cancelTransfer(sourceServerId: string, options?: IRequestOptions): Promise<void> {
        const url = `${this.serversApiUrl}/${sourceServerId}/actions/cancelTransfer`;
        await AuthenticatedApiClient.post(url, null, options);
    }
}
