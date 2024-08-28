interface IBrigFrontConfig {
    apiUrl: string;
}

export const config: IBrigFrontConfig = {
    apiUrl: `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/`,
};
