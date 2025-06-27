import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActiveLinksService } from '../../../core/services/common/active-links.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-event-task',
  templateUrl: './event-task.component.html',
  styleUrl: './event-task.component.css'
})
export class EventTaskComponent implements OnInit, OnDestroy,OnChanges  {
 
  private activeLinkSubscription!: Subscription;
  public activeLink = false;

  constructor(private activeLinksService: ActiveLinksService) {}
  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    // Subscribe to the ActiveLinksService to update activeLink
    this.activeLinkSubscription = this.activeLinksService.currentActive.subscribe(
      (isActive) => {
        if (isActive !== null) {
          this.activeLink = isActive;
        }
      }


    );
    console.log("Active link",this.activeLink);
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.activeLinkSubscription) {
      this.activeLinkSubscription.unsubscribe();
    }
  }

}
