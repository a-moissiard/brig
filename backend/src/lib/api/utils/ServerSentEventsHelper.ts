import { Response } from 'express';

export enum EVENT_TYPE {
    PROGRESS = 'progress',
    TRANSFER_COMPLETED = 'transfer_completed',
}

export type SendEventCallback = (eventType: EVENT_TYPE, data: Object) => void;

export class ServerSentEventsHelper {
    private static counter = 0;

    public static sendEventFactory(res: Response): SendEventCallback {
        return (eventType: EVENT_TYPE, data: Object): void => {
            res.write(`id:${this.counter++}\nevent:${eventType}\ndata:${JSON.stringify(data)}\n\n`);
        };
    }
}
