interface IUserBaseLightModel {
    username: string;
}

interface IUserBaseModel extends IUserBaseLightModel {
    hash: string;
}

export type IUserCreateModel = IUserBaseModel;

export interface IUserLightModel extends IUserBaseLightModel {
    id: string;
}

export interface IUserModel extends IUserBaseModel {
    id: string;
}
