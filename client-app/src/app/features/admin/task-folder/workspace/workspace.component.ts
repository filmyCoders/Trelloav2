import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Observable, finalize, map, of, switchMap, tap } from 'rxjs';
import { BaseComponent } from '../../../../shared/component/base/base.component';
import { TaskService } from '../../../../core/services/api/task.service';
import { DIRECTORYNAME } from '../../../../core/models/enums/asset-file-types';
import { IAddWorkspace, IUpdateWorkspace } from '../../../../core/models/request/task/workspace-request-params';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';
import { markFormGroupTouched } from '../../../../shared/validators/validators';
import { IUpdateEventRequest, IWorkspace } from '../../../../core';
import { WorkspaceMemberComponent } from '../workspace-member/workspace-member.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css'
})
export class WorkspaceComponent extends BaseComponent {
// Demo Member
workspaceId: string = '';  // Set workspace ID dynamically
viewMode: 'list' | 'add' | 'edit' | 'delete' = 'list';

changeViewMode(newMode: 'list' | 'add' | 'edit' | 'delete') {
  this.viewMode = newMode;
}
@ViewChild(WorkspaceMemberComponent) openWorkpaceMember!: WorkspaceMemberComponent;

  @ViewChild('deleteWorkspaceModel') deleteWorkspaceModalContent!: ElementRef;

  @ViewChild('addWorkspaceModal') addWorkspaceModalContent!: ElementRef;
  @ViewChild('updateWorkspaceModal') updateWorkspaceModalContent!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  private createModal: Modal | null = null;
  private updateModal: Modal | null = null;
  private deleteModal: Modal | null = null;
  selectedFile: File | null = null;
  serverImagePath: string = 'path_from_server';

  public workpaceId?: string
  workspaces: IWorkspace[] = [];
  workspaceGet?: IWorkspace;

  public isLoading: boolean = false;
  DIRECTORYNAME = { directoryName: 1 };
  // Form group for editing events
  public addworspaceForm = new FormGroup({

    workspacesName: new FormControl('', [Validators.required, Validators.maxLength(50)]), // Title
  });

  public editForm = new FormGroup({
    workspacesName: new FormControl('', [Validators.required, Validators.maxLength(50)]), // Title
    workspaceImage: new FormControl(null) // File input control

  });
  constructor(private _taskService: TaskService,private cdRef: ChangeDetectorRef,
    private _router:Router
    ) {
    super();
  }


  protected override onInit(): void {
    this._init()
  }
  protected override onViewInit(): void {


  }
  override ngAfterViewInit(): void {
    // Initialize the modal after the view has been fully initialized
    this.deleteModal = new Modal(this.deleteWorkspaceModalContent.nativeElement);

    this.createModal = new Modal(this.addWorkspaceModalContent.nativeElement);
    this.updateModal = new Modal(this.updateWorkspaceModalContent.nativeElement);
  }

  OnChanges() {
    this.selectedFile = null;

  }
  protected override onDestroy(): void {


  }


  selectedWorkspaceIndex: number | null = null;

  // Toggle options menu, close other menus
  toggleOptions(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.selectedWorkspaceIndex =
      this.selectedWorkspaceIndex === index ? null : index;
  }

  // Close the options menu when clicking outside
  @HostListener('document:click', ['$event'])
  closeOptions(event: Event) {
    this.selectedWorkspaceIndex = null;
  }

  // Prevent the menu from closing when clicking inside
  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  // Open Workspace (Double Click)
  openWorkspace(workspaceId: string) {
    this._router.navigate(['/admin/event-task/task/open-workspace'], { queryParams: { id: workspaceId } });
  }
  // Open Workspace (Double Click)
  openWorkspaceMember(workspace: IWorkspace) {
    this.openWorkpaceMember.openWorkspaceMember(workspace.workSpaceId)
  }




  //Load Workpace

  public _init(): void {
    this.isLoading = true;

    this._loadWorkspace()
      .pipe(
        switchMap((events) => {

          // Return an empty observable if no events are present
          return of([]);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (userDetails) => {
          console.log('User details fetched successfully:', userDetails);
        },
        error: (err) => console.error('Error during operation:', err),
      });
  }

  private _loadWorkspace(): Observable<IWorkspace[]> {
    return this._taskService.getWorkspaceList().pipe(
      tap((response) => {
        console.log("Response data", response)

        this.workspaces = response.data || [];

      }),
      map((response) => response.data || []) // Ensure we return the list of events'

    );

  }


  public closeModal(type: string) {
    this.serverImagePath = '';
    this.selectedFile = null; // Clear selected file
  
    // ✅ Ensure Angular detects the reset
    setTimeout(() => {
      if (this.fileInput) {
        this.fileInput.nativeElement.value = ''; // Reset file input
        this.cdRef.detectChanges(); // Force Angular to detect changes
      }
    }, 100);
  
    switch (type) {
      case 'Add':
        this.createModal?.hide();
        break;
      case 'Delete':
        this.deleteModal?.hide();
        break;
      case 'Edit':
        this.updateModal?.hide();
        break;
      default:
    }
  }
  
  //#region Add Workspace 
  public openAddWorkspaceModal(): void {
    debugger
    console.log("Add Models")
    this.addworspaceForm.reset();
    this.createModal?.show();
  }


  //Selecte File
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }


  public saveWorkspace(): void {

    debugger
    if (this.addworspaceForm.valid) {

      this.isLoading = true; // Start loading

      let req: IAddWorkspace = {
        boardName: this.addworspaceForm.controls["workspacesName"].value ?? "",
        workspaceImage: this.selectedFile

      }

      console.log(req)
      this._taskService.createWorkspace(req) // Use correct service
        .pipe(
          finalize(() => {
            this.isLoading = false; // Ensure loading spinner is turned off after request completes
          })
        )
        .subscribe({
          next: (response) => {

            if (response.flag) {
              this.toaster.showSuccessToast(response.message);
              this.createModal?.hide()

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
      markFormGroupTouched(this.addworspaceForm);
    }
  }

  //#endregion 


  openUpdateWorkspaceModal(data: IWorkspace): void {
    this.workpaceId = data.workSpaceId
    this.editForm.controls.workspacesName.setValue(data.boardName);
    this.serverImagePath = data.workspaceImage;
    // Populate form controls with selected event data
    this.updateModal?.show()

    // Fetch the role details before opening the modal
    //this.getRole(id);

  }

  public updateWorkspace(): void {

    debugger
    if (this.editForm.valid) {

      this.isLoading = true; // Start loading

      let req: IUpdateWorkspace = {
        workSpaceId: this.workpaceId ?? '',
        boardName: this.editForm.controls["workspacesName"].value ?? "",
        workspaceImage: this.selectedFile,
        workspaceImagePath: this.workspaceGet?.workspaceImage ?? ""
      }

      console.log(req)
      this._taskService.updateWorkspace(req) // Use correct service
        .pipe(
          finalize(() => {
            this.isLoading = false; // Ensure loading spinner is turned off after request completes
          })
        )
        .subscribe({
          next: (response) => {

            if (response.flag) {
              this.toaster.showSuccessToast(response.message);
              this.updateModal?.hide()
              this.selectedFile

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
      markFormGroupTouched(this.addworspaceForm);
    }
  }



  //#region Delete Workpace
  public openDeleteWorkspaceModal(workpaceData: IWorkspace): void {
    //  debugger
    this.workspaceGet = workpaceData
    this.workpaceId = workpaceData.workSpaceId
    ///  this.deleteSubmit()
    this.deleteModal?.show();
    // this.createModal?.show()
  }


  public deleteSubmit() {
    this.isLoading = true; // Start loading

    if (this.workpaceId)
      this._taskService.deleteWorkspace(this.workpaceId)
        .pipe(
          finalize(() => {
            this.isLoading = false; // Ensure loading spinner is turned off after request completes
          })
        )
        .subscribe({
          next: (response) => {
            console.log(response);
            if (response.flag) {
              this.toaster.showSuccessToast(response.message);
              this.deleteModal?.hide();
              this._init()
            }
            else {
              this.toaster.showErrorToast(response.message);

            }

            //   this.toaster.showSuccessToast('Role Add  successfully!');
            // Handle successful response, e.g., navigate or show a success message
          },
          error: (error) => {
            console.error(error);
            this.toaster.showErrorToast(error.error?.error || 'Workspace Delete  failed!');

            // Handle error response, e.g., show an error message
          }
        });
  }
  //#endregion 
}
