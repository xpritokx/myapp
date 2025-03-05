export interface IModels {
    ID: number;
    Name: string;
}

export interface IModelsSearchParams {
    search: string,
    searchField: string,
    dateFrom: string,
    dateTo: string,
    searchDateField: string
}