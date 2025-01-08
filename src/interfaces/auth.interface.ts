export interface IAuth {
    username: string;
    password: string;
}

export interface IAuthResponse {
    status: string;
    token: string;
}
