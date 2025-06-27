import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskRoutingModule } from './task.routes';
import { WorkspaceComponent } from '../../../features/admin/task-folder/workspace/workspace.component';
import { TaskComponent } from '../../../features/admin/task-folder/task/task.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from "../../../shared/shared.module";
import { WorkspaceMemberComponent } from '../../../features/admin/task-folder/workspace-member/workspace-member.component';
import { TaskListComponent } from '../../../features/admin/task-folder/task-list/task-list.component';
import { RouterModule } from '@angular/router';
import { TaskList2Component } from '../../../features/admin/task-folder/task-list2/task-list2.component';



@NgModule({
  declarations: [WorkspaceComponent,
    TaskComponent,
    WorkspaceMemberComponent,
    TaskListComponent,
    TaskList2Component
    
  ],
  imports: [
    CommonModule,
    TaskRoutingModule,
    DragDropModule, // Add this line
    FormsModule,
    SharedModule,
    ReactiveFormsModule, // ✅ Add this
    RouterModule ,// Correctly imports routing module

    
],
exports:[TaskComponent]
})
export class TaskModule { }
