import { Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CollaborationService implements OnDestroy {
  private hubConnection: HubConnection | undefined;
  private taskUpdateSubject = new BehaviorSubject<any>(null);
  private taskOrderUpdateSubject = new BehaviorSubject<any>(null);
  public cursorUpdates$ = new BehaviorSubject<any>(null); // Stores cursor updates
  public getUserName?:string
  constructor() { }

  public startConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7297/taskHub")  // Replace with actual backend URL
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection.start().then(() => {
      console.log("✅ SignalR connection established.");
    }).catch(err => console.error("❌ Error: ", err));
    this.hubConnection.start().catch(err => console.error("❌ Error starting SignalR:", err));

    // ✅ Listen for remote cursor updates
    this.hubConnection.on("ReceiveCursorPosition", (userId, x, y) => {
      this.cursorUpdates$.next({ userId, x, y });
    });
 
    this.registerTaskUpdates();
    this.registerTaskOrderUpdates();
  }

  private registerTaskUpdates() {
    if (this.hubConnection) {
      this.hubConnection.on("ReceiveTaskUpdates", (taskAction: string, taskData: string) => {
        console.log("📡 Received task update:", taskAction, taskData);
        this.taskUpdateSubject.next({ taskAction, taskData });
      });
    }
  }

  private registerTaskOrderUpdates() {
    if (this.hubConnection) {
      this.hubConnection.on("ReceiveTaskOrderUpdates", (taskAction: string, taskData: string) => {
        console.log("📡 Received task order update:", taskAction, taskData);
        this.taskOrderUpdateSubject.next({ taskAction, taskData });
      });
    }
  }

  public get taskUpdates$(): Observable<any> {
    return this.taskUpdateSubject.asObservable();
  }

  public get taskOrderUpdates$(): Observable<any> {
    return this.taskOrderUpdateSubject.asObservable();
  }

  public broadcastTaskChanges(taskAction: string, taskData: string) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('BroadcastTaskChanges', taskAction, taskData)
        .catch(err => console.error("❌ Error broadcasting task changes: ", err));
    } else {
      console.warn("⚠️ Cannot broadcast changes. SignalR connection is not established.");
    }
  }

  public broadcastTaskOrderChanges(taskAction: string, taskData: string) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('BroadcastTaskOrderChanges', taskAction, taskData)
        .catch(err => console.error("❌ Error broadcasting task order changes: ", err));
    } else {
      console.warn("⚠️ Cannot broadcast changes. SignalR connection is not established.");
    }
  }


  // ✅ Send cursor position to SignalR
public broadcastCursorPosition(x: number, y: number) {
  const userId = localStorage.getItem("userId"); // Unique User ID
  // Ensure that `currentUser` is correctly parsed as an object from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // Check if currentUser has necessary properties
  if (userId && currentUser) {
    // Send cursor position to SignalR with userId and cursor coordinates
    this.hubConnection?.invoke("BroadcastCursorPosition", currentUser, x, y)
      .catch(err => console.error("Error broadcasting cursor position:", err));
  } else {
    console.error("User data is missing or invalid");
  }
}

  ngOnDestroy() {
    this.hubConnection?.stop().then(() => console.log("🔴 SignalR connection stopped."))
      .catch(err => console.error("❌ Error stopping connection: ", err));
  }
}
