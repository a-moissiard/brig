export enum TRANSFER_STATUS {
    IN_PROGRESS = 'Transfer in progress',
    COMPLETED = 'Transfer completed',
    CANCELED = 'Transfer canceled',
}

export interface ITransferCurrentFileProgress {
    fileBytes: number;
    fileProgress?: number;
}

export interface ITransferActivity {
    sourceServerId: string;
    target: string;
    pending: Record<string, string>;
    current: Record<string, string>;
    success: Record<string, string>;
    failed: Record<string, string>;
    currentProgress?: ITransferCurrentFileProgress;
    status: TRANSFER_STATUS;
    refreshNeeded: boolean;
}
