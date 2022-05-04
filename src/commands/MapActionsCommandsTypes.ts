import {ApplicationCommands} from "./ApplicationCommands";
import {LayerConnectCommandsTypes} from "./ConnectCommands";

interface MapRefreshLayers {
    action: ApplicationCommands.REFRESHLAYERS;
}

interface MapSaveStatus {
    action: ApplicationCommands.MAPSAVESTATUS;
}

interface MapRestore {
    action: ApplicationCommands.MAPRESTORE;
    parameters: {
        layerCommand: LayerConnectCommandsTypes,
        mapState: any,
    }
}

interface MapReset {
    action: ApplicationCommands.MAPRESET;
}

interface WorkSpaceRestore {
    action: ApplicationCommands.WORKSPACERESTORE;
    parameters: {
        proj: string;
        layerCommand: LayerConnectCommandsTypes,
        mapState: any,
    }
}

interface WorkSpaceSave {
    action: ApplicationCommands.WORKSPACESAVE;
    parameters: {
        filename: string;
    }
}

interface WorkSpaceNew {
    action: ApplicationCommands.WORKSPACENEW;
}


export type MapActionsCommandsTypes = MapRefreshLayers | MapSaveStatus | MapRestore | MapReset | WorkSpaceRestore | WorkSpaceSave | WorkSpaceNew
