export interface IOrder {
    ID: number;
    OrderNum: number;
    Customer: number;
    BillingAddress: string;
    Address: string;
    Model: number;
    StairsNum: number;
    OrderDate: number;
    DeliveryDate: string;
    Height: number;
    Width: number;
    HeadroomMatters: number;
    quote?: boolean;
    ShipStatus?: string;
}

export interface IOrderSearchParams {
    search: string,
    searchField: string,
    dateFrom: string,
    dateTo: string,
    searchDateField: string
}

export interface IOrderCreate {
    
}