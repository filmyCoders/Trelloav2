import { Component, ElementRef, ViewChild } from '@angular/core';
import { BaseComponent } from '../../../shared/component/base/base.component';
import { IPagedRequest, IPaginatedList, IRoles, RoleService } from '../../../core';
import { IRoleFilter } from '../../../core/models/filters/IRoleFilters.model';
import { catchError, finalize, map, of } from 'rxjs';
import Modal from 'bootstrap/js/dist/modal';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IAddRolesRequest, IUpdateRoleRequest } from '../../../core/models/request/identity/roles-req';
import { markFormGroupTouched } from '../../../shared/validators/validators';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent extends BaseComponent {
  @ViewChild('addRoleModal') addRoleModalContent!: ElementRef;
  @ViewChild('updateRoleModal') updateRoleModalContent!: ElementRef;
  @ViewChild('deleteRoleModal') deleteRoleModalContent!: ElementRef; // Reference to the modal

  private createModal: Modal | null = null;
  private updateModal: Modal | null = null;
  private deleteModal: Modal | null = null;
  public roleName:string="";
  public roleId:string="";

  public totalPages: number[] = [];
  public currentPage: number = 1;
  public pageNo: number = 1;
  public roles: IRoles[] = [];
  public role!:IRoles
  public isLoading: boolean = false;
  public productImage: any;// Define an array of five specific colors
  colors: string[] = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD'];
  public paged: IPagedRequest<IRoleFilter> = {
    pageIndex: this.pageNo,
    pageSize: 5,
    sortColumn: null,
    isAscending: true,
    searchQuery: null,
    requestData: null
  };
  public roleFilter: IRoleFilter = {
    roleName: '',
   
  };

  public pagedResponse: IPaginatedList<IRoles> = {
    items: [],
    totalCount: 0,
    pageIndex: this.pageNo,
    pageSize: 5,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  };

  public startDate: Date | null = null;
  public endDate: Date | null = null;

  constructor(private _roleService: RoleService) {
    super();
    console.log("Users Component Initialized");
  }

  protected override onInit(): void {
    this.filterToday();
    this.initializePagedRequest();
    this.loadRole();
  }

  protected override onViewInit(): void {

  }
  override ngAfterViewInit(): void {
    // Initialize the modal after the view has been fully initialized
    this.createModal = new Modal(this.addRoleModalContent.nativeElement);
    this.updateModal = new Modal(this.updateRoleModalContent.nativeElement);
    this.deleteModal = new Modal(this.deleteRoleModalContent.nativeElement);

  }

  protected override onDestroy(): void {
  }



  public createRoleForm = new FormGroup({
    id: new FormControl("", []),
    name: new FormControl("", [Validators.pattern(/^[a-zA-Z0-9_ ]+$/), Validators.required]),
    
  });
 
  public openAddRoleModal(): void {
    debugger
    console.log("Add Models")
    this.createRoleForm.reset();
    this.createModal?.show();
  }

  public openDeleteRoleModal(id:string,name:string): void {
    debugger
    console.log("Add Models")
    this.roleId=id;
    this.roleName=name
    this.deleteModal?.show();
  }

  public openUpdateRoleModal(id: string): void {
    debugger;
    console.log("Opening Update Role Modal for ID:", id);
  
    // Fetch the role details before opening the modal
    this.getRole(id);
    
  }
  
// Method to close the modal
closeModal(): void {
  this.createModal?.hide();
}
// Method to close the modal
closeupdateModal(): void {
  this.updateModal?.hide();
}

// Method to close the modal
closeDeleteModal(): void {
  this.deleteModal?.hide();
}


public editRole(): void {
  debugger;
  console.log("Editing Role...");

  let reqModel: IUpdateRoleRequest = {
    newRoleName: this.createRoleForm.controls["name"].value ?? "",
    roleId: this.role.id
  };

  console.log("Update Role Request Model:", reqModel);

  // Validate the form
  if (this.createRoleForm.valid) {
    // Submit the update request
    this.updateSubmit(reqModel);
  } else {
    // Mark form fields as touched to trigger validation messages
    markFormGroupTouched(this.createRoleForm);
  }
}

public saveRole(): void {
  debugger
 // this.isLoading = true;


  // Check if passwords match
  let reqModel: IAddRolesRequest = {
    name: this.createRoleForm.controls["name"].value ?? "",
   
  };
debugger
console.log(reqModel)
if (this.createRoleForm.valid) {
this.addSubmit(reqModel);
} else {
// Mark form fields as touched to trigger validation messages
markFormGroupTouched(this.createRoleForm);

}

}


private addSubmit(reqModel: IAddRolesRequest) {
  this.isLoading = true; // Start loading

  this._roleService.createRole(reqModel)
    .pipe(
      finalize(() => {
        this.isLoading = false; // Ensure loading spinner is turned off after request completes
      })
    )
    .subscribe({
      next: (response) => {
        console.log(response);

        if(response.flag){
          this.toaster.showSuccessToast(response.message);
          this.createModal?.hide();

        }
        else{
          this.toaster.showErrorToast(response.message);

        }


     //   this.toaster.showSuccessToast('Role Add  successfully!');
    this.loadRole();
        // Handle successful response, e.g., navigate or show a success message
      },
      error: (error) => {
        console.error(error);
       this.toaster.showErrorToast(error.error?.error || 'Role Add  failed!');

        // Handle error response, e.g., show an error message
      }
  });
}


private updateSubmit(reqModel: IUpdateRoleRequest) {
  this.isLoading = true; // Start loading

  this._roleService.updateRole(reqModel)
    .pipe(
      finalize(() => {
        this.isLoading = false; // Ensure loading spinner is turned off after request completes
      })
    )
    .subscribe({
      next: (response) => {
        console.log("Role updated successfully:", response);
        
        // Close the modal after success
        if(response.flag){
          this.toaster.showSuccessToast(response.message);
          this.updateModal?.hide();

        }
        else{
          this.toaster.showErrorToast(response.message);

        }

        // Optionally show a success message (toast)
        this.toaster.showErrorToast('Error !');

        // Refresh the roles list
        this.loadRole();
      },
      error: (error) => {
        console.error('Error updating role:', error);
        this.toaster.showErrorToast(error.error?.error || 'Role Update  failed!');

        // Optionally show an error message (toast)
   //     this.toaster.showErrorToast(error.error?.error || 'Role update failed!');
      }
    });
}

public deleteSubmit() {
  this.isLoading = true; // Start loading

  this._roleService.deleteRole(this.roleName)
    .pipe(
      finalize(() => {
        this.isLoading = false; // Ensure loading spinner is turned off after request completes
      })
    )
    .subscribe({
      next: (response) => {
        console.log(response);
        if(response.flag){
          this.toaster.showSuccessToast(response.message);
          this.deleteModal?.hide();

        }
        else{
          this.toaster.showErrorToast(response.message);

        }

     //   this.toaster.showSuccessToast('Role Add  successfully!');
    this.loadRole();
        // Handle successful response, e.g., navigate or show a success message
      },
      error: (error) => {
        console.error(error);
        this.toaster.showErrorToast(error.error?.error || 'Role Delete  failed!');

        // Handle error response, e.g., show an error message
      }
  });
}


//Load Specific Role 

// Load Specific Role 
private getRole(id: string): void {
  this.isLoading = true; // Start loading
  console.log("Fetching role...", id);

  this._roleService.getRole(id).pipe(
    map(response => {
      // Check if the response is successful
      if (response.flag) {
        this.role = response.data;
 // Set form values only after successful data retrieval
 this.createRoleForm.controls['name'].setValue(this.role.name);
 this.createRoleForm.controls['id'].setValue(this.role.id);

 // Open the modal after setting form values
 this.updateModal?.show();
 
       } else {
        throw new Error(response.message); // Handle error message
      }
    }),
    catchError((error) => {
      console.error('Error fetching role:', error.message);
      return of([]); // Return an empty observable on error
    }),
    finalize(() => {
      this.isLoading = false; // Stop loading
    })
  ).subscribe();
}

//#region --------------Load List Roles----------------
  
  private initializePagedRequest(): void {
    this.paged = {
      pageIndex: this.pagedResponse.pageIndex || 0,
      pageSize: this.pagedResponse.pageSize || 5,
      sortColumn: this.paged.sortColumn || 'name',
      isAscending: this.paged.isAscending,
      searchQuery: this.paged.searchQuery || '',
      requestData: {
        roleName: this.roleFilter.roleName || '',
        
      
        
      }
    };
  }

  private loadRole(): void {
    this.isLoading = true; // Start loading
    console.log("Fetching users...", this.paged);

    this._roleService.roleListwithPagination(this.paged).pipe(
      map(response => {
        // Check if the response is successful
        if (response.flag) {
          this.pagedResponse = response.data;

          // Check if items exist
          if (this.pagedResponse.items && this.pagedResponse.items.length > 0) {
            this.roles = this.pagedResponse.items;
        
            // Calculate pagination details
            this.totalPages = Array.from({ length: this.pagedResponse.totalPages }, (_, i) => i + 1);
            this.currentPage = this.pagedResponse.pageIndex;
            this.pagedResponse.totalCount=this.pagedResponse.totalCount

          } else {
            this.roles = []; // Clear the users array if no items exist
          }
        } else {
          throw new Error(response.message); // Handle error message
        }
      }),
      catchError((error) => {
        console.error('Error fetching users:', error.message);
        this.roles = []; // Clear the users array on error
        this.totalPages = []; // Reset total pages on error
        return of([]); // Return an empty observable on error
      }),
      finalize(() => {
        this.isLoading = false; // Stop loading
      })
    ).subscribe();
  }

//#endregion

  //#region ---------- Pagination--------------

  public getVisiblePageNumbers(): number[] {
    const pages: number[] = [];
    const totalPages = this.pagedResponse.totalPages;
    const startPage = Math.max(1, this.pageNo - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }




  public onPageChange(page: number): void {
    this.paged.pageIndex = page;
    this.loadRole();
  }

  public onNextPage(): void {
    if (this.currentPage < this.pagedResponse.totalPages) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  public onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.onPageChange(this.currentPage - 1);
    }
  }

  //#endregion --------End Pagination

 // #region ------------Per page Records ,Sort, Searching -----------
public onRecordsPerPageChange(event: Event): void {
  const selectElement = event.target as HTMLSelectElement;
  this.paged.pageSize = Number(selectElement.value);
  this.loadRole(); // Reload users based on the new page size
}


public onSearch(event: Event): void {
  const inputElement = event.target as HTMLInputElement; // Properly cast the event to HTMLInputElement
  const searchText = inputElement.value;
  this.paged.searchQuery = searchText;
  this.currentPage = 1; // Reset to the first page when searching
  this.loadRole();
}

public sort(column: string): void {
  this.paged.sortColumn = column;
  this.paged.isAscending = !this.paged.isAscending; // Toggle sort direction
  this.loadRole(); // Reload users based on the new sorting
}

//#endregion

 //#region -------------Date Filter------------


    public filterToday(): void {
      let today = new Date();
      this.startDate = new Date(today.setHours(0, 0, 0, 0));
      let endDate = new Date();
      endDate.setHours(23, 59, 59, 0);
      this.initializePagedRequest();
  
      this.loadRole();
    }
    public filterPreviousWeek(): void {
      debugger
      let today = new Date();
      let startDate = new Date(new Date().setDate(new Date().getDate() - 2));
      startDate.setHours(0, 0, 0, 0);
  
      let endDate = new Date();
      endDate.setHours(23, 59, 59, 0);
      this.startDate = startDate
      this.endDate
      this.initializePagedRequest();
  
      this.loadRole();
    }
  
  
    // 30 days ago
    public setLast30Days(): void {
      let startDate = new Date(new Date().setDate(new Date().getDate() - 30));
      console.log("date", startDate);
      // let startDate = new Date(new Date().getTime() - (30 * 24 * 60 * 60 * 1000));
      startDate.setHours(0, 0, 0, 0);
      this.startDate = startDate
      console.log("date", this.startDate);
  
      let endDate = new Date();
  
  
      endDate.setHours(23, 59, 59, 0);
      console.log(this.startDate + "  " + this.endDate);
      this.initializePagedRequest();
  
      this.loadRole();
    }
  
  
    public filterAllTime(): void {
      debugger;
  
      // Check if startDate and endDate are defined
      if (this.startDate || this.endDate) {
        // If any date is selected, set the startDate to January 1, 2001
        this.startDate = new Date(2001, 0, 1); // January 1, 2001
      } else {
        // Otherwise, set both to null (this is optional based on your logic)
        this.startDate = null;
      }
  
      // Set endDate to the current date
      this.endDate = new Date(); // Set to the current date and time
  
      // Initialize the paged request to use the new date filters
      this.initializePagedRequest();
  
      // Load users based on the updated filter
      this.loadRole();
    }
    public dateFilters(event: Event): void {
      const selectElement = event.target as HTMLSelectElement; // Cast the event target to HTMLSelectElement
      const selectedValue = selectElement.value; // Get the selected value
      debugger
      // Call the corresponding filter method based on the selected value
      switch (selectedValue) {
        case 'today':
          this.filterToday();
          break;
        case 'previousWeek':
          this.filterPreviousWeek();
          break;
        case 'previousMonth':
          this.setLast30Days();
          break;
        case 'allTime':
          this.filterAllTime();
          break;
        default:
          this.filterAllTime(); // Fallback to all time if nothing matches
          break;
      }
    }
  //#endregion

}


