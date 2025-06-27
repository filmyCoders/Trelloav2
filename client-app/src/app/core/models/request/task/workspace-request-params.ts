import { WORKSPACEROLE } from "../../enums/roles.enum";


export interface IAddWorkspace {
    boardName: string;
    workspaceImage: File|null ;

}

export interface IUpdateWorkspace {
    workSpaceId:string
    boardName: string;
    workspaceImage: File|null ;
    workspaceImagePath:string 
}



export interface IAddWorkSpaceMemberRequest {
    workSpaceId: string;
    userId: string;
    role: WORKSPACEROLE;
}

export interface IUpdateWorkSpaceMemberRequest {
    workSpaceId: string;
    boardMemberId: string;
    role: WORKSPACEROLE;
}
export interface IRemoveWorkSpaceMemberRequest {
    boardMemberId: string;
    userId: string;
}

export interface WorkSpaceMember {
    workSpaceId: string;
    Email:string
    role: WORKSPACEROLE;
}
