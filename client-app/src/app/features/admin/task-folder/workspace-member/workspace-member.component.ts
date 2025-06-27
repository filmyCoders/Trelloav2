import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BaseComponent } from '../../../../shared/component/base/base.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Modal from 'bootstrap/js/dist/modal';
import { Observable, debounceTime, distinctUntilChanged, finalize, map, of, switchMap, tap } from 'rxjs';
import { markFormGroupTouched } from '../../../../shared/validators/validators';
import { Role, WORKSPACEROLE } from '../../../../core/models/enums/roles.enum';
import { IAddWorkSpaceMemberRequest, IRemoveWorkSpaceMemberRequest, IUpdateWorkSpaceMemberRequest } from '../../../../core/models/request/task/workspace-request-params';
import { IPagedRequest, IPaginatedList,
   IUser, IUserFilter, IWorkSpaceMember,
    TaskService, UserService } from '../../../../core';

@Component({
  selector: 'app-workspace-member',
  templateUrl: './workspace-member.component.html',
  styleUrls: ['./workspace-member.component.css'],
})
export class WorkspaceMemberComponent extends BaseComponent {
  protected override onViewInit(): void {
  }
  protected override onDestroy(): void {
  }
  @ViewChild('showWorkspaceMemberModel') showWorkspaceMemberModalContent!: ElementRef;
  private showModel: Modal | null = null;
  public isLoading: boolean = false;

  workspaceId?: string;

  addworkspaceMember!: IAddWorkSpaceMemberRequest;
  private _workspaceId: string = '';
  public workspaceRoles = Object.values(WORKSPACEROLE);
  public workspaceRole = WORKSPACEROLE.Admin;

  getMembers: IWorkSpaceMember[] = [];
  messageFlag: boolean = false


  // Seach box for Suggeted User Show 
  selectedUserData?: IUser; // Store the selected user here
  searchText: string = ''
  public pagedResponse: IPaginatedList<IUser> = {
    items: [],
    totalCount: 0,
    pageIndex: 1,
    pageSize: 5,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  };


  public addworkspaceForm = new FormGroup({
    userName: new FormControl('', [Validators.required]),
    role: new FormControl(WORKSPACEROLE.Viewer, [Validators.required]),
  });

  public contributorForm = new FormGroup({
    username: new FormControl("", [Validators.pattern(/^[a-zA-Z0-9_]+$/), Validators.required]),
    role: new FormControl(WORKSPACEROLE.Viewer, [Validators.required]),
  });
  inviteEmail = '';
  selectedRole = 'Member';



  constructor(
    private _workspaceService: TaskService,
    private _route: ActivatedRoute,
    private _router: Router,
    private http: HttpClient,
    private _userService: UserService

  ) {
    super();
  }

  protected override onInit(): void {
    // this._route.queryParams.subscribe(params => {
    //   
    //   this._workspaceId = params['workspaceId'];

    //   if (!this._workspaceId) {
    // If workspaceId does not exist, navigate to the workspace list
    //     this._router.navigate(['workspace']);
    //   } else {
    //     // If workspaceId exists, open the add workspace modal
    //     this.openAddWorkspaceModal();
    //   }
    // });
  }

  override ngAfterViewInit(): void {
    if (this.showWorkspaceMemberModalContent) {
      this.showModel = new Modal(this.showWorkspaceMemberModalContent.nativeElement);
    }
  }
  public openWorkspaceMember(id: string): void {
    
    this._workspaceId = id
    this.addworkspaceForm.reset(); // Reset form before showing modal
    this.showModel?.show();
    this._init();
  }

  closeModal() {
    this.showModel?.hide();
    this.getMembers = []
  }


  //#region  User Suggetion search box 
  // Method to fetch users based on search query
  searchUsers(event: Event): void {


    
    const inputElement = event.target as HTMLInputElement; // Properly cast the event to HTMLInputElement
    const searchText = inputElement.value;
    // If no search text is entered, clear the results or show empty results
    if (!searchText) {
      this.messageFlag = true

      this.pagedResponse.items = []; // Assuming pagedResponse.items is an array
      return; // Exit early to prevent making unnecessary API calls
    }
    const paged: IPagedRequest<IUserFilter> = {
      pageIndex: 1,
      pageSize: 5,
      sortColumn: null,
      isAscending: true,
      searchQuery: searchText,
      requestData: null
    };

    this._userService.UserListwithPagination(paged).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(() => this._userService.UserListwithPagination(paged))
    ).subscribe((response) => {
      this.pagedResponse = response.data;

      if (response.data == null) {
        this.messageFlag = true

      }
    });
  }


  // Method to handle user selection
  selectUser(user: IUser): void {
    // Update the search text with the selected user's name or another field
    this.searchText = user.userName;  // Assuming `userName` is the field to display

    this.selectedUserData = user
    console.log(this.selectedUserData)
    this.addworkspaceForm.controls.userName.setValue(user.userName);
    this.messageFlag = false
    // Optionally, you can hide the suggestions after a user is selected
    this.pagedResponse.items = []; // Clear the list after selection (optional)
  }
  //#endregion


  //#region Delete Workspcace Member

  deleteMember(member: IWorkSpaceMember) {

    let request:IRemoveWorkSpaceMemberRequest={
      userId:member.userId ??"",
      
      boardMemberId:member.boardMemberId
    }
    this._workspaceService.deleteWorkspaceMember(request).subscribe({
      next: (response) => {
        if (response.flag) {
          this.toaster.showSuccessToast(response.message);
       
          if(this.getMembers.length==1)
          {
           this.getMembers=[ ]
          }
          this._init()
        } else {
          this.toaster.showErrorToast(response.message);
        }
      },
      error: (error) => {
        console.error(error);
        this.toaster.showErrorToast(error.error?.error || 'Failed to delete member');
      }
    });
  }


  //#endregion


  //#region  Local Workspace Member
  //Load Workspace Member by id
  public _init(): void {
    this.isLoading = true;

    this._loadWorkspace()
      .pipe(
        switchMap((events) => {
          return of([]);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => { },
        error: (err) => console.error('Error during operation:', err),
      });
  }


  private _loadWorkspace(): Observable<IWorkSpaceMember[]> {
    return this._workspaceService.getWorkspaceMemberList(this._workspaceId ?? '').pipe(
      tap((response) => {
        debugger;
        
        // Ensure response.data exists before accessing length
        this.getMembers = response.data?.length > 0 ? response.data.map(member => ({ ...member })) : [];
      }),
      map((response) => response.data || [])
    );
  }
   //#endregion


  //#region  Update workspace memeber

  updateRole(member: IWorkSpaceMember): void {

    let data: IUpdateWorkSpaceMemberRequest = {
      workSpaceId: member.workSpaceId,
      boardMemberId: member.boardMemberId,
      role: WORKSPACEROLE[member.role],
    };

    this.updateWorkspace(data); // Call the update method with the new data
  }


  updateWorkspace(data: IUpdateWorkSpaceMemberRequest): void {
    if (data) {
      this.isLoading = true;
      //  const type = this.getEventTypeValue(data.role);

      let req: IUpdateWorkSpaceMemberRequest = {
        workSpaceId: data.workSpaceId ?? '',
        boardMemberId: data.boardMemberId,
        role: data.role
      };

      console.log(req);
      this._workspaceService.updateWorkspaceMember(req)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (response) => {
            if (response.flag) {
              this.toaster.showSuccessToast(response.message);
            } else {
              this.toaster.showErrorToast(response.message);
            }
            this._init();
          },
          error: (error) => {
            console.error(error);
            this.toaster.showErrorToast(error.error?.error || 'Workspace update failed!');
          }
        });
    }
  }
  //#endregion

  //#region  Save WorkSpace Memeber 
  public saveWorkspace(): void {

    
    if (this.addworkspaceForm.valid) {

      this.isLoading = true; // Start loading
      let getRoleByForm = this.addworkspaceForm.controls["role"].value as WORKSPACEROLE // Use the enum type
      let userId: string = ""; // Default to an empty string

      if (this.selectedUserData) {
        userId = this.selectedUserData?.id

      }
      let req: IAddWorkSpaceMemberRequest = {
        workSpaceId: this._workspaceId,
        userId: userId,
        // this.addworkspaceForm.controls["userId"].setValue(user.id);

        role: WORKSPACEROLE[getRoleByForm],

      }

      this._workspaceService.addWorkspaceMember(req) // Use correct service
        .pipe(
          finalize(() => {
            this.isLoading = false; // Ensure loading spinner is turned off after request completes
          })
        )
        .subscribe({
          next: (response) => {

            if (response.flag) {
              this.toaster.showSuccessToast(response.message);
              // this.createModal?.hide()
              this.addworkspaceForm.reset()

            } else {
              this.toaster.showErrorToast(response.message);
            }

            this._init(); // Refresh workspace list
          },
          error: (error) => {
            console.error(error);
            this.toaster.showErrorToast(error.error?.error || 'Workspace creation failed!');
          }
        });
    } else {
      markFormGroupTouched(this.addworkspaceForm);
    }
  }

  //#endregion
}