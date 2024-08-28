import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import { BrigApplication } from './lib/bootstrap/BrigApplication';

async function main(): Promise<void> {
    return new BrigApplication().startApp();
}

void main();
