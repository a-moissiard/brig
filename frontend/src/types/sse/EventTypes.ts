export interface IProgressEventData {
    serverId: string;
    name: string;
    type: string;
    bytes: number;
    progress?: number;
}

export interface ITransferCompletedEventData {
    serverId: string;
}

export enum EVENT_TYPE {
    PROGRESS = 'progress',
    TRANSFER_COMPLETED = 'transfer_completed',
}
