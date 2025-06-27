import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { BaseComponent } from '../../../../shared/component/base/base.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActiveLinksService, IAddTaskCardRequest, IAddTaskListRequest, ITaskList, ITaskListOrderUpdate, ITaskOrderUpdate, IUpdateTaskListOrderRequest, IUpdateTaskListRequest, IUpdateTaskOrderRequest, IWorkspace, TaskCard, TaskCardResponseFoTasklist, TaskService, TaskStatus } from '../../../../core';
import { Observable, Subscription, finalize, map, of, switchMap, tap } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { markFormGroupTouched } from '../../../../shared';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceMemberComponent } from '../workspace-member/workspace-member.component';
import { SignalRServiceService } from '../../../../core/services/signalR/signal-rservice.service';
import { CollaborationService } from '../../../../core/services/signalR/collaboration.service';

interface MousePosition {
  userId: string;
  userName: string;
  x: number;
  y: number;
}
@Component({
  selector: 'app-task-list',
  templateUrl: './task-list2.component.html',
  styleUrls: ['./task-list2.component.css']
})
export class TaskList2Component extends BaseComponent {
  @ViewChild(WorkspaceMemberComponent) openWorkpaceMember!: WorkspaceMemberComponent;

  showListInput = false; // Add List Input Box Visibility
  showCardInput: { [key: number]: boolean } = {}; // Tracks visibility for each list
  public messages: { user: string, message: string }[] = [];
  public message!: string;
  public user!: string;
  public getUserName!:string

  private _workspaceId!: string;  // Set workspace ID dynamically
  tasklists: ITaskList[] = [];
  taskCard!: TaskCard;
  addTaskList!: IAddTaskListRequest;
  workspace!: IWorkspace;
  private taskSubscription: Subscription | undefined;


  remoteCursors: { [userId: string]: { x: number, y: number, userName: string } } = {};
  public isLoading: boolean = false;

  public addTasklistForm = new FormGroup({
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
    private signalRService: SignalRServiceService,private collaborationService:CollaborationService,
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


    this.collaborationService.startConnection();
    this.collaborationService.taskOrderUpdates$.subscribe(update => {
      if (update && update.taskAction === 'UPDATE') {
        const updatedTaskData = JSON.parse(update.taskData);
        this.applyTaskOrderChanges(updatedTaskData);
      }
      else{
        const updatedTaskData = JSON.parse(update.taskData);

        this.applyTaskCardChanges(updatedTaskData)
      }
    });
    this.taskSubscription = this.collaborationService.taskUpdates$.subscribe(update => {
      if (update) {
        this.handleTaskUpdate(update.taskAction, update.taskData);
      }
    });

    //Mouse Cursor
  // Capture local user's cursor position
  document.addEventListener("mousemove", (event) => {
    this.collaborationService.broadcastCursorPosition(event.clientX, event.clientY);
  });

  // Listen for remote users' cursor positions
  this.collaborationService.cursorUpdates$.subscribe(update => {
    if (update) {
      const { userId, userName, x, y } = update;
      const displayName = userId === localStorage.getItem("userId") ? 'Me' : userName;
      this.remoteCursors[userId] = { x, y, userName: displayName };
    }
  });
  this.getUserName=localStorage.getItem('currentUser')??''


  }


  protected override onViewInit(): void { }
  protected override onDestroy(): void {
    if (this.taskSubscription) {
      this.taskSubscription.unsubscribe();
      this.collaborationService.cursorUpdates$.unsubscribe()
      this.remoteCursors = {};  // Clear remote cursors when component is destroyed

    }
    
   }

  openWorkspaceMember() {
    console.log(this._workspaceId);
    this.openWorkpaceMember.openWorkspaceMember(this._workspaceId);
  }
  public objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
  

  private handleTaskUpdate(taskAction: string, taskData: any) {
    console.log("Received task update:", taskAction, taskData);
  debugger
    if (typeof taskData === 'string') {
      try {
        taskData = JSON.parse(taskData);
      } catch (error) {
        console.error("Error parsing taskData:", error);
        return;
      }
    }
  
    switch (taskAction) {
      case "ADD":
        this.tasklists = [...this.tasklists, taskData]; // Create new reference
        console.log("Task List After Add:", this.tasklists);
        break;
  
        case "ADD-CARD":
          debugger
          // Find the task list with the matching listId
          const taskListToUpdate = this.tasklists.find(list => list.listId === taskData.taskListId);
        console.log(taskListToUpdate)
          if (taskListToUpdate) {
            // Ensure the cards array exists, if not, initialize it as an empty array
            if (!taskListToUpdate.cards) {
              taskListToUpdate.cards = [];
            }
        
            // Create the new task card object
            const newTaskCard: TaskCardResponseFoTasklist = {
              taskCardId: taskData.taskCardId,
              title: taskData.title,
              taskListId: taskListToUpdate.listId,
              coverImage: taskData.coverImage,
              createdAt: taskData.createdAt ?? '',
              progress: taskData.progress,
            };
        
            // Add the new task card to the cards array
            taskListToUpdate.cards.push(newTaskCard);
        
            // Recreate the tasklists array to maintain immutability
            this.tasklists = [...this.tasklists];
        
            console.log("Task List After Add Card:", this.tasklists);
          } else {
            console.error("Task list not found for ADD-CARD:", taskData.listId);
          }
          break;
        
    
        
      case "UPDATE":
        this.tasklists = this.tasklists.map(t => 
          t.listId === taskData.listId ? taskData : t
        );
        console.log("Task List After Update:", this.tasklists);
        break;
  
        case "DELETE":
          console.log("Before Delete:", this.tasklists);
        
          // Ensure taskData has listId
          if (!taskData.listId) {
            console.error("Invalid DELETE request: Missing listId", taskData);
            return;
          }
        
          const initialLength = this.tasklists.length;
          this.tasklists = this.tasklists.filter(t => t.listId !== taskData.listId);
        
          console.log("After Delete:", this.tasklists);
        
          if (this.tasklists.length === initialLength) {
            console.warn("No matching listId found for DELETE:", taskData.listId);
          }
        
          break;
          case "DELETE-CARD":
            console.log("Before Delete:", this.tasklists);
          
            if (!taskData.taskCardId || !taskData.listId) {
              console.error("Invalid DELETE request: Missing taskCardId or listId", taskData);
              return;
            }
          
            // Find the task list with the matching listId
            const taskListToUpdateCard = this.tasklists.find(list => list.listId === taskData.listId);
            
            if (taskListToUpdateCard && taskListToUpdateCard.cards) {
              // Remove the task card by taskCardId
              taskListToUpdateCard.cards = taskListToUpdateCard.cards.filter(card => card.taskCardId !== taskData.taskCardId);
          
              console.log("After Delete:", this.tasklists);
          
              // If no matching task card is found, warn
              if (taskListToUpdateCard.cards.length === 0) {
                console.warn("No matching task card found for DELETE:", taskData.taskCardId);
              }
            }
            break;
          
          
      default:
        console.warn("Unknown task action:", taskAction);
    }
  
    // Force UI to update
    this.cdr.detectChanges();
  }
  private applyTaskOrderChanges(updatedTaskData: ITaskListOrderUpdate[]) {
    console.log("Before update:", this.tasklists);
  
    // Update the task lists with the new display order
    updatedTaskData.forEach(update => {
      const taskList = this.tasklists.find(t => t.listId === update.listId);
      if (taskList) {
        taskList.displayOrder = update.displayOrder;
      }
    });
  
    // Sort task lists by displayOrder
    this.tasklists = [...this.tasklists].sort((a, b) => a.displayOrder - b.displayOrder);
  
    console.log("After update:", this.tasklists);
  }
  private applyTaskCardChanges(updatedCards: ITaskOrderUpdate[]) {
    console.log("📡 Received task order update:", updatedCards);

    updatedCards.forEach(updatedCard => {
        let movedCard: any = null;

        //  Find and remove the existing card from its old list
        this.tasklists.forEach(list => {
            const index = list.cards.findIndex(card => card.taskCardId === updatedCard.taskCardId);
            if (index !== -1) {
                movedCard = list.cards.splice(index, 1)[0]; // 🔥 Extract full task card object
            }
        });

        //  If the card was found, update its properties
        if (movedCard) {
            movedCard.taskListId = updatedCard.newTaskListId;
            movedCard.position = updatedCard.newPosition;
        } else {
            console.warn(" Task card not found in any list:", updatedCard.taskCardId);
            return; // Exit early if card wasn't found
        }

        //  Find the new target list and insert the card at the correct position
        const targetList = this.tasklists.find(list => list.listId === updatedCard.newTaskListId);
        if (targetList) {
            targetList.cards.splice(updatedCard.newPosition - 1, 0, movedCard);
            console.log(` Task Card ${movedCard.taskCardId} moved to List ${updatedCard.newTaskListId} at Position ${updatedCard.newPosition}`);
        } else {
            console.error(" Target list not found:", updatedCard.newTaskListId);
        }
    });

    this.cdr.detectChanges(); //  Ensure UI updates immediately
}

  

  sendTaskUpdate(taskAction: string, taskData: string) {
    this.collaborationService.broadcastTaskChanges(taskAction, taskData);
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

  onTaskCardDropd(event: CdkDragDrop<any[]>): void {
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
        this.collaborationService.broadcastTaskOrderChanges("UPDATE-CARD", JSON.stringify(updates));

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
        this.collaborationService.broadcastTaskOrderChanges("UPDATE", JSON.stringify(updates));

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
              this.sendTaskUpdate('ADD', JSON.stringify(response.data));

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
          this.sendTaskUpdate('DELETE', JSON.stringify({ listId: list.listId }));

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
  
      // Ensure tasklist.listId is not undefined
      if (!tasklist.listId) {
        console.error("Task List ID is undefined or null:", tasklist);
        return;
      }
  
      let req: IAddTaskCardRequest = {
        title: this.addTaskCardForm.controls["title"].value ?? "",
        taskListId: tasklist.listId ?? "",
      };
  
      this._taskService.addTaskCard(req)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            console.log("Response:", response);
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
  
                // Broadcast task changes
                this.collaborationService.broadcastTaskChanges('ADD-CARD', JSON.stringify(newTaskCard));
  
                // Update tasklists array
                this.tasklists = [...this.tasklists];  // Trigger Angular change detection
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
            console.error("Error in saving task card:", error);
            this.toaster.showErrorToast(error.error?.error || 'Workspace creation failed!');
          }
        });
    } else {
      markFormGroupTouched(this.addTasklistForm);
    }
  }
  

  public deleteTaskCard(id: string,listId:string) {
    this.isLoading = true;
    if (id) {
      this._taskService.deleteTaskCard(id)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            if (response.flag) {
              this.toaster.showSuccessToast(response.message);

   // Find the list and remove the task card by taskCardId
   const taskListToUpdate = this.tasklists.find(list => list.listId === listId);
   if (taskListToUpdate && taskListToUpdate.cards) {
     taskListToUpdate.cards = taskListToUpdate.cards.filter(card => card.taskCardId !== id);
     this.sendTaskUpdate('DELETE-CARD', JSON.stringify({ taskCardId: id, listId: listId }));
   }

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