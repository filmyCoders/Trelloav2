
export interface ResponseBase<T> {
    map(arg0: (event: any) => any): unknown;
    flag: boolean;
    message: string;
    responseCode:number;
    data: T;
}
