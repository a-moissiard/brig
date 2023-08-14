interface IUserBaseModel {
    username: string;
    admin: boolean;
}

interface IUserBaseWithHashModel extends IUserBaseModel {
    hash: string;
}

export type IUserCreateModel = IUserBaseWithHashModel;

export interface IUserModel extends IUserBaseModel {
    id: string;
}

export type IUserWithHashModel = IUserBaseWithHashModel & IUserModel;
