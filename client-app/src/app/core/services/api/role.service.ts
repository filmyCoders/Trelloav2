import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IPagedRequest, IPaginatedList, IRoles, ROLES_LIST, ROLE_ADD, ROLE_DELETE, ROLE_GET, ROLE_UPDATE, ResponseBase } from '../..';
import { Observable } from 'rxjs';
import { IRoleFilter } from '../../models/filters/IRoleFilters.model';
import { IAddRolesRequest, IUpdateRoleRequest } from '../../models/request/identity/roles-req';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private _httpClient: HttpClient,private _router:Router) {}

  roleListwithPagination(request: IPagedRequest<IRoleFilter>): Observable<ResponseBase<IPaginatedList<IRoles>>> {
    // Build the HttpParams with all query parameters if needed
    const httpOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    console.log("Request Payload: role", request);

    return this._httpClient.post<ResponseBase<IPaginatedList<IRoles>>>(ROLES_LIST, request, httpOptions);
}

getRole(id: string): Observable<ResponseBase<IRoles>> {
  // Build the HttpParams with all query parameters
  const url = `${ROLE_GET}/${id}`;

  return this._httpClient.get<ResponseBase<IRoles>>(url);
}

 createRole(request: IAddRolesRequest): Observable<ResponseBase<boolean>> {
  // Build the HttpParams with all query parameters
    
  return this._httpClient.post<ResponseBase<boolean>>(ROLE_ADD, request);
}



updateRole(request:IUpdateRoleRequest ): Observable<ResponseBase<boolean>> {
  // Build the HttpParams with all query parameters
    
console.log("UPDATE Role",request)
  return this._httpClient.put<ResponseBase<boolean>>(ROLE_UPDATE, request);
}

deleteRole(roleName: string): Observable<ResponseBase<boolean>> {
  // Construct the URL with the role ID
  const url = `${ROLE_DELETE}/${roleName}`;

  // Optionally, if you need to pass additional query parameters, you can use HttpParams.
  // const params = new HttpParams().set('key', 'value'); // add any query parameters if needed

  // Log the ID to be deleted for debugging purposes
  console.log("DELETE Role ID:", roleName);

  // Send the DELETE request and return the observable
  return this._httpClient.delete<ResponseBase<boolean>>(url); // You can pass params here if needed
}
}
