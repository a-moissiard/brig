import { BRIG_ERROR_CODE, BrigError } from '../error';

export const assertThrowsWithError = async (fn: any, expectedErrorCode: BRIG_ERROR_CODE): Promise<void> => {
    let caughtError;
    try {
        await fn();
    } catch (err) {
        caughtError = err;
    } finally {
        if (!caughtError) {
            throw new Error('Function did not throw as expected');
        } else if (!(caughtError instanceof BrigError)) {
            throw new Error(`Function was expected to throw with instance of ${BrigError.name} but thrown with instance of ${typeof caughtError}`);
        } else if (caughtError.code !== expectedErrorCode) {
            throw new Error(`Function was expected to throw with error ${BRIG_ERROR_CODE[expectedErrorCode
            ]}(${expectedErrorCode}) but thrown with code ${BRIG_ERROR_CODE[caughtError.code]}(${caughtError.code})`);
        }
    }
};
