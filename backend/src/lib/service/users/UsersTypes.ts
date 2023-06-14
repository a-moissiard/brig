interface IUserBaseLightModel {
    username: string;
}

interface IUserBaseModel extends IUserBaseLightModel {
    hash: string;
    salt: string;
}

export type IUserCreateModel = IUserBaseModel;
export type IUserUpdateModel = Partial<IUserBaseModel>;

export interface IUserLightModel extends IUserBaseLightModel {
    id: string;
}

export interface IUserModel extends IUserBaseModel {
    id: string;
}
