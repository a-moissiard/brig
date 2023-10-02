import { IFileInfo } from '../../types/ftp/FileInfoTypes';

export interface IFilesListingResponse {
    workingDir: string;
    list: IFileInfo[];
}
