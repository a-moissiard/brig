export enum TRANSFER_STATUS {
    IN_PROGRESS = 'Transfer in progress',
    COMPLETED = 'Transfer completed',
    CANCELED = 'Transfer canceled',
}

export interface ICurrentTransferActivity {
    sourceFilePath: string;
    destinationFilePath: string;
    fileBytes: number;
    fileProgress?: number;
}

export interface ITransferActivity {
    originServerNumber: 1 | 2;
    originServerId: string;
    transferTargetName: string;
    transferMappingRemaining: Record<string, string>;
    transferMappingSuccessful: Record<string, string>;
    currentTransfer?: ICurrentTransferActivity;
    status: TRANSFER_STATUS;
    refreshNeeded: boolean;
}
