export interface CreateUserModel{
    name: string;
    email: string;  
    phone: string;
    roleId: number;   
    authorisedStationIds: string[] | null;
    extraMetadata: string | null;
    disabled: boolean;
}