import { IFileInfo } from '../../types/ftpServers/FileInfoTypes';

export interface IFilesListingResponse {
    workingDir: string;
    list: IFileInfo[];
}
