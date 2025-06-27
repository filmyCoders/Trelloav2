import { EVENTTYPE, IUser } from "..";

export interface Events {
    id: string;
    title: string;
    description: string;
    eventDateTime: string|undefined;

    createdByUserId: string;
    type: EVENTTYPE;
    participants: EventParticipant[];
}

export interface EventParticipant {
    id: string;
    eventId: string;
    event: Event;
    userId: string;
    email: string;
}

export interface EventResponse {
    id: string;
    title: string;
    description: string;
    eventDateTime: string; // Keep as string for ISO format or parse to Date
    createdByUserId: string ;
    type: EVENTTYPE;
    participants: EventParticipantResponse[];
  }

  export interface EventParticipantResponse {
      userId: string;
      email: string;
      profilepic:string
  }  

  export interface IEventModelPopupShowParams {
    eventId: string;
    type: string;
}  