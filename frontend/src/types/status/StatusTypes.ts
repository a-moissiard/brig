export enum CONNECTION_STATUS {
    CONNECTED = 'Connected',
    CONNECTING = 'Connecting',
    DISCONNECTED = 'Disconnected',
}

export interface IServerConnection {
    id: string;
    status: CONNECTION_STATUS;
}
