import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ADD_TASK_LIST, ADD_WORKSPACE,
  ADD_WORKSPACE_MEMBER, DELETE_WORKSPACE,
  DELETE_WORKSPACE_MEMBER, GET_ALL_TASKLIST,
  GET_WORKSPACE_LIST, GET_WORKSPACE_MEMBERS_LIST,
  IAddTaskListRequest, IAddWorkSpaceMemberRequest,
  IAddWorkspace, IRemoveWorkSpaceMemberRequest,
  IUpdateTaskListRequest, IUpdateWorkSpaceMemberRequest,
  IUpdateWorkspace, IWorkSpaceMember, ResponseBase, ITaskList, UPDATE_WORKSPACE,
  UPDATE_WORKSPACE_MEMBER,
  IWorkspace,
  DELETE_TASKLIST,
  GET_WORKSPACE_BY_ID,
  TaskCard,
  ADD_TASK_CARD,
  GET_TASK_CARD,
  UPDATE_TASK_LIST,
  UPDATE_TASK_CARD,
  DELETE_TASK_CARD,
  IAddTaskCardRequest,
  IUpdateTaskListOrderRequest,
  UPDATE_ORDER_TASK_LIST,
  IUpdateTaskOrderRequest,
  UPDATE_ORDER_TASK_CARD,
  
  UPDATE_ORDER_TASK_CARD1
} from '../..';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private _httpClient: HttpClient) { }
  //----------------------Workpace -------------------------------------------------


  //#region Workspace Crud
  getWorkspaceById(id: string): Observable<ResponseBase<IWorkspace>> {
    const url = `${GET_WORKSPACE_BY_ID}/${id}`;

    return this._httpClient.get<ResponseBase<IWorkspace>>(url); // You can pass params here if needed
  }


  getWorkspaceList(): Observable<ResponseBase<IWorkspace[]>> {
    debugger
    return this._httpClient.get<ResponseBase<IWorkspace[]>>(GET_WORKSPACE_LIST);
  }
  createWorkspace(request: IAddWorkspace): Observable<ResponseBase<boolean>> {
    const formData = new FormData();
    formData.append('boardName', request.boardName);

    if (request.workspaceImage) {
      formData.append('workspaceImage', request.workspaceImage);
    }

    return this._httpClient.post<ResponseBase<boolean>>(ADD_WORKSPACE, formData);
  }
  updateWorkspace(request: IUpdateWorkspace): Observable<ResponseBase<boolean>> {
    const formData = new FormData();
    formData.append('boardName', request.boardName);
    formData.append('workSpaceId', request.workSpaceId);
    formData.append('workspaceImagePath', request.workspaceImagePath);

    if (request.workspaceImage) {
      formData.append('workspaceImage', request.workspaceImage);
    }

    return this._httpClient.post<ResponseBase<boolean>>(UPDATE_WORKSPACE, formData);
  }
  deleteWorkspace(id: string): Observable<ResponseBase<any>> {
    // Construct the URL with the role ID
    const url = `${DELETE_WORKSPACE}/${id}`;

    // Optionally, if you need to pass additional query parameters, you can use HttpParams.
    // const params = new HttpParams().set('key', 'value'); // add any query parameters if needed

    // Log the ID to be deleted for debugging purposes

    // Send the DELETE request and return the observable
    return this._httpClient.delete<ResponseBase<any>>(url); // You can pass params here if needed
  }
  //#endregion

  //----------------------Workpace Member-------------------------------------------------


  //#region  Workpace Member

  addWorkspaceMember(request: IAddWorkSpaceMemberRequest): Observable<any> {
    console.log("Req add workspace member ", request)

    return this._httpClient.post<ResponseBase<boolean>>(ADD_WORKSPACE_MEMBER, request);
  }
  updateWorkspaceMember(request: IUpdateWorkSpaceMemberRequest): Observable<ResponseBase<boolean>> {

    console.log("Req update ", request)
    return this._httpClient.post<ResponseBase<boolean>>(UPDATE_WORKSPACE_MEMBER, request);
  }
  deleteWorkspaceMember(request: IRemoveWorkSpaceMemberRequest): Observable<ResponseBase<boolean>> {
    return this._httpClient.post<ResponseBase<boolean>>(DELETE_WORKSPACE_MEMBER, request);
  }
  getWorkspaceMemberList(id: string): Observable<ResponseBase<IWorkSpaceMember[]>> {
    const url = `${GET_WORKSPACE_MEMBERS_LIST}/${id}`;

    debugger
    return this._httpClient.get<ResponseBase<IWorkSpaceMember[]>>(url);
  }
//#endregion

  //----------------------Task List-------------------------------------------------

//#region  TaskList
  getTaskListAll(id: string): Observable<ResponseBase<ITaskList[]>> {
    const url = `${GET_ALL_TASKLIST}/${id}`;

    debugger
    return this._httpClient.get<ResponseBase<ITaskList[]>>(url);
  }

  addTaskList(request: IAddTaskListRequest): Observable<ResponseBase<ITaskList>> {
    console.log("Req add workspace member ", request)

    return this._httpClient.post<ResponseBase<ITaskList>>(ADD_TASK_LIST, request);
  }
  getTaskList(request: IAddTaskListRequest): Observable<ResponseBase<ITaskList>> {
    console.log("Req add workspace member ", request)

    return this._httpClient.post<ResponseBase<ITaskList>>(ADD_TASK_LIST, request);
  }

  updateTaskList(request: IUpdateTaskListRequest): Observable<ResponseBase<boolean>> {

    console.log("Req update ", request)
    return this._httpClient.post<ResponseBase<boolean>>(UPDATE_TASK_LIST, request);
  }
  deleteTaskList(id: string): Observable<ResponseBase<boolean>> {
    const url = `${DELETE_TASKLIST}/${id}`;

    return this._httpClient.delete<ResponseBase<any>>(url); // You can pass params here if needed
  }

  //#endregion

    //----------------------Task Card-------------------------------------------------

    getTaskCardAll(id: string): Observable<ResponseBase<TaskCard[]>> {
      const url = `${GET_ALL_TASKLIST}/${id}`;
  
      debugger
      return this._httpClient.get<ResponseBase<TaskCard[]>>(url);
    }
  
    addTaskCard(request: IAddTaskCardRequest): Observable<ResponseBase<TaskCard>> {
      console.log("Req add Card Task ", request)
  
      return this._httpClient.post<ResponseBase<TaskCard>>(ADD_TASK_CARD, request);
    }
    getTaskCard(id: string): Observable<ResponseBase<TaskCard>> {
      const url = `${GET_TASK_CARD}/${id}`;
  
      return this._httpClient.get<ResponseBase<TaskCard>>(url);
    }
  
    updateTaskCard(request: IUpdateTaskListRequest): Observable<ResponseBase<boolean>> {
  
      console.log("Req update ", request)
      return this._httpClient.post<ResponseBase<boolean>>(UPDATE_TASK_CARD, request);
    }
    deleteTaskCard(id: string): Observable<ResponseBase<boolean>> {
      const url = `${DELETE_TASK_CARD}/${id}`;
  
      return this._httpClient.delete<ResponseBase<any>>(url); // You can pass params here if needed
    }
  





// Update task list order
updateTaskListOrder(taskLists: IUpdateTaskListOrderRequest): Observable<ResponseBase<boolean>> {
  return this._httpClient.post<ResponseBase<boolean>>(UPDATE_ORDER_TASK_LIST, taskLists);
}

// Update task list order
updateTaskCardOrder(request: IUpdateTaskOrderRequest): Observable<any> {

  console.log(request)
  return this._httpClient.post<any>(UPDATE_ORDER_TASK_CARD, request);
}

// Update task list order




}
