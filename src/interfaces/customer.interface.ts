export interface ICustomer {
    ID: number;
    Name: string;
    Address?: string;
    Comments?: string;
}

export interface ICustomersSearchParams {
    search: string,
    searchField: string,
    dateFrom: string,
    dateTo: string,
    searchDateField: string
}