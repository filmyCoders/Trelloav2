import { Component } from '@angular/core';
import { IPagedRequest,
   IPaginatedList,
    IUser, IUserFilter,
     ResponseBase, UserService } from '../../../core';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { BaseComponent } from '../../../shared';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent extends BaseComponent {
  public initials: string = '';

  protected override onViewInit(): void {
  }
  protected override onDestroy(): void {
  }
  public activeFilter!:boolean
  public deActiveFilter!:boolean
  public roleFilter:string|undefined
  tags = [
    { name: 'All', active: true },
    
    { name: 'User', active: false },
    { name: 'Admin', active: false },
  ];
  public totalPages: number[] = [];
  public currentPage: number = 1;
  public pageNo: number = 1;
  public users: IUser[] = [];
  public user!: IUser

  public isLoading: boolean = false;
  public productImage: any;// Define an array of five specific colors
  colors: string[] = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD'];
  public paged: IPagedRequest<IUserFilter> = {
    pageIndex: this.pageNo,
    pageSize: 5,
    sortColumn: null,
    isAscending: true,
    searchQuery: null,
    requestData: null
  };

  public pagedResponse: IPaginatedList<IUser> = {
    items: [],
    totalCount: 0,
    pageIndex: this.pageNo,
    pageSize: 5,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  };

  public userFilter: IUserFilter = {
    roleName: '',
    userId: '',
    startDate: undefined,
    endDate: undefined,
    deActiveted:undefined,
    activeted:undefined
  };

  public startDate: Date | null = null;
  public endDate: Date | null = null;

  constructor(private _userServices: UserService) {
    super();
    console.log("Users Component Initialized");
  }

  protected override onInit(): void {
    this.filterToday();
    this.initializePagedRequest();
    this.loadUsers();
    // this.loadProfileImage();
  }

  private initializePagedRequest(): void {
    this.paged = {
      pageIndex: this.pagedResponse.pageIndex || 0,
      pageSize: this.pagedResponse.pageSize || 5,
      sortColumn: this.paged.sortColumn || 'firstName',
      isAscending: this.paged.isAscending,
      searchQuery: this.paged.searchQuery || '',
      requestData: {
        roleName: this.userFilter.roleName || '',
        userId: this.userFilter.userId || '',
        startDate: this._formatLocalDateTime(this.startDate),
        endDate: this._formatLocalDateTime(this.endDate),
       activeted:this.activeFilter,
       deActiveted:this.deActiveFilter
        
      }
    };
  }


  private _formatLocalDateTime(date: Date | null): string | undefined {
    return date ? date.toISOString().slice(0, -1) : undefined;
  }

  private loadUsers(): void {
    this.isLoading = true; // Start loading
    console.log("Fetching users...", this.paged);

    this._userServices.UserListwithPagination(this.paged).pipe(
      map(response => {
        // Check if the response is successful
        if (response.flag) {
          this.pagedResponse = response.data;

          // Check if items exist
          if (this.pagedResponse.items && this.pagedResponse.items.length > 0) {
            this.users = this.pagedResponse.items;
            console.log(this.users);
            this.users.forEach(user => {
              console.log("Get User", user)
              this.loadProfileImage(user);
            });
            // Calculate pagination details
            this.totalPages = Array.from({ length: this.pagedResponse.totalPages }, (_, i) => i + 1);
            this.currentPage = this.pagedResponse.pageIndex;
            this.pagedResponse.totalCount=this.pagedResponse.totalCount

          } else {
            this.users = []; // Clear the users array if no items exist
          }
        } else {
          throw new Error(response.message); // Handle error message
        }
      }),
      catchError((error) => {
        console.error('Error fetching users:', error.message);
        this.users = []; // Clear the users array on error
        this.totalPages = []; // Reset total pages on error
        this.pagedResponse.totalCount=0

        return of([]); // Return an empty observable on error
      }),
      finalize(() => {
        this.isLoading = false; // Stop loading
      })
    ).subscribe();
  }

  

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
    this.loadUsers();
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
    this.loadUsers(); // Reload users based on the new page size
  }


  public onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement; // Properly cast the event to HTMLInputElement
    const searchText = inputElement.value;
    this.paged.searchQuery = searchText;
    this.currentPage = 1; // Reset to the first page when searching
    this.loadUsers();
  }

  public sort(column: string): void {
    this.paged.sortColumn = column;
    this.paged.isAscending = !this.paged.isAscending; // Toggle sort direction
    this.loadUsers(); // Reload users based on the new sorting
  }

  //#endregion



  //#region -------------Date Filter------------


  public filterToday(): void {
    let today = new Date();
    this.startDate = new Date(today.setHours(0, 0, 0, 0));
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 0);
    this.initializePagedRequest();

    this.loadUsers();
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

    this.loadUsers();
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

    this.loadUsers();
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
    this.loadUsers();
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

  //#endregion ------------------End Date Filter---------------



  loadProfileImage(user: IUser): void {
    this._userServices.getImage(user.profileImageUrl).subscribe(
      blob => {
        const objectURL = URL.createObjectURL(blob);
        user.profileImageUrl = objectURL;
      },
      error => {
        console.error('Error fetching profile image:', error);
        // Set initials as fallback
        user.profileImageUrl = 'assets/defaultProfile.jpg'; // Fallback image
        
    //    this.initials = this.getInitials(user.firstName + " " + user.lastName);
      }
    );
  }
  
  // Utility method to get initials from user name
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  }
   // Method to get color based on user index
  getColor(index: number): string {
    // Ensure the index is a valid number
    return this.colors[index % this.colors.length] || '#000000'; // Fallback color if colors array is empty
  }
  toggleTag(tag: { name: string; active: boolean }) {
    // Deactivate all tags first
    this.tags.forEach(t => t.active = false);
  
    // Toggle the clicked tag's active state
    tag.active = !tag.active;
  
    if (tag.active) {
      switch (tag.name) {
        case "User":
          this.userFilter.roleName = "User";
          this.roleFilter=this.userFilter.roleName;

          // Only set the clicked tag as active
          this.tags.forEach(t => {
            if (t.name === "User") {
              t.active = true;
            }
          });
          break;
        case "Admin":
          this.userFilter.roleName = "SuperAdmin";
          this.roleFilter=this.userFilter.roleName;
          // Only set the clicked tag as active
          this.tags.forEach(t => {
            if (t.name === "Admin") {
              t.active = true;
            }
          });
          break;
        case "All":
          this.tags.forEach(t => {
            if (t.name === "All") {
              t.active = true;
              
            }
          });
         
          this.userFilter.roleName = undefined;

          break;
                 case "Active":
                this.userFilter.roleName=this.roleFilter;

            // Only set the clicked tag as active
            this.tags.forEach(t => {
              if (t.name === "Active") {
                t.active = true;
                
              }
            });
            this.userFilter.activeted = true;
           
          break;
          case "Deactived":
          // Deactivate all other tags
          this.userFilter.deActiveted = true;
          this.userFilter.roleName=this.roleFilter;

          // Only set the clicked tag as active
          this.tags.forEach(t => {
            if (t.name === "Deactived") {
              t.active = true;
            }
          });

          break;
        default:
          // Deactivate all if unknown tag is clicked
          this.tags.forEach(t => t.active = false);
          this.userFilter.roleName = undefined;

          break;
      }
    } else {
      this.userFilter.roleName = undefined;
    }
  
    // Initialize the paged request and load users based on the updated filter
    this.initializePagedRequest();
    this.loadUsers();
  }
  
  // toggleActiveFilter(tag: { name: string; active: boolean }) {
  //   // Deactivate all tags first
  //   this.tags.forEach(t => t.active = false);
  
  //   // Toggle the clicked tag's active state
  //   tag.active = !tag.active;
  
  //   if (tag.active) {
  //     switch (tag.name) {
  //       case "User":
  //         this.userFilter.roleName = "User";
  //         // Only set the clicked tag as active
  //         this.tags.forEach(t => {
  //           if (t.name === "User") {
  //             t.active = true;

  //           }
  //         });
          
  //         break;
  //       case "Admin":
  //         this.userFilter.roleName = "SuperAdmin";
  //         // Only set the clicked tag as active
  //         this.tags.forEach(t => {
  //           if (t.name === "Admin") {
  //             t.active = true;

  //           }
  //         });
  //         break;
  //       case "All":
  //         // Deactivate all other tags
  //         this.tags.forEach(t => {
  //           if (t.name === "All") {
  //             t.active = true;

  //           }
  //         });
  //         this.userFilter.roleName = undefined;

  //         break;
  //         case "Active":
  //           this.userFilter.activeted = true;
  //           // Only set the clicked tag as active
  //           this.tags.forEach(t => {
  //             if (t.name === "Active") {
  //               t.active = true;
                
  //             }
  //           });
           
  //         break;
  //         case "Deactived":
  //         // Deactivate all other tags
  //         this.userFilter.deActiveted = true;
  //         // Only set the clicked tag as active
  //         this.tags.forEach(t => {
  //           if (t.name === "Deactived") {
  //             t.active = true;
  //           }
  //         });

  //         break;

  //       default:
  //         // Deactivate all if unknown tag is clicked
  //         this.tags.forEach(t => t.active = false);
  //         this.userFilter.roleName = undefined;

  //         break;
  //     }
  //   } else {
  //     this.userFilter.roleName = undefined;
  //   }
  
  //   // Initialize the paged request and load users based on the updated filter
  //   this.initializePagedRequest();
  //   this.loadUsers();
  // }
}
