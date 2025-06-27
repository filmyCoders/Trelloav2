import { EVENTTYPE } from "../../..";

export interface IAddEventRequest {
    title: string;
    description: string;
    eventDateTime: string |undefined;
    type: number;
    eventParticipants: IEventParticipantRequest[];
}




export interface IUpdateEventRequest {
    id: string;
    title: string | null;
    description: string;
    eventDateTime: string;
    type: number;
    eventParticipants: IEventParticipantRequest[];
}
export interface IEventParticipantRequest {
    userId: string;
    email: string;
}
export interface IEventParticipantShowParams {
    userId: string;
    email: string;
    profilepic:any
}
