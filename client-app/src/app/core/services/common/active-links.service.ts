import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActiveLinksService {
  private activeLinkSubject = new BehaviorSubject<boolean | null>(null);
  currentActive = this.activeLinkSubject.asObservable();


  constructor() { }

  activeLink(message: boolean) {
    debugger
    this.activeLinkSubject.next(message);
  }

 
}
