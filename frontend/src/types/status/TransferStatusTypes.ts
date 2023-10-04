export enum TRANSFER_STATUS {
    IN_PROGRESS = 'Transfer in progress',
    COMPLETED = 'Transfer completed',
    CANCELED = 'Transfer canceled',
}

export interface ITransferActivity {
    originServer: 1 | 2;
    serverId: string;
    currentFileName: string;
    currentFileBytes?: number;
    currentFileProgress?: number;
    status: TRANSFER_STATUS;
}
