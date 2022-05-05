import {store} from "../reduxboilerplate/store";
import {CreateCommand} from "../commands/CreateCommand";
import {ApplicationCommands} from "../commands/ApplicationCommands";
import {ScreenMessageTypes} from "../interfaces/ScreenMessageTypes";
import {SetAppCommand} from "../reduxboilerplate/command/actions";

class ScreenMessage {
    static error(message: string) {
        const command = CreateCommand({
            action: ApplicationCommands.APPTOAST,
            parameters: {
                message,
                type: ScreenMessageTypes.ERROR
            }
        })
        store.dispatch(SetAppCommand(command));
    }

    static info(message: string) {
        const command = CreateCommand({
            action: ApplicationCommands.APPTOAST,
            parameters: {
                message,
                type: ScreenMessageTypes.INFO
            }
        })
        store.dispatch(SetAppCommand(command));
    }

    static warning(message: string) {
        const command = CreateCommand({
            action: ApplicationCommands.APPTOAST,
            parameters: {
                message,
                type: ScreenMessageTypes.WARNING
            }
        })
        store.dispatch(SetAppCommand(command));
    }

    static success(message: string) {
        const command = CreateCommand({
            action: ApplicationCommands.APPTOAST,
            parameters: {
                message,
                type: ScreenMessageTypes.SUCCESS
            }
        })
        store.dispatch(SetAppCommand(command));
    }

}

export {
    ScreenMessage
}