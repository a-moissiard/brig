export interface IProgressEventData {
    serverId: string;
    name: string;
    type: string;
    bytes: number;
    progress?: number;
}
