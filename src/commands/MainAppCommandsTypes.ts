
import {ApplicationCommands} from "./ApplicationCommands";
import {ScreenMessageTypes} from "../interfaces/ScreenMessageTypes";

interface MainAppShowToast {
    action: ApplicationCommands.APPTOAST;
    parameters: {
        type: ScreenMessageTypes
        message: string;
    }
}


export type MainAppCommandsTypes = MainAppShowToast
