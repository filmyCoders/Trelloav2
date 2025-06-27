import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { BaseComponent } from '../../../../shared/component/base/base.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActiveLinksService, IAddTaskCardRequest, IAddTaskListRequest, ITaskList, ITaskListOrderUpdate, ITaskOrderUpdate, IUpdateTaskListOrderRequest, IUpdateTaskListRequest, IUpdateTaskOrderRequest, IWorkspace, TaskCard, TaskCardResponseFoTasklist, TaskService, TaskStatus } from '../../../../core';
import { Observable, finalize, map, of, switchMap, tap } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { markFormGroupTouched } from '../../../../shared';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceMemberComponent } from '../workspace-member/workspace-member.component';
import { SignalRServiceService } from '../../../../core/services/signalR/signal-rservice.service';

interface MousePosition {
  userId: string;
  userName: string;
  x: number;
  y: number;
}
@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent extends BaseComponent {
  @ViewChild(WorkspaceMemberComponent) openWorkpaceMember!: WorkspaceMemberComponent;

  showListInput = false; // Add List Input Box Visibility
  showCardInput: { [key: number]: boolean } = {}; // Tracks visibility for each list
  public messages: { user: string, message: string }[] = [];
  public message!: string;
  public user!: string;

  private _workspaceId!: string;  // Set workspace ID dynamically
  tasklists: ITaskList[] = [];
  taskCard!: TaskCard;
  addTaskList!: IAddTaskListRequest;
  workspace!: IWorkspace;
  public isLoading: boolean = false;
  heldCards: { colIndex: number, taskIndex: number } | null = null;
  
  
  private userId = 'user123'; // Replace with actual user ID
  private cursors: { [key: string]: { x: number; y: number } } = {};
  mousePositions: { userId: any; x: number; y: number }[] = [];

  mousePositions1: { [key: string]: MousePosition & { prevX: number, prevY: number, angle: number } } = {};  public addTasklistForm = new FormGroup({
    taskListName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
  });

  public addTaskCardForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(50)]),
  });

  constructor(
    private _taskService: TaskService,
    private _route: ActivatedRoute,
    private _router: Router,
    private activeLinksService: ActiveLinksService,
    private signalRService: SignalRServiceService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef for manual change detection
  ) {
    super();
  }

  protected override onInit(): void {
    this._route.queryParams.subscribe(params => {
      this._workspaceId = params['id'];
      console.log("Workspace ID:", this._workspaceId);
      this.loadWorkspace();
      this._init();
    });



    this.signalRService.startConnection();

    this.signalRService.receiveMessage((user: string, message: string) => {
      this.messages.push({ user, message });
      
    });
     // Listen for mouse move events from the server
     this.signalRService.onMouseMove((userId: string, x: number, y: number) => {
      console.log(`Received MouseMove: UserId=${userId}, X=${x}, Y=${y}`);
      this.mousePositions.push({ userId, x, y });
    });
  
    //Listen for drag-and-drop events
    this.signalRService.onTaskMoved((data) => {
      const task = this.findTask(data.taskId, data.fromColumnId);
      if (task) {
        this.moveTask(task, data.fromColumnId, data.toColumnId, data.newIndex);
        this.cdr.detectChanges(); // Trigger change detection
      }
    });

    this.signalRService.onMouseMove((userId, x, y) => {
      this.cursors[userId] = { x, y };
      this.updateCursorPosition(userId, x, y);
    });

    document.addEventListener('mousemove', (event) => {
      const x = event.clientX;
      const y = event.clientY;
      this.signalRService.sendMouseMove(this.userId, x, y);
    });




  }

 private updateCursorPosition(userId: string, x: number, y: number): void {
    let cursorElement = document.getElementById(userId);
    if (!cursorElement) {
      cursorElement = document.createElement('div');
      cursorElement.id = userId;
      cursorElement.classList.add('user-cursor');
      document.body.appendChild(cursorElement);
    }
    cursorElement.style.left = `${x}px`;
    cursorElement.style.top = `${y}px`;
  }


  public sendMessage(): void {
    this.signalRService.sendMessage(this.workspace.createdByUserId, this.message);
    this.message = '';
  }
  protected override onViewInit(): void {}
  protected override onDestroy(): void {}

  openWorkspaceMember() {
    console.log(this._workspaceId);
    this.openWorkpaceMember.openWorkspaceMember(this._workspaceId);
  }


  
  // Find a task by ID and column ID
  findTask(taskId: string, columnId: string) {
    const column = this.tasklists.find((col) => col.listId === columnId);
    return column?.cards.find((task) => task.taskCardId === taskId);
  }

  // Move a task between columns
  moveTask(task: any, fromColumnId: string, toColumnId: string, newIndex: number) {
    const fromColumn = this.tasklists.find((col) => col.listId === fromColumnId);
    const toColumn = this.tasklists.find((col) => col.listId === toColumnId);

    if (fromColumn && toColumn) {
      const taskIndex = fromColumn.cards.indexOf(task);
      if (taskIndex !== -1) {
        fromColumn.cards.splice(taskIndex, 1);
        toColumn.cards.splice(newIndex, 0, task);
      }
    }
  }

  // Get keys for mouse positions
  getMousePositionKeys() {
    return Object.keys(this.mousePositions);
  }

  //#region Load Data

  public _init(): void {
    this.isLoading = true;

    this._loadTaskList()
      .pipe(
        switchMap((events) => of([])), // Return an empty observable if no events are present
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (tasklist) => {
          console.log('User details fetched successfully:', tasklist);
        },
        error: (err) => console.error('Error during operation:', err),
      });
  }

  private _loadTaskList(): Observable<ITaskList[]> {
    return this._taskService.getTaskListAll(this._workspaceId).pipe(
      tap((response) => {
        console.log("Response data", response);
        this.tasklists = response?.data ?? [];
      }),
      map((response) => response?.data ?? [])
    );
  }

  public loadWorkspace(): void {
    this.isLoading = true;

    this._taskService.getWorkspaceById(this._workspaceId)
      .pipe(
        map((response) => response?.data ?? []),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (workspace) => {
          console.log('Workspace fetched successfully:', workspace);
          this.workspace = workspace;
        },
        error: (err) => console.error('Error during operation:', err),
      });
  }

  //#endregion

  //#region Drag and Drop

  onTaskCardDrop1d(event: CdkDragDrop<any[]>): void {
    console.log(`Task Card moved from index ${event.previousIndex} to ${event.currentIndex}`);

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const movedCard = event.container.data[event.currentIndex];
      movedCard.taskListId = event.container.id;
    }

    event.container.data.forEach((taskCard, index) => {
      taskCard.position = index + 1;
    });

    const updates = event.container.data.map((taskCard, index) => ({
      taskCardId: taskCard.taskCardId,
      newTaskListId: event.container.id,
      newPosition: index + 1,
      title: taskCard.title
    }));

    const request: IUpdateTaskOrderRequest = {
      taskOrderUpdates: updates
    };

    this._taskService.updateTaskCardOrder(request).subscribe(
      response => {
        console.log('Task Card order updated:', response);
      },
      error => {
        console.error('Error updating task card order:', error);
      }
    );
  }

  onTaskListDrop(event: CdkDragDrop<any[]>) {
    console.log(`Drag started from index ${event.previousIndex} to index ${event.currentIndex}`);

    if (event.previousContainer === event.container) {
      moveItemInArray(this.tasklists, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    this.tasklists.forEach((task, index) => {
      task.displayOrder = index + 1;
    });

    const updates = this.tasklists.map(task => ({
      listId: task.listId,
      displayOrder: task.displayOrder
    }));

    const request: IUpdateTaskListOrderRequest = {
      workSpaceId: this._workspaceId,
      taskListOrderUpdates: updates
    };

    this._taskService.updateTaskListOrder(request).subscribe(
      response => {
        console.log('Order updated successfully:', response);
      },
      error => {
        console.error('Error updating order:', error);
      }
    );
  }

  get connectedCardDropLists(): string[] {
    return this.tasklists.map(list => list.listId);
  }

  get connectedDropLists(): string[] {
    return this.tasklists.map(list => list.listId);
  }

  //#endregion

  //#region Task List CRUD

  toggleAddList(): void {
    this.showListInput = !this.showListInput;
    if (!this.showListInput) {
      this.addTasklistForm.reset();
    }
  }

  public saveTaskList(): void {
    if (this.addTasklistForm.valid) {
      this.isLoading = true;

      let req: IAddTaskListRequest = {
        listName: this.addTasklistForm.controls["taskListName"].value ?? "",
        workSpaceId: this._workspaceId ?? "",
        displayOrder: this.tasklists.length + 1
      };

      this._taskService.addTaskList(req)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            if (response.flag) {
              this.toaster.showSuccessToast(response.message);
              this._init();
              this.tasklists.push(response.data);
              this.addTasklistForm.reset();
              this.addTasklistForm.markAsUntouched();
              this.toggleAddList();
            } else {
              this.toaster.showErrorToast(response.message);
            }
          },
          error: (error) => {
            console.error(error);
            this.toaster.showErrorToast(error.error?.error || 'Workspace creation failed!');
          }
        });
    } else {
      markFormGroupTouched(this.addTasklistForm);
    }
  }

  deleteList(list: ITaskList) {
    this._taskService.deleteTaskList(list.listId).subscribe({
      next: (response) => {
        if (response.flag) {
          this.toaster.showSuccessToast(response.message);
          this.tasklists = this.tasklists.filter(task => task.listId !== list.listId);
        } else {
          this.toaster.showErrorToast(response.message);
        }
      },
      error: (error) => {
        console.error(error);
        this.toaster.showErrorToast(error.error?.error || 'Failed to delete task list');
      }
    });
  }

  //#endregion

  //#region Card Task

  toggleAddCard(listIndex: number) {
    if (this.showCardInput[listIndex]) {
      this.showCardInput[listIndex] = false;
      return;
    }

    this.showCardInput = {};
    this.showCardInput[listIndex] = true;
  }

  public saveTaskCard(tasklist: ITaskList, index: number): void {
    if (this.addTaskCardForm.valid) {
      this.isLoading = true;

      let req: IAddTaskCardRequest = {
        title: this.addTaskCardForm.controls["title"].value ?? "",
        taskListId: tasklist.listId ?? "",
      };

      this._taskService.addTaskCard(req)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            if (response.flag) {
              const taskCard = response.data;
              this.toaster.showSuccessToast(response.message);

              const newTaskCard: TaskCardResponseFoTasklist = {
                taskCardId: taskCard.taskCardId,
                title: req.title,
                taskListId: tasklist.listId,
                coverImage: taskCard.coverImage,
                createdAt: taskCard.completedAt ?? '',
                progress: taskCard.progress,
              };

              const taskListToUpdate = this.tasklists.find((list) => list.listId === tasklist.listId);
              if (taskListToUpdate) {
                if (!taskListToUpdate.cards) {
                  taskListToUpdate.cards = [];
                }
                taskListToUpdate.cards.push(newTaskCard);
              }

              this._init();
              this.addTaskCardForm.reset();
              this.addTasklistForm.markAsUntouched();
              this.showCardInput[index] = false;
            } else {
              this.toaster.showErrorToast(response.message);
            }
          },
          error: (error) => {
            console.error(error);
            this.toaster.showErrorToast(error.error?.error || 'Workspace creation failed!');
          }
        });
    } else {
      markFormGroupTouched(this.addTasklistForm);
    }
  }

  public deleteTaskCard(id: string) {
    this.isLoading = true;
    if (id) {
      this._taskService.deleteTaskCard(id)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            if (response.flag) {
              this.toaster.showSuccessToast(response.message);
              this._init();
            } else {
              this.toaster.showErrorToast(response.message);
            }
          },
          error: (error) => {
            console.error(error);
            this.toaster.showErrorToast(error.error?.error || 'Workspace Delete failed!');
          }
        });
    }
  }

  //#endregion
}