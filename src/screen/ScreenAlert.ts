import {store} from "../reduxboilerplate/store";
import {CreateCommand} from "../commands/CreateCommand";
import {ApplicationCommands} from "../commands/ApplicationCommands";
import {SetAppCommand} from "../reduxboilerplate/command/actions";
import {AlertButton} from "@ionic/core/components";

class ScreenAlert {
    static alert(options: { header: string; message: string; buttons?: AlertButton[] }) {
        const command = CreateCommand({
            action: ApplicationCommands.APPALERT,
            parameters: options
        })
        store.dispatch(SetAppCommand(command));
    }
}

export {
    ScreenAlert
}