import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminModule } from './modules/admin-modules/admin/admin.module';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { RootModule } from './modules/root/root.module';
import { AuthInterceptor } from './core/interceptor/auth-interceptor.interceptor';
import { ToastrModule } from 'ngx-toastr';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PostViewComponent } from './features/admin/post-folder/post-view/post-view.component';
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    PostViewComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    CoreModule,
    SharedModule,
    HttpClientModule,
    AdminModule,
    AuthModule,
    RootModule,
    ToastrModule.forRoot(), 
    BrowserAnimationsModule,
    DragDropModule,
    SocialLoginModule, // Keep it here only,
    GoogleSigninButtonModule

  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.googleLoginClientId, {
              oneTapEnabled: false, // ✅ Remove redirectUri
              prompt: "select_account"
            }),
          },
        ],
      } as SocialAuthServiceConfig,
    }
    
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
