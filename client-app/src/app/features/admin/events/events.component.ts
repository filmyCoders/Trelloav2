import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { markFormGroupTouched } from '../../../shared/validators/validators';
import { Observable, catchError, finalize, forkJoin, map, of, switchMap, tap, throwError } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { GetEventComponent } from '../event-folder/get-event/get-event.component';
import { BaseComponent } from '../../../shared';
import { EVENTTYPE, EventResponse, EventsService, IEventModelPopupShowParams, IUser, UserService } from '../../../core';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],
  animations: [
    trigger('fade', [
      // Fade-in animation when the element enters the view
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ]),
      // Fade-out animation when the element leaves the view
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class EventsComponent extends BaseComponent {

  @ViewChild(GetEventComponent) popupModalsComponent!: GetEventComponent;
  lastUpdatedEventId: string | null = null; // Track the last updated event by its ID

  protected override onViewInit(): void {
  }
  protected override onDestroy(): void {
    this._eventsService.clearModelEvent();
  }
  public isLoading: boolean = false;
  public userCache: { [email: string]: IUser } = {}; // Cache to store user data by email
  showMoreParticipants: boolean[] = [];
  isCalendarView: boolean = false; // Controls the view state
  events: EventResponse[] = [];

  eventTypes = Object.values(EVENTTYPE);
  editForm!: FormGroup;
  profileImagePreview: { [email: string]: string } = {};
  public user!: IUser
  selectedEventId?: string;
  public localdate: string = new Date().toISOString(); // Set localdate as current date-time in ISO format

  constructor(private _eventsService: EventsService, private _fb: FormBuilder, private _userServices: UserService) {
    super();
  }
  protected override onInit(): void {



    this.events.forEach((_, index) => {
      this.showMoreParticipants[index] = false;
    });
  }

  override ngOnInit(): void {
    //  this.fetchEvents();
    this._init()
  }


  // Handle modal close event and reload data
  onModalClose(updatedData: any) {
    let index = this.events.findIndex(item => item.id === updatedData.id);
    if (index !== -1) {
      this.events[index] = { ...updatedData, updated: true }; // Update item locally and mark as updated
    }
    this.lastUpdatedEventId = updatedData.id; // Update the last updated event

    //this._init()
  }

  getEventColor(eventId: string) {
    return this.lastUpdatedEventId === eventId ? 'highlighted' : ''; // Apply 'highlighted' class for the last updated event
  }
  // Toggle the view state
  toggleView(): void {
    this.isCalendarView = !this.isCalendarView;
  }

  // Method to compare dates
  isEventInFuture(eventDateTime: string): boolean {
    return new Date(eventDateTime) > new Date(this.localdate);
  }

  // Method to open modal with event ID
  openEventModal(eventId: string, modelType: string): void {
    let data: IEventModelPopupShowParams = {
      eventId: eventId,
      type: modelType
    }

    if (eventId) {
      // this._eventsService.showModelEvent(data); // Emit the selected event ID
      this.popupModalsComponent.openModel(data)
    }
  }

  public _init(): void {
    this.isLoading = true;

    this._loadEvents()
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

  private _loadEvents(): Observable<EventResponse[]> {
    return this._eventsService.getAllEvents().pipe(
      tap((response) => {
        this.events = response.data || [];
         console.log(this.events)
      }),
      map((response) => response.data || []) // Ensure we return the list of events'

    );

  }

  toggleShowMore(index: number): void {
    this.showMoreParticipants[index] = !this.showMoreParticipants[index];
  }
  // public findEmail(event:Event,i:number)
  // {
  //   debugger
  //   const inputElement = event.target as HTMLInputElement; // Properly cast the event to HTMLInputElement
  //   const email = inputElement.value;
  // this.fetchUserData(email,i)
  // }

  // public fetchUserData(email: string, index: number): void {
  //   // Check if user data for the email already exists in the cache
  //   if (this.userCache[email]) {
  //     this.populateUserDataToForm(this.userCache[email], index);
  //     return; // Stop further execution if user data is cached
  //   }

  //   this._userServices.getUserDetailsByEmails(email).pipe(
  //     switchMap((response) => {
  //       if (response.flag) {
  //         const user = response.data;
  //         // Cache the user data
  //         this.userCache[email] = user; // Store user data in cache

  //         return this._userServices.getImage(user.profileImageUrl).pipe(
  //           switchMap((blob) => {
  //             const objectURL = URL.createObjectURL(blob);
  //             user.profileImageUrl = objectURL; // Update profile image
  //             return [user]; // Wrap user in an array to satisfy switchMap return type
  //           })
  //         );
  //       } else {
  //         throw new Error('Email does not exist.');
  //       }
  //     })
  //   ).subscribe({
  //     next: (user) => {
  //       this.populateUserDataToForm(user, index); // Pass the first element from array
  //     },
  //     error: (err) => {
  //       console.error(`Error fetching user for email ${email}:`, err);
  //       this.handleParticipantError(index, 'Email does not exist.');
  //     }
  //   });
  // }


}
