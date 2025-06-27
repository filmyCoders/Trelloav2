import { Component, OnInit, OnDestroy } from '@angular/core';
import { BaseComponent } from '../../../shared/component/base/base.component';
import { ActiveLinksService, EVENTTYPE, EventResponse, EventsService, IAddEventRequest, IEventParticipantShowParams, IUser, UserService } from '../../../core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, catchError, debounceTime, switchMap, of, finalize, map } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { futureDateValidator, markFormGroupTouched } from '../../../shared/validators/validators';

@Component({
  selector: 'app-add-events',
  templateUrl: './add-events.component.html',
  styleUrls: ['./add-events.component.css']
})
export class AddEventsComponent extends BaseComponent implements OnDestroy {
  protected override onDestroy(): void {
    throw new Error('Method not implemented.');
  }
  public isLoading: boolean[] =[];
  public userCache: { [email: string]: IUser } = {}; 
  public participantParam:IEventParticipantShowParams[]=[]
  eventTypes = Object.values(EVENTTYPE);
  profileImagePreview: (string | ArrayBuffer | null)[] = [];
  public user!: IUser;
  eventForm!: FormGroup;
  errorMessages: boolean[] = []; 

  constructor(
    private _eventsService: EventsService, 
    private _fb: FormBuilder, 
    private _userServices: UserService,
    private toastr: ToastrService,
    private activeLinksService:ActiveLinksService
  ) {
    super();
  }

  protected override onInit(): void {

    this.activeLinksService.activeLink(true);

    this.initializeForm();
  }

  protected override onViewInit(): void {}

  // Rename onDestroy to ngOnDestroy to match Angular's lifecycle hook naming convention
  override ngOnDestroy(): void {
    this.activeLinksService.activeLink(false);

    // Cleanup logic here if needed
  }

  initializeForm(): void {
    this.eventForm = this._fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['',Validators.required],
      eventDateTime: ['', [Validators.required, futureDateValidator()]],
      EventType: [EVENTTYPE.Meeting.toString(), Validators.required,,],
      participants: this._fb.array([]) 
    });
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





  //#region Add Event Section Save From Database
  checkEvent(): void {
    if (this.eventForm.invalid) {
      markFormGroupTouched(this.eventForm);
      return;
    }

    const eventDate = this.eventForm.controls['eventDateTime'].value
      ? new Date(this.eventForm.controls['eventDateTime'].value + ':00.000').toISOString().replace('Z', '')
      : '';

    const type = this.getEventTypeValue(this.eventForm.controls['EventType'].value);

    const reqModel: IAddEventRequest = {
      title: this.eventForm.controls['title'].value ?? '',
      description: this.eventForm.controls['description'].value ?? '',
      eventDateTime: eventDate,
      eventParticipants: this.eventForm.controls['participants'].value ?? [],
      type: type
    };

    this.addEvent(reqModel);
  }

  private getEventTypeValue(type: string): number {
    switch (type) {
      case 'Meeting': return 0;
      case 'Workshop': return 1;
      case 'Conference': return 2;
      case 'Webinar': return 3;
      case 'Other': return 4;
      default: return 0;
    }
  }

  addEvent(eventData: IAddEventRequest): void {
    this._eventsService.addEvents(eventData).subscribe({
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
 

  //#endregion
 



  fetchUserDetails(event: Event, index: number): void {
    const emailValue = (event.target as HTMLInputElement)?.value?.trim(); // Safely get the email value
  
    if (!emailValue) return; // Exit if email is empty
  
    this.isLoading[index]=true; // Start loader
  
    this._userServices.getUserDetailsByEmails(emailValue)
      .pipe(
        debounceTime(300), // Reduce API calls
        switchMap(response => response.flag ? this.handleValidUserResponse(response.data, index) : this.handleInvalidUserResponse(emailValue, index)),
        catchError(() => this.handleFetchError(emailValue, index)),
        finalize(() => this.isLoading[index]=false) // Stop loader
      )
      .subscribe();
  }
  
  /** Helper: Handle valid user response */
  private handleValidUserResponse(user: any, index: number) {
    this.errorMessages[index] = false;
  
    // Update form and participant data
    this.participants.at(index).patchValue({
      userId: user.id,
      email: user.email,
      errorMessage: false,
    });
  
    this.updateParticipantParams(index, user.id, user.email, '');
  
    // Fetch and update profile image
    return this._userServices.getImage(user.profileImageUrl).pipe(
      map(blob => {
        const objectURL = URL.createObjectURL(blob);
        this.participantParam[index].profilepic = objectURL ; // Update profile pic
        this.isLoading[index]=false
        return user; // Return user object for any further processing
      })
    );
  }
  
  /** Helper: Handle invalid user response */
  private handleInvalidUserResponse(emailValue: string, index: number) {
    this.errorMessages[index] = true;
  
    this.participants.at(index).patchValue({
      userId: '',
      errorMessage: true,
    });
  
    this.updateParticipantParams(index, '', emailValue, null);
  
    return of(null); // Return an observable with null to avoid breaking the stream
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
    this.participantParam[index] = {
      ...this.participantParam[index], // Preserve existing properties
      userId,
      email,
      profilepic,
      
    };
    this.isLoading[index]=false

  }
  
 
}
