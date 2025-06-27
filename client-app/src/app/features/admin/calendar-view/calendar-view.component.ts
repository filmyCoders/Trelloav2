import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, finalize, tap, map } from 'rxjs/operators';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import * as moment from 'moment';
import { EventResponse, IEventModelPopupShowParams } from '../../../core';
import { EventsService } from '../../../core/services/api/events.service';
import { BaseComponent } from '../../../shared/component/base/base.component';
import { GetEventComponent } from '../event-folder/get-event/get-event.component';

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css'],
})
export class CalendarViewComponent extends BaseComponent {
  @ViewChild(GetEventComponent) popupModalsComponent!: GetEventComponent;

  protected override onInit(): void {
    this._init();

  }
  protected override onViewInit(): void {
  }
  protected override onDestroy(): void {
    this._eventsService.clearModelEvent();

  }
  
  events: EventResponse[] = [];
  isLoading :boolean= false;

  constructor(private _eventsService: EventsService) {
    super();
  }
  

  // Method to open modal with event ID
  openEventModal(eventId: string): void {
      let data:IEventModelPopupShowParams={
        eventId:eventId,
        type:"show"
      }
      if (eventId) {
        // this._eventsService.showModelEvent(data); // Emit the selected event ID
        this.popupModalsComponent.openModel(data)
      }
  //  this._eventsService.showModelEvent(data,); // Emit the selected event ID
  }
  handleEventClick(arg: any) {
    const eventId = arg.event.id;
    this.openEventModal(eventId);
  }
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, bootstrapPlugin],
    themeSystem: 'bootstrap',
    initialView: 'dayGridMonth',
    weekends: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    eventClick: this.handleEventClick.bind(this), // Attach the event click handler
    eventBackgroundColor:"White",
    // eventBorderColor:"white",
    // eventColor:"green",
    // eventTextColor:"red",

    events: (info, successCallback, failureCallback) => {
      this._loadEvents().subscribe({
        next: (events) => {
          const mappedEvents = events.map((event) => ({
            id: event.id,
            title: event.title,
            start: moment.utc(event.eventDateTime).local().toISOString(),
            description: event.description,
            extendedProps: {
              type: event.type,
            },
            classNames: [`event-type-${event.type}`],
          }));
          successCallback(mappedEvents);
        },
        error: (err) => failureCallback(err),
      });
    },
    eventContent: this.customEventContent.bind(this), // Ensure proper `this` context
    dayMaxEvents: 3,
  };


  private _init(): void {
    this.isLoading = true;
    this._loadEvents()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (events) => {
          this.events = events;
          this.calendarOptions.events = this.events.map((event) => ({
            id: event.id,
            title: event.title,
            start: moment.utc(event.eventDateTime).local().toISOString(),
            extendedProps: { type: event.type },
          }));
        },
        error: (err) => console.error('Error loading events:', err),
      });
  }
  
  private _loadEvents(): Observable<EventResponse[]> {
    return this._eventsService.getAllEvents().pipe(
      map((response) => response.data || []),
      tap((events) => {
        this.events = events.map((event) => ({
          ...event,
          eventDateTime: this.formatDate(event.eventDateTime),
        }));
      })
    );
  }

  

  getEventTypeColor(type: number): string {
    switch (type) {
      case 0:
        return '#007bff'; // Blue
      case 1:
        return '#28a745'; // Green
      case 2:
        return '#dc3545'; // Red
      default:
        return '#6c757d'; // Gray
    }
  }

  customEventContent(arg: any) {
    const { title, extendedProps } = arg.event;
    const type = extendedProps.type;
    const color = this.getEventTypeColor(type);
    return {
      html: `
        <div class="custom-event">
          <span class="event-dot" style="color: ${color};"></span>
          <span class="event-title" style="color:black;; font-weight: bold; margin-right: 5px;" click=openEventModal(${this.events})>${title}</span>
          <div class="custom-event">
          <span class="event-dot" style="background-color: ${this.getEventTypeColor(arg.event.extendedProps.type)};"></span>
          <span class="event-title">${arg.event.title}</span>
        </div>
        </div>
      `,
    };
  }
}
