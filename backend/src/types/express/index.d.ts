export {};

declare global {
    namespace Express {
        export interface User {
            id: string;
            username: string;
        }
    }
}
