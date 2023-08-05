import { TokenType } from '../../utils/auth/AuthFacade';

export interface IRequestOptions {
    signal?: AbortSignal;
}

export interface IAxiosRequestOptions extends IRequestOptions{
    tokenType?: TokenType;
}

export interface IAxiosErrorDetails {
    status: number;
    message: string;
}
