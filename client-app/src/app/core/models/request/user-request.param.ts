export interface IUserUpdateReq {
    id: string;
   // userName: string;
    email: string;
    mobileNo: string | null;
    firstName: string;
    middleName: string | null;
    lastName: string | null;
   // emailConfirmed: boolean | null;
   // profileImageUrl: string;
   newProfileImage:File |null;
}


export interface IChangePasswordReq {
    currentPassword: string | null;
    newPassword: string;
}

export interface IEmailExistReq {
    email: string | null;
}

export interface ForgetPasswordSendEmailRequest {
    email: string;
    clientUrlForgetPassword: string;
}

export interface IForgotPassword {
    userName: string;
    token:string
    newPassword:string
  }
  export interface UserEmailsRequest
{
    email:[]
}
