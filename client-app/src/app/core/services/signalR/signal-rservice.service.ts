import { Injectable } from "@angular/core";
import * as signalR from '@microsoft/signalr';
import { environment } from "../../../../environments/environment";

interface MousePosition {
  userId: string;
  userName: string;
  x: number;
  y: number;
}

interface TaskMovedEvent {
  userId: string;
  userName: string;
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  newIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRServiceService {
  private hubConnection!: signalR.HubConnection;
  private isConnectionStarted = false;

  constructor() {
    this.initializeConnection();
  }

  // Initialize the SignalR connection
  private initializeConnection(): void {
  this.hubConnection = new signalR.HubConnectionBuilder()
  .withUrl('https://localhost:7297/collaborationHub', {
    skipNegotiation: false,
    transport: signalR.HttpTransportType.WebSockets,
    withCredentials: true
  })
  .build();

this.hubConnection.start()
  .then(() => {
    console.log('SignalR connection started successfully.');
  })
  .catch((err) => {
    console.error('Error while starting SignalR connection:', err);
  });

    // Handle connection closed events
    this.hubConnection.onclose((error) => {
      console.log('SignalR connection closed. Attempting to reconnect...');
      this.isConnectionStarted = false;
      setTimeout(() => this.startConnection(), 5000); // Retry after 5 seconds
    });
  }

  // Start the SignalR connection
  public startConnection(): void {
    if (this.hubConnection.state === signalR.HubConnectionState.Disconnected && !this.isConnectionStarted) {
      this.isConnectionStarted = true;
      this.hubConnection.start()
        .then(() => {
          console.log('SignalR connection started successfully.');
        })
        .catch((err) => {
          console.error('Error while starting SignalR connection:', err);
          this.isConnectionStarted = false; // Reset flag on error
        });
    }
  }


  public sendMessage(user: string, message: string): void {
    this.hubConnection.invoke('SendMessage', user, message)
      .catch(err => console.error('Error while sending message: ' + err));
  }

  public receiveMessage(callback: (user: string, message: string) => void): void {
    this.hubConnection.on('ReceiveMessage', callback);
  }

  sendMouseMove(userId: string, x: number, y: number): void {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('BroadcastMouseMove', userId, x, y)
        .catch((err) => console.error('Error sending mouse move: ', err));
    } else {
      console.warn('SignalR connection is not active. Retrying...');
      setTimeout(() => this.sendMouseMove(userId, x, y), 2000); // Retry after 2 seconds
    }
  }
  
  onMouseMove(callback: (userId: string, x: number, y: number) => void): void {
    this.hubConnection.on('ReceiveMouseMove', callback);
  }

  // Listen for mouse movement events
  onMouseMoved(callback: (data: MousePosition) => void): void {
    this.hubConnection.on('MouseMoved', callback);
  }

  // Listen for task moved events
  onTaskMoved(callback: (data: TaskMovedEvent) => void): void {
    this.hubConnection.on('TaskMoved', callback);
  }

  // Send mouse position to the server
  sendMousePosition(data: MousePosition): void {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('SendMousePosition', data.userId, data.userName, data.x, data.y)
        .catch((err) => {
          console.error('Error sending mouse position:', err);
        });
    } else {
      console.warn('SignalR connection is not active. Cannot send mouse position.');
    }
  }

  // Send drag-and-drop event to the server
  sendDragDropEvent(data: TaskMovedEvent): void {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('SendDragDropEvent', data.userId, data.userName, data.taskId, data.fromColumnId, data.toColumnId, data.newIndex)
        .catch((err) => {
          console.error('Error sending drag-and-drop event:', err);
        });
    } else {
      console.warn('SignalR connection is not active. Cannot send drag-and-drop event.');
    }
  }
}