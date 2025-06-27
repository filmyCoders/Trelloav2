import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BaseComponent } from '../../../../shared/component/base/base.component';
import Modal from 'bootstrap/js/dist/modal';
import { EVENTTYPE, EventResponse, IEventModelPopupShowParams, IEventParticipantRequest, IEventParticipantShowParams, IUpdateEventRequest } from '../../../../core';
import { Subscription, catchError, debounceTime, finalize, of, switchMap } from 'rxjs';
import { EventsService } from '../../../../core/services/api/events.service';
import { futureDateValidator, markFormGroupTouched } from '../../../../shared/validators/validators';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/api/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-get-event',
  templateUrl: './get-event.component.html',
  styleUrls: ['./get-event.component.css'], // Corrected "styleUrl" to "styleUrls"
})
export class GetEventComponent extends BaseComponent {
  //#region Propert/ies and ViewChild References
  @Output() modalClose = new EventEmitter<any>(); // Event emitter to notify parent when modal is closed
  @ViewChild('eventdata') showEventModelRef!: ElementRef; // Reference to the "show event" modal
  @ViewChild('editEvent') editEventModelRef!: ElementRef; // Reference to the "edit event" modal

  private showEventModal: Modal | null = null; // Modal instance for "show event"
  private editEventModal: Modal | null = null; // Modal instance for "edit event"

  private eventSubscription!: Subscription;


  errorMessages: boolean[] = [];
  userExistError: boolean = false
  modelType?: IEventModelPopupShowParams; // Type of modal to display (show/edit)
  selectedEvent?: EventResponse; // Data for the currently selected event
  reqmodel?: IUpdateEventRequest;
  public isLoading: boolean = false; // Loading indicator
  isLoadingArray: boolean[] = [];
  selectedEventId?: string; // ID of the selected event
  public EVENTTYPE = Object.values(EVENTTYPE); // Array of event types
  eventType: EVENTTYPE = EVENTTYPE.Meeting; // Default event type
  eventColor: string = 'red'; // Event color
  eventId: string | undefined; // ID of the event to fetch
  participantParams: IEventParticipantShowParams[] = []; // Participant parameters
  profilePicArray: string[] = [];
  // Form group for editing events
  public editForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(100)]), // Title
    description: new FormControl('', Validators.required), // Description
    eventDateTime: new FormControl('', [Validators.required, futureDateValidator()]), // Event date/time
    EventType: new FormControl('', Validators.required), // Event type
    participants: new FormArray([
      new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
        userId: new FormControl('')

      }),
    ]), // Participants array
  });

  //#endregion

  //#region Constructor and Lifecycle Hooks

  constructor(private _eventsService: EventsService,
    private _userServices: UserService,
    private _fb: FormBuilder,
    private toastr: ToastrService,
    private _routing: Router

  ) {
    super();
  }

  protected override onInit(): void {

    this._eventsService.selectedEvent.subscribe((params) => {
      debugger;
      console.log('model type', params);
      if (params) {
        this.modelType = params;
        this.eventId = params.eventId;
        this.getEventData();
      }
    });
  }

  protected override onViewInit(): void {
    this.showEventModal = new Modal(this.showEventModelRef.nativeElement); // Initialize "show event" modal
    this.editEventModal = new Modal(this.editEventModelRef.nativeElement); // Initialize "edit event" modal
  }

  protected override onDestroy(): void {
    this.closeModel('show'); // Close "show event" modal
    this.closeModel('edit'); // Close "edit event" modal

  }

  //#endregion

  openModel(params: IEventModelPopupShowParams) {
    if (params) {
      this.modelType = params;
      this.eventId = params.eventId;
      this.getEventData();
    }

  }

  //#region Edit Event Logic

  public openEditUserModal(): void {
    // Populate form controls with selected event data
    this.editForm.controls['title'].setValue(this.selectedEvent?.title || '');
    this.editForm.controls['description'].setValue(this.selectedEvent?.description || '');
    let eventType = this.getEventTypeValue(this.selectedEvent?.type || 'Meeting', false) as string;
    this.editForm.controls.EventType.setValue(eventType);

    let date = this.convertUtcToLocal(this.formatDateTime(this.selectedEvent?.eventDateTime));
    this.editForm.controls['eventDateTime'].setValue(date || '');

    // Reset participants FormArray
    const participantsArray = this._fb.array(
      this.selectedEvent?.participants?.map((p) =>
        this._fb.group({
          email: [p.email, [Validators.required, Validators.email]],
          userId: [p.userId]

        })
      ) || []
    );
    this.editForm.setControl('participants', participantsArray);

    // Show the edit modal
    this.editEventModal?.show();
  }

  addParticipant(): void {
    const participantGroup = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      userId: [''],
    });
    this.participants.push(participantGroup); // Add participant to the FormArray
  }

  removeParticipant(index: number): void {
    this.participants.removeAt(index); // Remove participant from the FormArray
    this.profilePicArray.splice(index, 1); // Remove the corresponding item from the profilePicArray
  }

  public getEventTypeValue(type: string | number, flag: boolean): string | number {
    const eventTypeMap: { [key: string]: number } = {
      Meeting: 0,
      Workshop: 1,
      Conference: 2,
      Webinar: 3,
      Other: 4,
    };

    if (flag) {
      // Convert string to number
      return eventTypeMap[type as string] ?? 0;
    } else {
      // Convert number to string
      const reverseEventTypeMap = Object.entries(eventTypeMap).reduce(
        (acc, [key, value]) => ({ ...acc, [value]: key }),
        {} as { [key: number]: string }
      );
      return reverseEventTypeMap[type as number] ?? 'Meeting';
    }
  }

  get participants(): FormArray {
    return this.editForm.get('participants') as FormArray; // Get the FormArray for participants
  }

  //#endregion

  //#region  Fetch User Data
  fetchUserDetails(event: Event, index: number): void {
    // Extract the email value from the event safely
    const emailValue = (event.target as HTMLInputElement)?.value?.trim();

    // Exit if the email is empty
    if (!emailValue) return;

    // Start loader for the specific index
    this.isLoadingArray[index] = true;

    // Make an API call to fetch user details by email
    this._userServices.getUserDetailsByEmails(emailValue)
      .pipe(
        debounceTime(300), // Add a debounce to limit rapid API calls
        switchMap((response) => {
          if (response.flag) {
            // Successful API response

            let user = response.data;
            let userExists = this.participantIsExistOrNot(user.id);
            if (userExists) {
              console.log('User already exists!');
              this.userExistError = true
            } else {
              this.userExistError = false

              console.log('User does not exist.');
            }
            this.profilePicArray[index] = user.profileImageUrl
            // Update form and participant data
            this.participants.at(index).patchValue({
              userId: user.id,
              email: user.email,
            });

            // Clear error messages for the current index
            this.errorMessages[index] = false;
          } else {
            // Handle scenario where user details are not found
            this.participants.at(index).patchValue({ errorMessage: true });
            this.errorMessages[index] = true;
            this.profilePicArray[index] = ""
          }

          return []; // Return an empty observable for switchMap to complete properly
        }),
        catchError(() => this.handleFetchError(emailValue, index)), // Handle API errors
        finalize(() => {
          // Stop the loader for the specific index
          this.isLoadingArray[index] = false;
        })
      )
      .subscribe(); // Subscribe to execute the observable pipeline
  }



  /** Helper: Handle fetch error */
  private handleFetchError(emailValue: string, index: number) {
    this.errorMessages[index] = true;

    this.participants.at(index).patchValue({
      userId: '',
      errorMessage: true,
    });

    this.updateParticipantParams(index, '', emailValue, null);

    return of(null); // Return an observable with null to avoid breaking the stream
  }

  /** Helper: Update participant parameters */
  private updateParticipantParams(index: number, userId: string, email: string, profilepic: string | null) {
    this.participantParams[index] = {
      ...this.participantParams[index], // Preserve existing properties
      userId,
      email,
      profilepic,

    };
    this.isLoadingArray[index] = false

  }

  //#endregion




  //#region Add Event Section Save From Database
  checkEvent(): void {
    debugger;
    if (this.editForm.invalid) {
      markFormGroupTouched(this.editForm);
      return;
    }

    const eventDate = this.editForm.controls['eventDateTime'].value
      ? new Date(this.editForm.controls['eventDateTime'].value + ':00.000').toISOString().replace('Z', '')
      : '';
    const type = this.getEventTypeValue(this.editForm.controls['EventType'].value ?? '', true);
    let eventParticipants = this.editForm.controls['participants'].value ?? [];

    // Map participants to ensure email and userId are present
    eventParticipants = eventParticipants.map(participant => ({
      ...participant,
      email: participant.email ?? '',
      userId: participant.userId ?? ''
    }));

    console.log('Form Data:', eventParticipants);

    const reqModel: IUpdateEventRequest = {
      id: this.selectedEvent?.id ?? '',
      title: this.editForm.controls['title'].value ?? '',
      description: this.editForm.controls['description'].value ?? '',
      eventDateTime: eventDate,
      type: type as number,
      eventParticipants: eventParticipants as IEventParticipantRequest[],
    };

    this.reqmodel = reqModel
    this.isLoading = true;

    this._eventsService.updateEvent(reqModel)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.flag) {
            this.toastr.success('Event updated successfully.');
            this.reqmodel = reqModel

            this._routing.navigate(['../admin/event-task/event']); // Navigate to the event component

            this.closeModel('edit');
          } else {
            this.toastr.error('Failed to update the event.');
          }
        },
        error: (error) => {
          this.toastr.error('An error occurred while updating the event.');
          console.error(error);
        },
      });
  }

  //#endregion

  addEvent(eventData: IUpdateEventRequest): void {
    this._eventsService.updateEvent(eventData).subscribe({
      next: (response) => {
        if (response.flag) {
          this.toastr.success('Event added successfully!');
        } else {
          this.toastr.error('Failed to add event: ' + response.message);
        }
      },
      error: (err) => console.error('Error adding event:', err),
    });
  }






  //#region Modal Handling

  closeModel(type: string): void {
    this._eventsService.clearModelEvent(); // Clear the data after closing the modal
    this.modalClose.emit(this.reqmodel); // Emit updated data back to parent

    if (type == 'edit') this.editEventModal?.hide();
    else this.showEventModal?.hide();


  }

  openShowEventModal(): void {
    this.showEventModal?.show(); // Open "show event" modal
  }

  //#endregion

  //#region Event Data Fetching

  getEventData(): void {
    if (!this.eventId) {
      console.error('Event ID is undefined. Cannot open modal.');
      return;
    }

    this.isLoading = true; // Set loading indicator
    this._eventsService
      .getEvent(this.eventId)
      .pipe(finalize(() => (this.isLoading = false))) // Finalize to hide loading indicator
      .subscribe({
        next: (response) => {
          this.selectedEvent = response.data; // Set selected event data
          this.participantParams = response.data.participants; // Set participant parameters

          console.log('Selected Event', this.selectedEvent);
          this.getEventTypeValue(this.selectedEvent.type, true);
          this.profilePicArray = this.selectedEvent.participants.map(res => res.profilepic)
          if (this.modelType?.type == 'edit') {
            this.openEditUserModal();
            this.closeModel("show")
          } else {
            this.closeModel("edit")

            this.openShowEventModal();

          }
          console.log('Form Data after populating:', this.editForm.value); // Log form data
        },
        error: (err) => console.error('Error loading event:', err),
      });
  }

  //#endregion

  //#region Helper Methods

  getEventTypeColor(type: any): string {
    switch (type) {
      case 0:
        this.eventType = EVENTTYPE.Meeting;
        return '#007bff'; // Blue
      case 1:
        this.eventType = EVENTTYPE.Workshop;
        return '#28a745'; // Green
      case 2:
        this.eventType = EVENTTYPE.Conference;
        return '#dc3545'; // Red
      case 3:
        this.eventType = EVENTTYPE.Webinar;
        return '#dc3545'; // Red
      case 4:
        this.eventType = EVENTTYPE.Other;
        return '#dc3545'; // Red
      default:
        return '#6c757d'; // Gray
    }
  }

  participantIsExistOrNot(userId: string): boolean {
    return this.participantParams.some(res => res.userId === userId);
  } //#endregion
}
