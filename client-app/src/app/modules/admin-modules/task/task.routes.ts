import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskComponent } from '../../../features/admin/task-folder/task/task.component';
import { WorkspaceComponent } from '../../../features/admin/task-folder/workspace/workspace.component';
import { WorkspaceMemberComponent } from '../../../features/admin/task-folder/workspace-member/workspace-member.component';
import { TaskListComponent } from '../../../features/admin/task-folder/task-list/task-list.component';
import { TaskList2Component } from '../../../features/admin/task-folder/task-list2/task-list2.component';

export const routes: Routes = [

  {
    path: '',
    component: TaskComponent,
    children: [
      { path: '', redirectTo: 'workspaces', pathMatch: 'full' },
      { path: 'workspaces', component: WorkspaceComponent }, // Child route for profile details
    ],
  },
  { path: 'open-workspace', component: TaskListComponent },
  { path: 'open-workspace2', component: TaskList2Component }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskRoutingModule { }
