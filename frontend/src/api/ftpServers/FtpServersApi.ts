import { ApiClient } from '../ApiClient';
import { IFtpServer } from './FtpServersTypes';

const authApiUrl = ApiClient.apiUrl + 'servers/';

export const getFtpServers = async (): Promise<IFtpServer[]> => ApiClient.get<IFtpServer[]>(authApiUrl);
