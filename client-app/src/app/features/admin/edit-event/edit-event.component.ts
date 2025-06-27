import { Component } from '@angular/core';
import { BaseComponent } from '../../../shared/component/base/base.component';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/api/user.service';
import { EventsService } from '../../../core/services/api/events.service';
import { ActivatedRoute } from '@angular/router';
import { futureDateValidator } from '../../../shared/validators/validators';
import { EVENTTYPE, EventResponse, IEventParticipantShowParams, IUpdateEventRequest, IUser } from '../../../core';
import { finalize, switchMap } from 'rxjs';

@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.css'], // Fixed styleUrls typo
})
export class EditEventComponent extends BaseComponent {
  protected override onViewInit(): void {
  }
  protected override onDestroy(): void {
  }
  public isLoadingarray: boolean[] =[];

  eventTypes = Object.values(EVENTTYPE);
  isLoading: boolean = false;
  userCache: { [email: string]: IUser } = {};
  participantParams: IEventParticipantShowParams[] = [];
  eventForm!: FormGroup;
  private _eventId?: string ;
  event?: EventResponse;

  constructor(
    private _eventsService: EventsService,
    private _fb: FormBuilder,
    private _userService: UserService,
    private _route: ActivatedRoute
  ) {
    super();
  }
  protected override onInit(): void {
    debugger
    this._route.paramMap.subscribe(params => {
      let id = params.get('id') || '';
      console.log("id",id)
     this._eventId=id
      if (this._eventId) {
        this._init(id);
      } else {
        console.error('No event ID provided in the route.');
      }
    });
  }
  

  private _init(eventId: string): void {
    this.isLoading = true;

    this._eventsService
      .getEvent(eventId)
      .pipe(
        switchMap((response) => {
          this.event = response.data;
          console.log(this.event)
          this.initializeForm();
//this.populateForm(this.event)
          return []; // Returning an empty array as no further observable chaining is needed
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => console.log('Event data loaded successfully.'),
        error: (err) => console.error('Error loading event:', err),
      });
  }

  initializeForm(): void {
    this.eventForm = this._fb.group({
      title: [this.event?.title || '', [Validators.required, Validators.maxLength(100)]],
      description: [this.event?.description || '', Validators.required],
      eventDateTime: [this.event?.eventDateTime || '', [Validators.required, futureDateValidator()]],
      EventType: [EVENTTYPE.Meeting.toString(), Validators.required,,],
      participants: this._fb.array([]),
    });

    this.populateParticipants();
  }

  get participants(): FormArray {
    return this.eventForm.get('participants') as FormArray;
  }

  addParticipant(): void {
    const participantGroup = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      userId:['']
    });
    this.participants.push(participantGroup);
  }

  removeParticipant(index: number): void {
    this.participants.removeAt(index);
  }

  private populateParticipants(): void {
    if (this.event?.participants) {
      this.event.participants.forEach((participant) => {
        const participantGroup = this._fb.group({
          email: [participant.email, [Validators.required, Validators.email]],
          userId: [participant.userId || ''],
        });
        this.participants.push(participantGroup);
      });
    }
  }
  onSubmit(): void {
    if (this.eventForm.invalid) {
      return;
    }

    const updatedEvent = this.eventForm.value;
    this.isLoading = true;

    this._eventsService
      .updateEvent(updatedEvent)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          console.log('Event updated successfully');
          // Redirect or show a success message
        },
        error: (err) => {
          console.error('Error updating event:', err);
        }
      });
  }
// Method to patch values into the form
patchProfileForm(data:IEventParticipantShowParams ): void {
  const participent=this.event?.participants
  this.eventForm.patchValue({
    email:data.email,
    pic:data.profilepic
  });

}
  private populateForm(event: EventResponse): void {
    // Populate main form fields
    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      eventDateTime: event.eventDateTime,
      EVENTTYPE: event.type
    });

    // Populate participants
    event.participants.forEach((participant) => {
      this.participants.push(
        this._fb.group({
          email: [participant.email, [Validators.required, Validators.email]],
          userId: [participant.userId],
          
          
        })
      );
    });
  }
  saveEvent(): void {
    if (this.eventForm.invalid) {
      console.error('Form is invalid');
      return;
    }

    const updatedEvent: IUpdateEventRequest = this.eventForm.value;
    this.isLoading = true;

    this._eventsService
      .updateEvent(updatedEvent)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => console.log('Event updated successfully'),
        error: (err) => console.error('Error updating event:', err),
      });
  }
  
}
