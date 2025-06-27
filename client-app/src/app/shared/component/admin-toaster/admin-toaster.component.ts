import { Component, OnInit } from '@angular/core';
import { AdminToasterService } from '../../../core/services/common/admin-toaster.service';

export interface Toast {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

@Component({
  selector: 'app-admin-toaster',
  templateUrl: './admin-toaster.component.html',
  styleUrls: ['./admin-toaster.component.css']
})
export class AdminToasterComponent implements OnInit {
  public toast: Toast | null = null;
  public isVisible: boolean = false;
  toastTransform: string = 'translateX(400px)';
  timeoutId: any;
  toasts: Toast[] = [];
  toastType:string="";
  constructor(private _toaster: AdminToasterService) {}

  ngOnInit(): void {
    console.log("toaster componets " )
    this._toaster.currentToast.subscribe((toast: Toast | null) => {
      if (toast) {
        this.toastType=toast.type
        this.toast=toast;
        this.toasts.push(toast);
        setTimeout(() => this.removeToast(toast), 4000); // Remove toast after 3 seconds
      }
    });
  }

  removeToast(toast: Toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }


  
}
