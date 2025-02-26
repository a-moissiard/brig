interface IBrigFrontConfig {
    apiUrl: string;
}

export const config: IBrigFrontConfig = {
    apiUrl: `${process.env.REACT_APP_SERVER_URL}/api/`,
};
