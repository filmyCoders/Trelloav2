import { TaskStatus } from "../../task.model";

export interface IAddTaskCardRequest {
    title: string;
    taskListId: string;
}

export interface IUpdateTaskCard {
    taskCardId: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    taskImage: string | null;
    statusMessage: string | null;
    dueDate: string | null;
    coverImage: string | null;
    progress: number;
   // assignees: TaskCardAssignee[];
    updatedAt: string | null;
    completedAt: string | null;
}


export interface IUpdateTaskOrderRequest {
    taskOrderUpdates: ITaskOrderUpdate[];
}

export interface ITaskOrderUpdate {
     title:string
     taskCardId: string;  // Immutable ID (cannot be changed)
    newTaskListId: string;
    newPosition: number;
}
