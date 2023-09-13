export enum BRIG_FRONT_ERROR_CODE {
    REQUEST_400 = 400,
    REQUEST_401 = 401,
    REQUEST_403 = 403,
    REQUEST_404 = 404,
    REQUEST_405 = 405,
    REQUEST_409 = 409,
    REQUEST_500 = 500,
    REQUEST_501 = 501,
}

export const HTTP_STATUS_CODES_TO_ERROR_CODE: {[K: number]: BRIG_FRONT_ERROR_CODE} = {
    400: BRIG_FRONT_ERROR_CODE.REQUEST_400,
    401: BRIG_FRONT_ERROR_CODE.REQUEST_401,
    403: BRIG_FRONT_ERROR_CODE.REQUEST_403,
    404: BRIG_FRONT_ERROR_CODE.REQUEST_404,
    405: BRIG_FRONT_ERROR_CODE.REQUEST_405,
    409: BRIG_FRONT_ERROR_CODE.REQUEST_409,
    500: BRIG_FRONT_ERROR_CODE.REQUEST_500,
    501: BRIG_FRONT_ERROR_CODE.REQUEST_501,
};

export class BrigFrontError extends Error{
    public readonly code: BRIG_FRONT_ERROR_CODE;

    constructor(code: BRIG_FRONT_ERROR_CODE, message: string) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
    }
}
