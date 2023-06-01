import { BrigApplication } from './lib/bootstrap/BrigApplication';

async function main(): Promise<void> {
    return new BrigApplication().startApp();
}

void main();
