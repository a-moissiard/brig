export interface IProgressEventData {
    serverId: string;
    path: string;
    type: string;
    bytes: number;
    progress?: number;
}

export enum EVENT_TYPE {
    KEEP_ALIVE = 'keep_alive',
    PROGRESS = 'progress',
    TRANSFER_COMPLETED = 'transfer_completed',
    TRANSFER_CANCELED = 'transfer_canceled',
}

export interface IEventHandlers {
    [EVENT_TYPE.PROGRESS]: (event: MessageEvent) => void;
    [EVENT_TYPE.TRANSFER_COMPLETED]: (event: MessageEvent) => void;
    [EVENT_TYPE.TRANSFER_CANCELED]: (event: MessageEvent) => void;
}
