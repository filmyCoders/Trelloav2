import { environment } from "../../../environments/environment.development";

export const  CLIENT_URL = 'http://localhost:4200/'; // or dynamically generate this

export const VALIDATE_TOKEN: string = `${environment.baseApiUrl}Account/login`;

export const LOGIN_USER: string = `${environment.baseApiUrl}Account/login`;
export const LOGIN_WITH_GOOGLE: string = `${environment.baseApiUrl}Account/external-login`;

export const REGISTE_USER: string = `${environment.baseApiUrl}Account/register`;
export const FORGOT_PASSWORD_SENT_EMAIL: string = `${environment.baseApiUrl}Account/send-forgetpassword-email-link`;
export const FORGOT_PASSWORD_RESET: string = `${environment.baseApiUrl}Account/forgot-password`;
export const EMAIL_CONFIRMATION: string = `${environment.baseApiUrl}Account/confirm-email`;
export const EMAIL_EXIST_OR_NOT: string = `${environment.baseApiUrl}Account/email-check`;


//Users Crud
export const GET_CURRENT_LOGIN_USER: string = `${environment.baseApiUrl}User/get-current-user-details`;
export const update_PROFILE_USER: string = `${environment.baseApiUrl}User/update-profile-details`;
export const CHANGE_PASSWORD_USER: string = `${environment.baseApiUrl}User/change-password`;
export const CHANGE_EMAIL_USER: string = `${environment.baseApiUrl}User/change-email-confirmation-link`;
export const GET_USER_DETAILS_BY_EMAIL: string = `${environment.baseApiUrl}User/get-user-by-email`;
export const GET_USER_DETAILS_BY_EMAILS: string = `${environment.baseApiUrl}User/get-users-by-emails`;
export const GET_USER_DETAILS_BY_IDS: string = `${environment.baseApiUrl}User/get-users-by-ids`;


export const CHANGE_EMAIL_CONFIRM: string = `${environment.baseApiUrl}User/change-email`;
export const RESET_PASSWORD_SEND_OTP: string = `${environment.baseApiUrl}Account/reset-password-send-otp`;
export const RESET_PASSWORD_VALIDATE_OTP: string = `${environment.baseApiUrl}Account/reset-password`;

export const USER_LIST: string = `${environment.baseApiUrl}User/paged`;
// In your constants file
export const USER_PROFILE_IMAGE: string = `${environment.baseApiUrl}User/profile-image/`;
export const GET_IMAGE_FILE: string = `${environment.baseApiUrl}Asset/get-image`;




//Roles Api

export const ROLES_LIST: string = `${environment.baseApiUrl}Roles/paged`;
export const ROLE_ADD: string = `${environment.baseApiUrl}Roles/add`;
export const ROLE_UPDATE: string = `${environment.baseApiUrl}Roles/update`;
export const ROLE_DELETE: string = `${environment.baseApiUrl}Roles/delete-role`;
export const ROLE_GET: string = `${environment.baseApiUrl}Roles/get-role`;

//Event
export const EVENT_LIST: string = `${environment.baseApiUrl}Events/all-events`;
export const EVENT_UPDATE: string = `${environment.baseApiUrl}Events/update-event`;
export const EVENT_ADD: string = `${environment.baseApiUrl}Events/add-event`;
export const EVENT_DELETE: string = `${environment.baseApiUrl}Events/delete-event`;
export const EVENT_GET_BY_ID: string = `${environment.baseApiUrl}Events/get-event`;

//Workspace  (Task)
export const GET_WORKSPACE_BY_ID: string = `${environment.baseApiUrl}Workspace`;
export const GET_WORKSPACE_LIST: string = `${environment.baseApiUrl}Workspace/get-workspace-list`;
export const ADD_WORKSPACE: string = `${environment.baseApiUrl}Workspace/add-workspace`;
export const UPDATE_WORKSPACE: string = `${environment.baseApiUrl}Workspace/update-workspace`;

export const DELETE_WORKSPACE: string = `${environment.baseApiUrl}Workspace/delete-workspace`;

//Workspace Member
export const ADD_WORKSPACE_MEMBER: string = `${environment.baseApiUrl}Workspace/member/add`;
export const GET_WORKSPACE_MEMBERS_LIST : string = `${environment.baseApiUrl}Workspace/members`;
export const UPDATE_WORKSPACE_MEMBER: string = `${environment.baseApiUrl}Workspace/member/update`;
export const DELETE_WORKSPACE_MEMBER: string = `${environment.baseApiUrl}Workspace/member/remove`;


//Task List

export const ADD_TASK_LIST: string = `${environment.baseApiUrl}Tasklist/add-tasklist`;
export const GET_TASK_LIST : string = `${environment.baseApiUrl}Tasklist/get-tasklist`;
export const UPDATE_TASK_LIST: string = `${environment.baseApiUrl}Tasklist/update-tasklist`;
export const DELETE_TASKLIST: string = `${environment.baseApiUrl}Tasklist/delete-tasklist`;
export const GET_ALL_TASKLIST: string = `${environment.baseApiUrl}Tasklist/get-tasklists-by-workspace`;


//Task List Cards

export const ADD_TASK_CARD: string = `${environment.baseApiUrl}TaskCard/add-task-card`;
export const GET_TASK_CARD : string = `${environment.baseApiUrl}TaskCard/get-task-card`;
export const UPDATE_TASK_CARD: string = `${environment.baseApiUrl}TaskCard/update-task-card`;
export const DELETE_TASK_CARD: string = `${environment.baseApiUrl}TaskCard/delete-task-card`;
export const GET_ALL_TASK_CARD: string = `${environment.baseApiUrl}TaskCard/get-taskcard-by-tasklist-id`;


//Drag and drop Task list
export const UPDATE_ORDER_TASK_LIST: string = `${environment.baseApiUrl}Tasklist/update-order`;
export const UPDATE_ORDER_TASK_CARD: string = `${environment.baseApiUrl}TaskCard/update-order-cards`;
export const UPDATE_ORDER_TASK_CARD1: string = `${environment.baseApiUrl}Tasklist/update-order-a`;

