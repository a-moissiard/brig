import * as ftp from 'basic-ftp';
import { PassThrough } from 'stream';

interface IBrigServiceDependencies {}

export class BrigService {

    constructor(deps: IBrigServiceDependencies) {}

    public async poc(): Promise<void> {

        const ftpClient1 = new ftp.Client();
        const ftpClient2 = new ftp.Client();
                
        try {            
            await ftpClient1.access({
                host: 'host1',
                port: 21,
                secure: true,
                secureOptions: {
                    rejectUnauthorized: false,
                },
            });
            
            await ftpClient2.access({
                host: 'host2',
                port: 21,
                secure: true,
                secureOptions: {
                    rejectUnauthorized: false,
                },
            });

            const ptStream = new PassThrough();

            await ftpClient1.downloadTo(ptStream, 'file.txt');

            await ftpClient2.uploadFrom(ptStream, 'file.txt');

        } catch (e) {
            console.log(e, e);
        }

    }
}