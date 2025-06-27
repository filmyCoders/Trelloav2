import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '.';
import { AdminToasterService } from './services/common/admin-toaster.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptor/auth-interceptor.interceptor';
import { ActiveLinksService } from './services/common/active-links.service';



@NgModule({
  declarations: [],
   
  imports: [
    CommonModule
  ],
  providers:[AuthService,AdminToasterService,ActiveLinksService, {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}
