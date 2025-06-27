import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
export interface Toast {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}
@Injectable({
  providedIn: 'root'
})
export class AdminToasterService {


  private toastSubject = new BehaviorSubject<Toast | null>(null);
  currentToast = this.toastSubject.asObservable();


  
  showToast(toast: Toast) {
    debugger
    this.toastSubject.next(toast);
  }

  clearToast() {
    this.toastSubject.next(null);
  }

  showSuccessToast(message: string) {
    const toast: Toast = { type: 'success', title: 'Success', message };
    this.showToast(toast);
  }

  showErrorToast(message: string) {
    const toast: Toast = { type: 'error', title: 'Error', message };
    this.showToast(toast);
  }

  showWarningToast(message: string) {
    const toast: Toast = { type: 'warning', title: 'Warning', message };
    this.showToast(toast);
  }

  showInfoToast(message: string) {
    const toast: Toast = { type: 'info', title: 'Info', message };
    this.showToast(toast);
  }

 
}
