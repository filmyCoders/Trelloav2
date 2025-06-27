import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { AdminToasterService } from '../../../core/services/common/admin-toaster.service';
import * as moment from 'moment';

@Component({
  template: ''
})
export abstract class BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly destroy$ = new Subject<void>();
  protected readonly toaster: AdminToasterService;

  // Abstract methods to be implemented by derived components
  protected abstract onInit(): void;
  protected abstract onViewInit(): void;
  protected abstract onDestroy(): void;
  
  constructor( ){
    this.toaster = inject(AdminToasterService);

  }

  ngOnInit(): void {
    this.onInit();
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this.onViewInit();
    }, 100); // Optionally replace this with ChangeDetectorRef.detectChanges() if needed
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.onDestroy();
  }
  public formatDate(date: string | undefined | null, format: string = 'MMM DD, YYYY'): string {
    if (!date) return "";
    return moment.utc(moment.utc(date).toDate()).local().format(format);
  }
  public formatDateTime(date: string | undefined | null, format: string = 'MMM DD, YYYY, hh:mm A'): string {
    if (!date) return "";
  
    return moment.utc(date).local().format(format); // Include time in the format
  }
  // Method to convert UTC date-time to local date-time
convertUtcToLocal(utcDateTime: string): string {
  const date = new Date(utcDateTime); // Create a Date object from the UTC string
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const dd = date.getDate().toString().padStart(2, '0');
  const hh = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`; // Return in the datetime-local format
}
  
  // Uncomment and use this method if needed for location checking logic
  /*
  private _locationCheck(): void {
    let localState = this.location.getState() as { navigationId?: number };
    if (localState.navigationId && localState.navigationId > 1) {
      this.checkLocation = true;
    } else {
      this.checkLocation = false;
    }
  }
  */




 
 }
