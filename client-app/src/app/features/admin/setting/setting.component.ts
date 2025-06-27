import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActiveLinksService } from '../../../core/services/common/active-links.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit, OnDestroy {
  private activeLinkSubscription!: Subscription;
  public activeLink = false;

  constructor(private activeLinksService: ActiveLinksService) {}

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
