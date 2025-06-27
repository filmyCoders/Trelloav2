import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventTaskComponent } from '../../../features/admin/event-task/event-task.component';
import { EventsComponent } from '../../../features/admin/events/events.component';
import { AddEventsComponent } from '../../../features/admin/add-events/add-events.component';
import { TaskComponent } from '../../../features/admin/task-folder/task/task.component';
import { EditEventComponent } from '../../../features/admin/edit-event/edit-event.component';
import { CalendarViewComponent } from '../../../features/admin/calendar-view/calendar-view.component';

export const routes: Routes = [
  {
    path: '',
    component: EventTaskComponent,
    children: [
     { path: '', redirectTo: 'task', pathMatch: 'full' }, // Redirect to profile-details by default
      //  { path: 'task', component: TaskComponent }, // Child route for profile details
       { path: 'event', component: EventsComponent }, // Child route for change password
       { path: 'add-event', component: AddEventsComponent }, // Child route for change password
       { path: 'edit-event', component: EditEventComponent }, // Child route for change password
       { path: 'calender', component: CalendarViewComponent }, // Child route for change password
       { path: 'task', loadChildren: () => import('../task/task.module').then(m => m.TaskModule) },
       
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventTaskRoutingModule { }
