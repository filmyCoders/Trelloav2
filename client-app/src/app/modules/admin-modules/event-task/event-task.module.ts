import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventTaskRoutingModule, routes } from './event-task.routes';
import { EventTaskComponent } from '../../../features/admin/event-task/event-task.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EventsComponent } from '../../../features/admin/events/events.component';
import {DragDropModule} from '@angular/cdk/drag-drop'; 
import { SharedModule } from '../../../shared/shared.module';
import { AddEventsComponent } from '../../../features/admin/add-events/add-events.component';
import { TaskComponent } from '../../../features/admin/task-folder/task/task.component';
import { EditEventComponent } from '../../../features/admin/edit-event/edit-event.component';
import { CalendarViewComponent } from '../../../features/admin/calendar-view/calendar-view.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { GetEventComponent } from '../../../features/admin/event-folder/get-event/get-event.component';

@NgModule({
  declarations: [EventTaskComponent,
    EventsComponent,AddEventsComponent,
    EditEventComponent,
    CalendarViewComponent, GetEventComponent,

  ],
  imports: [
    RouterModule.forChild(routes),   

    CommonModule,
    RouterModule ,// Correctly imports routing module
   ReactiveFormsModule,
    EventTaskRoutingModule,
    SharedModule,
    FormsModule, // Add here
    FullCalendarModule // register FullCalendar with your app

  ],
})
export class EventTaskModule { }
