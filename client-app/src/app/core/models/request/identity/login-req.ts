export interface ILoginRequests {
    email: string;
    password: string;
    rememberMe:boolean

    
}

export interface IExternalAuthRequest {
  idToken: string;
}