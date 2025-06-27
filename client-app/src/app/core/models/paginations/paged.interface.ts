
export interface IPagedRequest<T> {

    pageIndex: number;
    pageSize: number;
    sortColumn: string | null;
    isAscending: boolean;
    searchQuery: string | null;
    requestData: T | null;
}
export interface IPaginatedList<T> {
    items: T[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}