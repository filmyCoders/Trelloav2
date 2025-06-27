import { Role } from "./enums/roles.enum";

export interface IUser {
    id: string;
    userName: string;
    email: string;
    mobileNo: string | null;
    firstName: string;
    middleName: string | null;
    lastName: string | null;
    emailConfirmed: boolean | null;
    profileImageUrl: string;
    role: Role;

}