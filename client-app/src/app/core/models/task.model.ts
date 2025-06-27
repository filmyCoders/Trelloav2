import { WORKSPACEROLE } from "./enums/roles.enum";

export interface IWorkspace {
    workSpaceId: string;
    boardName: string;
    createdByUserId: string;
    workspaceImage: string ;
    createdAt: string;
    updatedAt: string | null;
    isDeleted: boolean;
}

export interface IWorkSpaceMember {
    boardMemberId: string;
    workSpaceId: string;
    email: string;
    userId: string | null;
    role: WORKSPACEROLE;
    invitedAt: string;
    isDeleted: boolean;
}

export interface ITaskList {
    listId: string;
    listName: string;
    workSpaceId: string;
    displayOrder: number;
    createdAt: string;
    updatedAt: string | null;
 cards: TaskCardResponseFoTasklist[];
}


export interface TaskCard {
    taskListId: string;

    taskCardId: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    taskImage: string | null;
    statusMessage: string | null;
    dueDate: string | null;
    coverImage: string | null;
    progress: number;
    createdBy: string;
   // assignees: TaskCardAssignee[];
    createdAt: string;
    updatedAt: string | null;
    completedAt: string | null;
    position:number
}
export enum TaskStatus {
    Pending,
    InProgress,
    Completed
}

export interface TaskCardResponseFoTasklist {
    taskCardId: string;
    title: string;
    coverImage: string | null;
    progress: number;
    createdAt: string;
    taskListId: string;

}