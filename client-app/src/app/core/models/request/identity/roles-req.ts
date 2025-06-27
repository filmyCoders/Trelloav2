export interface IAddRolesRequest {
    name: string;
}

export interface AssignRoleRequestModel {
    userId: string;
    roleName: string;
}

export interface AssignMultipleRolesRequestModel {
    userId: string;
    roles: string[];
}

export interface RemoveRoleRequestModel {
    userId: string;
    roleName: string;
}

export interface UpdateUserRoleRequestModel {
    roleId: string;
    userId: string;
}

export interface IUpdateRoleRequest {
    roleId: string;
    newRoleName: string;
}