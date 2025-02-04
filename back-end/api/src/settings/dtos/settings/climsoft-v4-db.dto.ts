import { SettingsParametersValidity } from "../update-general-setting.dto";

export class ClimsoftV4DBSettingsDto implements SettingsParametersValidity {
    saveToV4DB: boolean;
    serverIPAddress: string; // e.g., 'localhost' or the server's IP address
    username: string   // MariaDB username
    password: string;  // MariaDB password
    databaseName: string; // MariaDB database name 
    port: number;
    utcOffset: number; // utc hours to offset when saving to v4 database
    //elementsMapper: { v4Id: number, v5Id: number}[];

    isValid(): boolean {
        return true; // TODO.
    }
}



