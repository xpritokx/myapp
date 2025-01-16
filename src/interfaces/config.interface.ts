export interface IConfig {
    mode: 'development' | 'production';
}

export interface IResponse {
    data: any;
    total: string;
}

export interface ISelectItem {
    value: any;
    viewValue: string;
}