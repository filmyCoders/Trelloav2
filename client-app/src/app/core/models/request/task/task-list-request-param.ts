
export interface IAddTaskListRequest {
    listName: string;
    workSpaceId: string;
    displayOrder: number;
}

export interface IUpdateTaskListRequest {
    listId:string;
    listName: string;
    workSpaceId: string;
    displayOrder: number;
}



export interface IUpdateTaskListOrderRequest {
    workSpaceId: string;
    taskListOrderUpdates:ITaskListOrderUpdate[]
}

export interface ITaskListOrderUpdate {
    listId:string;
    displayOrder: number;
}



