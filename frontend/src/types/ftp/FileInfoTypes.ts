export enum FileType {
    Unknown = 0,
    File = 1,
    Directory = 2,
    SymbolicLink = 3,
}

export interface IFileInfo {
    name: string;
    type: FileType;
    size: number;
}
