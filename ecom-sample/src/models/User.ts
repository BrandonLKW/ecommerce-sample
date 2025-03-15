export enum UserAccountType {
    PUBLIC = "PUBLIC",
    ADMIN = "ADMIN"
}

export class User{
    id: number = 0;
    account_type: UserAccountType = UserAccountType.PUBLIC;
    name_first: string = "";
    name_last: string = "";
    email: string = "";
    password: string = "";
    address_1: string = "";
    address_2: string = "";

    constructor(obj: Partial<User>){
        Object.assign(this, obj);
    }
}