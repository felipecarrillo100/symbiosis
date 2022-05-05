
import {ApplicationCommands} from "./ApplicationCommands";
import {ScreenMessageTypes} from "../interfaces/ScreenMessageTypes";
import {AlertButton} from "@ionic/core/components";

interface MainAppShowToast {
    action: ApplicationCommands.APPTOAST;
    parameters: {
        type: ScreenMessageTypes
        message: string;
    }
}

interface MainAppShowAlert {
    action: ApplicationCommands.APPALERT;
    parameters: {
        header: string;
        message: string;
        buttons?: AlertButton[];
    }
}



export type MainAppCommandsTypes = MainAppShowToast | MainAppShowAlert
