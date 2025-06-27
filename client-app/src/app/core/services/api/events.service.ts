import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IAddEventRequest, IUpdateEventRequest } from '../../models/request/events/event-request.param';
import { EVENT_ADD, EVENT_GET_BY_ID, EVENT_LIST, EVENT_UPDATE, EventResponse, Events, IEventModelPopupShowParams, ResponseBase } from '../..';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  
  // Observable to watch for updated event notifications
  private eventId = new BehaviorSubject<IEventModelPopupShowParams | null>(null);
  selectedEvent: Observable<IEventModelPopupShowParams | null> = this.eventId.asObservable();
 constructor(private _httpClient: HttpClient,private _router:Router,) { 
}

 // Emit a new event
 showModelEvent(eventParams: IEventModelPopupShowParams): void {
  if (this.eventId.getValue()) {
    // Prevent opening another modal if one is already open
    return;
  }
  this.eventId.next(eventParams);
}
// Clear the subject when the modal is closed
clearModelEvent(): void {
  this.eventId.next(null); // Reset the BehaviorSubject to null
}

addEvents (req: IAddEventRequest): Observable<ResponseBase<any>> {
   
  console.log("Service Check",req)
  return this._httpClient.post<ResponseBase<boolean>>(EVENT_ADD, req);
}

getAllEvents(): Observable<ResponseBase<any>> {
  return this._httpClient.get<ResponseBase<EventResponse[]>>(EVENT_LIST
  );
  }

  getEvent(id: string): Observable<ResponseBase<EventResponse>> {
    debugger
    console.log(id)
    const params = new HttpParams().set('eventId', id); // Set query parameter
    return this._httpClient.get<ResponseBase<EventResponse>>(EVENT_GET_BY_ID, { params });
  }
  updateEvent (req: IUpdateEventRequest): Observable<ResponseBase<any>> {
   
    console.log("Service Check",req)
    return this._httpClient.post<ResponseBase<any>>(EVENT_UPDATE, req);
    
  }
  

}
