import { Response } from 'express';

export const sendEventFactory = (res: Response) => (data: Object): void => {
    res.write(`data:${JSON.stringify(data)}\n\n`);
};
