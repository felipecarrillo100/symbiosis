import {
    IonButtons,
    IonContent,
    IonFab, IonFabButton, IonFabList,
    IonHeader,
    IonIcon,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {LuciadMap} from "../../components/luciad/LuciadMap";
import {Map} from "@luciad/ria/view/Map";

import '../Page.scss';
import './LuciadMapPage.scss';
import {useDispatch, useSelector} from "react-redux";
import {IAppState} from "../../reduxboilerplate/store";
import {
    SetLuciadMap,
    SetLuciadMapCurrentlayer,
    SetLuciadMapProj,
    SetLuciadMapTreeNode
} from "../../reduxboilerplate/luciadmap/actions";
import TreeNodeInterface from "../../interfaces/TreeNodeInterface";
import {ApplicationCommandsTypes} from "../../commands/ApplicationCommandsTypes";
import {LayerConnectCommandsTypes} from "../../commands/ConnectCommands";
import {CreateCommand} from "../../commands/CreateCommand";
import {SetAppCommand} from "../../reduxboilerplate/command/actions";
import {ApplicationCommands} from "../../commands/ApplicationCommands";
import {FileUtils} from "../../utils/FileUtils";
import {useEffect, useState} from "react";
import {
    ellipsisVerticalCircleOutline, locateOutline,
    resizeOutline, scanOutline,
} from "ionicons/icons";

import {EditTools} from "./toolbars/EditTools";
import {ControllerToolSelector} from "./toolbars/ControllerToolSelector";
import {LocationFabButton} from "./toolbars/LocationFabButton";
import {Capacitor} from "@capacitor/core";
import {IonicFileUtils} from "../../ionictools/IonicFileUtils";
import {ScreenMessage} from "../../screen/ScreenMessage";

const defaultFilename = "noname.wsp";
interface StateProps {
    proj: string;
    command: ApplicationCommandsTypes | null;
    map: Map | null;
}

const LuciadMapPage: React.FC = () => {

    const [workspaceName, setWorkspaceName ] = useState(defaultFilename);

    const dispatch = useDispatch();

    const { proj, command, map} = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            proj: state.luciadMap.proj,
            command: state.appCommand.command,
            map: state.luciadMap.map,
        }
    });

    const workspaceRestore = (parameters: {proj: string; layerCommand: LayerConnectCommandsTypes; mapState: any}) => {
        restoreMap(parameters);
    }

    const workspaceSave = (parameters: {filename: string}) => {
        setWorkspaceName(parameters.filename);
        const command = CreateCommand({
            action: ApplicationCommands.MAPSAVESTATUS
        });
        dispatch(SetAppCommand(command));
    }

    const workspaceNew = () => {
        setWorkspaceName(defaultFilename);
        const command = CreateCommand({
            action: ApplicationCommands.MAPRESET
        });
        dispatch(SetAppCommand(command));
    }

    useEffect(()=>{
        if (command) {
            switch (command.action) {
                case ApplicationCommands.WORKSPACERESTORE:
                    workspaceRestore(command.parameters);
                    break;
                case ApplicationCommands.WORKSPACESAVE:
                    workspaceSave(command.parameters);
                    break;
                case ApplicationCommands.WORKSPACENEW:
                    workspaceNew();
                    break;
            }
        }
    }, [command] );

    const storeMapToRedux = (map: Map | null) => {
        dispatch(SetLuciadMap(map));
    }

    const storeTreeNodeToRedux = (node: TreeNodeInterface | null) => {
        dispatch(SetLuciadMapTreeNode(node));
    }

    const storeCurrentLayerToRedux = (layerId: string | null) => {
        dispatch(SetLuciadMapCurrentlayer(layerId));
    }

    const onSaveMap = (mapStatus: { mapState: any; proj: string; layerCommand: LayerConnectCommandsTypes } | null) => {
        if (mapStatus) {
            console.log(mapStatus);
            const platform = Capacitor.getPlatform();
            if (platform!=="web") {
                IonicFileUtils.downloadToLocalFolder(JSON.stringify(mapStatus), workspaceName, "application/json").then((saved)=>{
                    if (saved) ScreenMessage.info("File saved");
                })
            } else {
                FileUtils.download(JSON.stringify(mapStatus), workspaceName, "application/json");
            }
        }
    }
    const restoreMap = (mapStatus: {mapState: any; proj: string; layerCommand: LayerConnectCommandsTypes}) => {
        dispatch(SetLuciadMapProj(mapStatus.proj));
        setTimeout(()=>{
            const command = CreateCommand({
                action: ApplicationCommands.MAPRESTORE,
                parameters: {
                    layerCommand: mapStatus.layerCommand,
                    mapState: mapStatus.mapState,
                }
            })
            dispatch(SetAppCommand(command));
        }, 10);
    }

    const pageTitle = "Map" + " (" + workspaceName + ")";


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton/>
                    </IonButtons>
                    <IonTitle>{pageTitle}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen style={{position: "relative"}}>
                <div className={"MapContainer " }>
                    <LuciadMap proj={proj} onMapChange={storeMapToRedux} command={command}  onLayersChange={storeTreeNodeToRedux} onCurrentLayersChange={storeCurrentLayerToRedux} onSaveMap={onSaveMap}/>
                </div>

                <IonFab vertical="top" horizontal="end" slot="fixed" >
                    <IonFabButton color="light">
                        <IonIcon icon={ellipsisVerticalCircleOutline} />
                    </IonFabButton>
                    <IonFabList side="bottom">
                        <ControllerToolSelector map={map} />
                    </IonFabList>
                    <IonFabList side="start">
                        <EditTools />
                    </IonFabList>
                </IonFab>

                <IonFab vertical="bottom" horizontal="end" slot="fixed" >
                    <LocationFabButton />
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export {
    LuciadMapPage
};
